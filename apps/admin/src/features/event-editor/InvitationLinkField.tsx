import type { EventDetail } from "@pokanito/shared";
import { Field, InputGroup } from "@pokanito/ui";
import { WEB_HOST } from "@/lib/api";
import type { EventEditor } from "./useEventEditor";
import { useSlugCheck } from "./useSlugCheck";

/** The invitation's slug, checked for availability as it is typed. */
export default function InvitationLinkField({ event, update }: { event: EventDetail; update: EventEditor["update"] }) {
  const { slug, setSlug, slugState, saved, checking, error } = useSlugCheck(event, update);
  return (
    <Field label="Invitation link" error={error}>
      <InputGroup
        prefix={`${WEB_HOST}/`}
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase())}
        suffix={
          slugState?.ok || saved ? (
            <span className="ui-ok">
              {saved ? "Saved" : "Available"}
            </span>
          ) : checking ? (
            <span className="ui-muted">Checking…</span>
          ) : undefined
        }
      />
    </Field>
  );
}
