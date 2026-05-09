import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UserCircle, UserPlus, LogOut, Receipt } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { logoutAction } from "../auth/actions";
import { t } from "@/lib/i18n";

export const metadata = {
  title: { default: t.account.overview, template: `%s · ${t.account.overview}` },
};

const NAV = [
  { href: "/account", label: t.account.overview, icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: t.account.orders, icon: ShoppingBag },
  { href: "/account/payment-confirmation", label: "Konfirmasi Bayar", icon: Receipt },
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ padding: "64px 8%", display: "grid", gap: 32 }} className="lg:grid-cols-[240px_1fr]">
        <aside style={{ background: "var(--surface)", padding: 24, border: "1px solid var(--border)", height: "fit-content" }}>
          <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
              {t.account.welcome("")}
            </p>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name ?? authUser.email}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{authUser.email ?? ""}</p>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="link-muted"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", fontSize: 14, textDecoration: "none", transition: "all 0.2s" }}
              >
                <Icon style={{ width: 16, height: 16, color: "var(--text-muted)" }} />
                {label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <button
              type="submit"
              className="admin-btn-delete"
              style={{ width: "100%", justifyContent: "flex-start", gap: 12, padding: "8px 12px", fontSize: 14, borderRadius: 0 }}
            >
              <LogOut style={{ width: 16, height: 16 }} />
              {t.nav.logout}
            </button>
          </form>
        </aside>
        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
