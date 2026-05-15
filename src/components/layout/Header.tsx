"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useSession } from "@/components/auth/SessionProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, isHydrated } = useCart();
  const { isLightMode, toggleLightMode } = useTheme();
  const { user } = useSession();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // rAF-throttled scroll handler — the previous implementation called
    // setState on every scroll event (~120 times/sec on a precision
    // trackpad), re-rendering the entire navbar. Coalescing to one update
    // per animation frame keeps the navbar idle while the user scrolls.
    let frame = 0;
    let lastValue = false;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > 40;
        if (next !== lastValue) {
          lastValue = next;
          setScrolled(next);
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const displayName = user?.fullName ?? user?.email ?? "Account";

  return (
    <>
      <nav className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <Link href="/" className="site-header__logo">
          JURAGAN GROSIR
        </Link>

        <div className="site-header__links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="site-header__link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="site-header__actions">
          {user ? (
            <Link href="/account" className="site-header__link">
              {displayName}
            </Link>
          ) : (
            <Link href="/login" className="site-header__link">
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={toggleLightMode}
            title={isLightMode ? "Switch to Dark" : "Switch to Light"}
            className="site-header__theme"
          >
            {isLightMode ? "☀" : "☽"}
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="site-header__bag"
          >
            <span className="site-header__link">Bag</span>
            {isHydrated && itemCount > 0 && (
              <span className="site-header__bag-badge">{itemCount}</span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
