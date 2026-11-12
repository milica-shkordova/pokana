import { Button, LoadState, IssueList, useScrollSpy } from "@pokanito/ui";
import AdminLayout from "@/components/AdminLayout";
import BusinessSection from "@/features/settings/BusinessSection";
import { SECTION_IDS } from "@/features/settings/constants";
import DefaultsSection from "@/features/settings/DefaultsSection";
import LinksSection from "@/features/settings/LinksSection";
import PasswordSection from "@/features/settings/PasswordSection";
import RsvpEmailsSection from "@/features/settings/RsvpEmailsSection";
import SettingsNav from "@/features/settings/SettingsNav";
import TeamSection from "@/features/settings/TeamSection";
import { useSettingsForm } from "@/features/settings/useSettingsForm";
import { useSession } from "@/lib/session";

export default function SettingsPage() {
  const { user } = useSession();
  const s = useSettingsForm();
  const { form, remote } = s;

  // Highlight the section in view (the last ones too, at the bottom).
  const [active, selectSection] = useScrollSpy(SECTION_IDS, { enabled: form !== null });

  return (
    <AdminLayout
      kicker="Workspace"
      title="Settings"
      actions={
        <Button onClick={s.save} loading={s.saving} disabled={!s.dirty}>
          Save changes
        </Button>
      }
    >
      <LoadState
        loading={!form && !remote.error}
        error={remote.error}
        onRetry={remote.reload}
      >
        {form && (
          <div className="admin-settings">
            <SettingsNav active={active} onSelect={selectSection} />
            <div className="admin-settings__body">
              <IssueList error={s.error} />
              <BusinessSection form={form} set={s.set} logoSrc={s.logoSrc} onLogoUploaded={s.uploadLogo} />
              <RsvpEmailsSection form={form} set={s.set} menuText={s.menuText} />
              <LinksSection form={form} set={s.set} />
              <DefaultsSection form={form} set={s.set} menuText={s.menuText} onMenuText={s.setMenuText} />
              <TeamSection isOwner={user?.role === "owner"} meId={user?.id} />
              <PasswordSection />
            </div>
          </div>
        )}
      </LoadState>
    </AdminLayout>
  );
}
