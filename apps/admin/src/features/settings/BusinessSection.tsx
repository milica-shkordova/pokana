import type { MediaItem } from "@pokanito/shared";
import { Button, Card, CardHeader, Field, FormGrid, Input, Wordmark } from "@pokanito/ui";
import { UploadButton } from "@/features/media/UploadButton";
import type { SectionProps } from "./types";

export default function BusinessSection({
  form,
  set,
  logoSrc,
  onLogoUploaded,
}: SectionProps & { logoSrc: string | null; onLogoUploaded: (items: MediaItem[]) => void }) {
  return (
    <Card id="business" className="ui-stack">
      <CardHeader
        title="Business profile"
        subtitle="Shown on the landing page, in emails and in the small “Made with Pokanito” footer."
      />
      <div className="admin-logo">
        <div className="admin-logo__tile">
          {logoSrc ? (
            <img src={logoSrc} alt="Your logo" />
          ) : (
            <Wordmark variant="icon" />
          )}
        </div>
        <UploadButton
          eventId={null}
          multiple={false}
          label={form.logoMediaId ? "Change logo" : "Upload logo"}
          onUploaded={onLogoUploaded}
        />
        {form.logoMediaId && (
          <Button
            variant="ghost"
            onClick={() => set("logoMediaId", null)}
          >
            Use the Pokanito logo
          </Button>
        )}
      </div>
      <FormGrid>
        <Field label="Business name">
          <Input
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
          />
        </Field>
        <Field
          label="Contact email"
          hint="Leads and RSVP copies are sent here"
        >
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>
        <Field label="Phone / Viber">
          <Input
            placeholder="+389 …"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Instagram">
          <Input
            placeholder="@pokanito.mk"
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
          />
        </Field>
      </FormGrid>
    </Card>
  );
}
