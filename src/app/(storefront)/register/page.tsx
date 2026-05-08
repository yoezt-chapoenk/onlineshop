import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { t } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/supabase/server";
import RegisterForm from "./RegisterForm";

export const metadata = { title: t.auth.registerTitle };

export default async function RegisterPage() {
  const { authUser } = await getCurrentUser();
  if (authUser) redirect("/account");
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PageHeader title={t.auth.registerTitle} description={t.auth.registerSubtitle} />
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "64px 20px" }}>
        <RegisterForm />
        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
          {t.auth.haveAccount}{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "var(--gold)", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>
            {t.auth.loginHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
