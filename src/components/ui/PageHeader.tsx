"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: Props) {
  return (
    <section style={{ padding: "140px 8% 80px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 800 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
            <ol style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              <li>
                <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  <Home style={{ width: 14, height: 14 }} />
                </Link>
              </li>
              {breadcrumbs.map((c, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight style={{ width: 14, height: 14, color: "var(--border)" }} />
                  {c.href ? (
                    <Link href={c.href} style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                      {c.label}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--text)" }}>{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        
        {eyebrow && (
          <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 16 }}>
            {eyebrow}
          </div>
        )}
        
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 400, color: "var(--text)", lineHeight: 1.1, marginBottom: 24 }}>
          {title}
        </h1>
        
        {description && (
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 540 }}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
