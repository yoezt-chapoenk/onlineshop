"use client";

import { whatsappLink } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const href = whatsappLink(
    "Halo Juragan Grosir, saya ingin bertanya tentang produknya.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat dengan kami"
      style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 50,
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "12px 20px", borderRadius: 999,
        background: "var(--gold)", color: "var(--bg)", textDecoration: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "transform 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      <MessageCircle style={{ width: 20, height: 20 }} />
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)" }}>Chat dengan kami</span>
    </a>
  );
}
