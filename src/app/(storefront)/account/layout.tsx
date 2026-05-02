import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UserCircle, UserPlus, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { logoutAction } from "../auth/actions";
import { t } from "@/lib/i18n";

export const metadata = {
  title: { default: t.account.overview, template: `%s · ${t.account.overview}` },
};

const NAV = [
  { href: "/account", label: t.account.overview, icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: t.account.orders, icon: ShoppingBag },
  { href: "/account/affiliate", label: "Affiliate", icon: UserPlus },
  { href: "/account/profile", label: t.account.profile, icon: UserCircle },
  { href: "/account/become-reseller", label: t.account.becomeReseller, icon: UserPlus },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, profile } = await getCurrentUser();
  if (!authUser) redirect("/login");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
      <aside className="card p-4 h-fit">
        <div className="px-2 pb-3 mb-3 border-b border-[color:var(--color-line)]">
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">
            {t.account.welcome("")}
          </p>
          <p className="text-sm font-semibold mt-0.5 truncate">{profile?.full_name ?? authUser.email}</p>
          <p className="text-xs text-[color:var(--color-muted)] truncate">{authUser.email ?? ""}</p>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)]"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-3 pt-3 border-t border-[color:var(--color-line)]">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-error)] hover:bg-[color:var(--color-cloud-100)]"
          >
            <LogOut className="h-4 w-4" />
            {t.nav.logout}
          </button>
        </form>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
