import { getCurrentUser } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import ProfileForm from "./ProfileForm";

export const metadata = { title: t.account.profile };

export default async function AccountProfilePage() {
  const { authUser, profile } = await getCurrentUser();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t.account.profile}</h1>
      <ProfileForm
        defaultEmail={authUser?.email ?? ""}
        defaultFullName={profile?.full_name ?? ""}
        defaultPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
