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
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reseller-applications", label: "Resellers", icon: UserPlus },
  { href: "/admin/contact-messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/api-keys", label: "API Keys", icon: Key },
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
    <div className="min-h-screen bg-[color:var(--color-cloud-100)]">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-screen">
        <aside className="lg:sticky lg:top-0 lg:h-screen bg-[color:var(--color-navy-900)] text-white px-5 py-6 flex flex-col gap-2">
          <Link
            href="/admin"
            className="text-lg font-bold tracking-tight mb-3 block"
          >
            Juragan Grosir
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
              Admin
            </span>
          </Link>
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-white/10">
            <Link
              href="/"
              className="text-xs text-white/60 hover:text-white"
            >
              ← Back to storefront
            </Link>
          </div>
        </aside>
        <main className="px-5 sm:px-8 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
