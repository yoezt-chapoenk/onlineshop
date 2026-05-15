"use client";

import React, { useState } from "react";
import { SITE_NAME } from "@/lib/constants";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section style={{
      background: "var(--surface)",
      padding: "100px 8%",
      textAlign: "center",
      borderTop: "1px solid var(--border)"
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 20 }}>Stay Connected</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 400, color: "var(--text)", marginBottom: 16 }}>
        {SITE_NAME.toUpperCase()}
      </h2>
      <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.7 }}>
        New arrivals, limited editions, and private sales — delivered to your inbox first.
      </p>
      {sent ? (
        <div style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic" }}>
          Thank you. Welcome to OBSCURA.
        </div>
      ) : (
        <form onSubmit={(e) => {e.preventDefault();if (email) setSent(true);}}
          style={{ display: "flex", maxWidth: 440, margin: "0 auto", gap: 0 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" required
            style={{
              flex: 1, background: "var(--bg2)", border: "1px solid var(--border)",
              borderRight: "none", padding: "14px 20px",
              color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)",
              outline: "none"
            }} />
          <button type="submit" style={{
            background: "var(--gold)", color: "var(--bg)", border: "none",
            padding: "14px 28px", fontSize: 11, letterSpacing: "0.18em",
            textTransform: "uppercase", fontFamily: "var(--font-sans)", fontWeight: 500,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
          }}>Subscribe</button>
        </form>
      )}
    </section>
  );
}
