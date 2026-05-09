import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = { title: t.auth.loginTitle };

export default async function LoginPage() {
  const { authUser } = await getCurrentUser();
  if (authUser) redirect("/account");
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PageHeader title={t.auth.loginTitle} description={t.auth.loginSubtitle} />
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "64px 20px" }}>
        <LoginForm />
        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          {t.auth.noAccount}{" "}
          <Link href="/register" className="link-gold" style={{ fontWeight: 600 }}>
            {t.auth.registerHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
