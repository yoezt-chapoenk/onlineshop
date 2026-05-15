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
          <Link href="/login" className="link-gold" style={{ fontWeight: 600 }}>
            {t.common.back} ke {t.auth.loginCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
