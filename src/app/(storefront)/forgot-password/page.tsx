import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { t } from "@/lib/i18n";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: t.auth.forgotPasswordTitle };

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PageHeader
        title={t.auth.forgotPasswordTitle}
        description={t.auth.forgotPasswordSubtitle}
      />
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "64px 20px" }}>
        <ForgotPasswordForm />
        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          <Link href="/login" style={{ fontWeight: 600, color: "var(--gold)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
            {t.common.back} ke {t.auth.loginCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
