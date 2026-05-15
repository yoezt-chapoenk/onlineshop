import { getCurrentUser } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import BecomeResellerForm from "./BecomeResellerForm";

export const metadata = { title: t.account.becomeReseller };

export default async function BecomeResellerPage() {
  const { authUser, profile } = await getCurrentUser();
  const status = profile?.reseller_status ?? "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>{t.account.becomeReseller}</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>{t.account.resellerExplain}</p>
      </div>

      {status === "pending" && (
        <div style={{ background: "var(--bg2)", padding: 24, border: "1px solid var(--border)", fontSize: 14, color: "var(--text)" }}>
          {t.account.pendingResellerNote}
        </div>
      )}
      {status === "approved" && (
        <div style={{ background: "var(--bg2)", padding: 24, border: "1px solid var(--border)", fontSize: 14, color: "var(--text)" }}>
          {t.account.approvedResellerNote}
        </div>
      )}
      {status === "rejected" && (
        <div style={{ background: "rgba(255, 59, 48, 0.1)", padding: 24, border: "1px solid rgba(255, 59, 48, 0.2)", fontSize: 14, color: "var(--error)" }}>
          {t.account.rejectedResellerNote}
        </div>
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
