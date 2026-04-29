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
    <div>
      <PageHeader title={t.auth.registerTitle} description={t.auth.registerSubtitle} />
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-[color:var(--color-navy-900)] hover:underline">
            {t.auth.loginHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
