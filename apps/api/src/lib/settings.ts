import type { Settings as DbSettings } from "@prisma/client";
import type { PublicSettings, Settings } from "@momentelo/shared";
import { db } from "../db";
import { thumbUrl } from "./media";

const DEFAULT_MENU = ["Месо", "Риба", "Вегетаријанско"];

/** The singleton settings row (created with defaults on first access). */
export async function getSettingsRow(): Promise<DbSettings> {
  return db.settings.upsert({
    where: { id: "settings" },
    update: {},
    create: { id: "settings", defaultMenuOptions: DEFAULT_MENU },
  });
}

export function toSettings(row: DbSettings): Settings {
  return {
    businessName: row.businessName,
    contactEmail: row.contactEmail,
    phone: row.phone,
    instagram: row.instagram,
    logoMediaId: row.logoMediaId,
    senderName: row.senderName,
    fromAddress: row.fromAddress,
    subjectTemplate: row.subjectTemplate,
    ccOwnerOnRsvp: row.ccOwnerOnRsvp,
    clientDailyDigest: row.clientDailyDigest,
    domain: row.domain,
    keepOnlineMonths: row.keepOnlineMonths,
    defaultNoindex: row.defaultNoindex,
    defaultPassword: row.defaultPassword,
    defaultLanguage: row.defaultLanguage as Settings["defaultLanguage"],
    defaultRsvpDeadlineDays: row.defaultRsvpDeadlineDays,
    defaultMenuOptions:
      (row.defaultMenuOptions as string[] | null) ?? DEFAULT_MENU,
  };
}

export async function getSettings(): Promise<Settings> {
  return toSettings(await getSettingsRow());
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const s = await getSettingsRow();
  const logo = s.logoMediaId
    ? await db.media.findUnique({ where: { id: s.logoMediaId } })
    : null;
  return {
    businessName: s.businessName,
    contactEmail: s.contactEmail,
    phone: s.phone,
    instagram: s.instagram,
    logoUrl: logo ? thumbUrl(logo) : null,
  };
}
