"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        padding: "64px 8% 40px",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
        <div className="md:col-span-2">
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              letterSpacing: "0.18em",
              color: "var(--text)",
              marginBottom: 16,
            }}
          >
            {SITE_NAME.toUpperCase()}
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.75,
              maxWidth: 280,
            }}
          >
            Handcrafted fashion eyewear. Made in Italy & Japan. Designed for those who see everything.
          </p>
        </div>
        {[
          {
            title: "Shop",
            links: [
              { label: "Kacamata Optik", href: "/collections/eyeglasses" },
              { label: "Kacamata Hitam", href: "/collections/sunglasses" },
              { label: "Kacamata Blue Light", href: "/collections/blue-light" },
              { label: "Aksesoris", href: "/collections/accessories" },
              { label: "Semua Produk", href: "/shop" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "Tentang Kami", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Jadi Reseller", href: "/wholesale" },
              { label: "Jadi Affiliate", href: "/affiliate" },
              { label: "Kontak", href: "/contact" },
            ],
          },
          {
            title: "Support",
            links: [
              { label: "Kebijakan Privasi", href: "/legal/privacy" },
              { label: "Syarat & Ketentuan", href: "/legal/terms" },
              { label: "Pengembalian", href: "/legal/returns" },
              { label: "Pengiriman", href: "/legal/shipping" },
            ],
          },
        ].map((col) => (
          <div key={col.title} className="col-span-1">
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {col.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                    padding: 0,
                    transition: "color 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          © {year} {SITE_NAME.toUpperCase()}. All rights reserved.
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Build With Deadline</div>
      </div>
    </footer>
  );
}
