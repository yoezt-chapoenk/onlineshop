import { getCurrentUser } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import BecomeResellerForm from "./BecomeResellerForm";

export const metadata = { title: t.account.becomeReseller };

export default async function BecomeResellerPage() {
  const { authUser, profile } = await getCurrentUser();
  const status = profile?.reseller_status ?? "none";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">{t.account.becomeReseller}</h1>
      <p className="text-sm text-[color:var(--color-muted)]">{t.account.resellerExplain}</p>

      {status === "pending" && (
        <div className="card p-4 bg-[color:var(--color-blue-50)] border-[color:var(--color-blue-100)] text-sm">
          {t.account.pendingResellerNote}
        </div>
      )}
      {status === "approved" && (
        <div className="card p-4 bg-[color:var(--color-blue-50)] border-[color:var(--color-blue-100)] text-sm">
          {t.account.approvedResellerNote}
        </div>
      )}
      {status === "rejected" && (
        <div className="card p-4 text-sm">{t.account.rejectedResellerNote}</div>
      )}

      {(status === "none" || status === "rejected") && (
        <BecomeResellerForm
          defaultEmail={authUser?.email ?? ""}
          defaultName={profile?.full_name ?? ""}
          defaultPhone={profile?.phone ?? ""}
        />
      )}
    </div>
  );
}
