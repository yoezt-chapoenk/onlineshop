"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useTheme } from "@/components/layout/ThemeProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

export interface HeaderAuthState {
  isAuthenticated: boolean;
  displayName: string | null;
}

export default function Header({ auth }: { auth: HeaderAuthState }) {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, isHydrated } = useCart();
  const { isLightMode, toggleLightMode } = useTheme();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/collections" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? "14px 40px" : "22px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "var(--nav-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--scrolled-border)" : "none",
          transition: "all 0.35s ease",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              letterSpacing: "0.18em",
              color: "var(--text)",
              fontWeight: 500,
            }}
          >
            JURAGAN GROSIR
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: "0.16em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                transition: "color 0.2s",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {auth.isAuthenticated ? (
            <Link
              href="/account"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {auth.displayName ?? "Account"}
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Login
            </Link>
          )}

          {/* Light/Dark toggle */}
          <button
            onClick={toggleLightMode}
            title={isLightMode ? "Switch to Dark" : "Switch to Light"}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              cursor: "pointer",
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              flexShrink: 0,
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gold)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {isLightMode ? "☀" : "☽"}
          </button>
          
          <button
            onClick={() => setCartOpen(true)}
            style={{
              position: "relative",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Bag
            </span>
            {isHydrated && itemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -14,
                  background: "var(--gold)",
                  color: "var(--bg)",
                  fontSize: 9,
                  fontWeight: 600,
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
