"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, LogIn } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useCart } from "@/components/cart/CartProvider";
import { t } from "@/lib/i18n";

export interface HeaderAuthState {
  isAuthenticated: boolean;
  displayName: string | null;
}

export default function Header({ auth }: { auth: HeaderAuthState }) {
  const pathname = usePathname();
  const { itemCount, isHydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[color:var(--color-line)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-[color:var(--color-navy-900)]"
          >
            {SITE_NAME}
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "relative py-2 transition-colors",
                    isActive
                      ? "text-[color:var(--color-navy-900)]"
                      : "text-[color:var(--color-ink)] hover:text-[color:var(--color-navy-900)]",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[color:var(--color-navy-900)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/shop"
              aria-label={t.common.search}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)] transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            {auth.isAuthenticated ? (
              <Link
                href="/account"
                className="hidden sm:inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)] transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[8rem] truncate">{auth.displayName ?? t.nav.account}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)] transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {t.nav.login}
              </Link>
            )}
            <Link
              href="/cart"
              aria-label={t.nav.cart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)] transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span
                aria-live="polite"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[color:var(--color-navy-900)] text-white text-[11px] font-semibold flex items-center justify-center"
              >
                {isHydrated ? itemCount : 0}
              </span>
            </Link>
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)] transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-[color:var(--color-line)] -mx-4 sm:-mx-6 px-4 sm:px-6">
            <ul className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        "block px-3 py-2.5 rounded-lg text-sm font-medium",
                        isActive
                          ? "bg-[color:var(--color-cloud-100)] text-[color:var(--color-navy-900)]"
                          : "text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)]",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2 mt-2 border-t border-[color:var(--color-line)]">
                {auth.isAuthenticated ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)]"
                  >
                    {t.nav.account}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[color:var(--color-ink)] hover:bg-[color:var(--color-cloud-100)]"
                  >
                    {t.nav.login}
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
