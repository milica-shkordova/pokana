import type { Prisma, Template } from "@prisma/client";
import { getDefinition, type TemplateDefinition } from "@pokanito/templates/definitions";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { newEventData, uniqueSlug } from "./events";
import { getSettings } from "./settings";

// A catalog Template is either a layout itself (id = packages/templates
// registry id) or a variant of one (layoutId set): same code, its own name,
// category, thumbnail, status and default content.
//
// Every template's default content lives in a hidden "defaults" event
// (isDefaults) so the regular event editor can edit it. New events start as a
// copy of it.

export const layoutOf = (t: Pick<Template, "id" | "layoutId">) => t.layoutId ?? t.id;

/** The template row plus its code definition. 404s for unknown ids, 400s for unbuilt layouts. */
export async function resolveTemplate(id: string): Promise<{ template: Template; def: TemplateDefinition }> {
  const template = await db.template.findUnique({ where: { id } });
  if (!template) throw new HTTPException(404, { message: "Template not found" });
  const def = getDefinition(layoutOf(template));
  if (!def) throw new HTTPException(400, { message: "This template isn't built yet" });
  return { template, def };
}

/** Returns the template's defaults event, creating it from the code defaults on first use. */
export async function ensureDefaultsEvent(templateId: string) {
  const { template, def } = await resolveTemplate(templateId);
  if (template.defaultsEventId) {
    const existing = await db.event.findUnique({ where: { id: template.defaultsEventId } });
    if (existing) return existing;
  }
  const settings = await getSettings();
  const eventDate = new Date(Date.now() + 365 * 86_400_000);
  const created = await db.event.create({
    data: {
      ...newEventData(def, settings, eventDate),
      slug: await uniqueSlug(`defaults-${template.id}`),
      name: template.name,
      variantId: template.layoutId ? template.id : null,
      eventDate,
      isDefaults: true,
      noindex: true,
      accessCode: null,
    },
  });
  await db.template.update({ where: { id: template.id }, data: { defaultsEventId: created.id } });
  return created;
}

/** Content, theme, sections and languages a new event of this template starts with. */
export async function startingPoint(templateId: string) {
  const { template, def } = await resolveTemplate(templateId);
  const defaults = template.defaultsEventId ? await db.event.findUnique({ where: { id: template.defaultsEventId } }) : null;
  return {
    template,
    def,
    layoutId: layoutOf(template),
    variantId: template.layoutId ? template.id : null,
    copy: defaults
      ? {
          languages: defaults.languages as Prisma.InputJsonValue,
          content: defaults.content as Prisma.InputJsonValue,
          theme: defaults.theme as Prisma.InputJsonValue,
          sections: defaults.sections as Prisma.InputJsonValue,
        }
      : {},
  };
}
