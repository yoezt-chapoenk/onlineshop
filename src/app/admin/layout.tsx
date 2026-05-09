import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  UserPlus,
  MessageSquare,
  Settings,
  FileText,
  Key,
  BookOpen,
  Receipt,
} from "lucide-react";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Juragan Grosir" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reseller-applications", label: "Resellers", icon: UserPlus },
  { href: "/admin/contact-messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/affiliates", label: "Affiliates", icon: Users },
  { href: "/admin/api-keys", label: "API Keys", icon: Key },
  { href: "/admin/api-docs", label: "API Docs", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentUser();
  if (!profile || profile.role !== "admin") {
    redirect("/login");
  }
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ display: "grid", minHeight: "100vh" }} className="lg:grid-cols-[240px_1fr]">
        <aside style={{ 
          position: "sticky", top: 0, height: "100vh", 
          background: "var(--surface)", borderRight: "1px solid var(--border)", 
          padding: "24px 20px", display: "flex", flexDirection: "column", gap: 8,
          overflowY: "auto"
        }}>
          <Link
            href="/admin"
            style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 12, textDecoration: "none", display: "block" }}
          >
            Juragan Grosir
            <span style={{ display: "block", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--gold)", marginTop: 4 }}>
              Admin
            </span>
          </Link>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="link-muted"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {label}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <Link
              href="/"
              className="link-muted"
              style={{ fontSize: 12, textDecoration: "none" }}
            >
              ← Back to storefront
            </Link>
          </div>
        </aside>
        <main style={{ padding: "24px 32px" }}>{children}</main>
      </div>
    </div>
  );
}
