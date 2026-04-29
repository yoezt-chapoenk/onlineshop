import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { t } from "@/lib/i18n";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: t.auth.forgotPasswordTitle };

export default function ForgotPasswordPage() {
  return (
    <div>
      <PageHeader
        title={t.auth.forgotPasswordTitle}
        description={t.auth.forgotPasswordSubtitle}
      />
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
          <Link href="/login" className="font-semibold text-[color:var(--color-navy-900)] hover:underline">
            {t.common.back} ke {t.auth.loginCta}
          </Link>
        </p>
      </div>
    </div>
  );
}
