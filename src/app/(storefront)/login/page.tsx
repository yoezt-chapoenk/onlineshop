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
    <div>
      <PageHeader title={t.auth.loginTitle} description={t.auth.loginSubtitle} />
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <LoginForm />
        <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="font-semibold text-[color:var(--color-navy-900)] hover:underline">
            {t.auth.registerHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
