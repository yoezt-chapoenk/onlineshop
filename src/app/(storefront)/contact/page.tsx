import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ContactForm from "./ContactForm";
import {
  STORE_ADDRESS,
  STORE_PHONE,
  SUPPORT_EMAIL,
  whatsappLink,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Juragan Grosir — dukungan WhatsApp, email, atau langsung di gudang Jawa Timur kami.",
};

export default function ContactPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PageHeader
        eyebrow="Kontak"
        title="Kami siap membantu."
        description="Hubungi tim kami via WhatsApp untuk respons tercepat, atau kirim pesan dan kami akan membalas dalam satu hari kerja."
        breadcrumbs={[{ label: "Kontak" }]}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, width: "100%" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>Hubungi kami</h2>
          <ul style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16, listStyle: "none", padding: 0 }}>
            <li style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, border: "1px solid #25D366", background: "rgba(37, 211, 102, 0.1)", color: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MessageCircle style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Dukungan WhatsApp</div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                  Cara tercepat menghubungi kami. Rata-rata balas 5 menit
                  pada jam kerja (09.00–18.00 WIB).
                </p>
                <a
                  href={whatsappLink("Halo Juragan Grosir, saya butuh bantuan tentang…")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ marginTop: 16, display: "inline-flex", background: "#25D366", color: "#fff", border: "1px solid #25D366", padding: "8px 16px", fontSize: 12 }}
                >
                  Chat dengan kami
                </a>
              </div>
            </li>
            <li style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, border: "1px solid var(--gold)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Phone style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Telepon</div>
                <a
                  href={`tel:${STORE_PHONE.replace(/\s+/g, "")}`}
                  style={{ fontSize: 14, color: "var(--gold)", textDecoration: "none", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  {STORE_PHONE}
                </a>
              </div>
            </li>
            <li style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, border: "1px solid var(--gold)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Email</div>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  style={{ fontSize: 14, color: "var(--gold)", textDecoration: "none", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </li>
            <li style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 48, height: 48, border: "1px solid var(--gold)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Gudang & kantor</div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {STORE_ADDRESS}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 8 }}>
                  Buka Sen–Sab, 09.00–18.00 WIB. Kunjungan dengan janji temu.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
