import { getCurrentUser } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import ProfileForm from "./ProfileForm";

export const metadata = { title: t.account.profile };

export default async function AccountProfilePage() {
  const { authUser, profile } = await getCurrentUser();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>{t.account.profile}</h1>
      <ProfileForm
        defaultEmail={authUser?.email ?? ""}
        defaultFullName={profile?.full_name ?? ""}
        defaultPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
