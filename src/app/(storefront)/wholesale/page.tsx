import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Tags, Truck, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ResellerForm from "./ResellerForm";

export const metadata: Metadata = {
  title: "Jadi Reseller",
  description:
    "Daftarkan diri menjadi reseller resmi Juragan Grosir — nikmati harga khusus, prioritas stok, dan dukungan khusus.",
};

const PERKS = [
  {
    icon: Tags,
    title: "Harga reseller eksklusif",
    desc: "Dapatkan harga terendah kami di seluruh katalog setelah disetujui.",
  },
  {
    icon: BadgeCheck,
    title: "Prioritas produk baru",
    desc: "Akses lebih awal ke koleksi baru sebelum dirilis ke publik.",
  },
  {
    icon: Truck,
    title: "Pengiriman ramah grosir",
    desc: "Pengemasan optimal dan konsolidasi pengiriman untuk reseller.",
  },
  {
    icon: Users,
    title: "Jalur khusus reseller",
    desc: "Jalur WhatsApp khusus untuk pertanyaan stok, restock, dan pesanan.",
  },
];

export default function WholesalePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <PageHeader
        eyebrow="Grosir & Reseller"
        title="Kembangkan bisnis kacamata Anda bersama kami."
        description="Harga grosir bertingkat berlaku mulai 6 pcs. Reseller yang disetujui mendapat harga terendah kami di seluruh katalog."
        breadcrumbs={[{ label: "Grosir" }]}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "1fr minmax(0, 460px)", gap: 48, width: "100%" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)" }}>Kenapa bermitra dengan kami</h2>
          <ul style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, listStyle: "none", padding: 0 }}>
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 0, border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 40, background: "var(--surface)", border: "1px solid var(--border)", padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Cara kerjanya</h3>
            <ol style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24, listStyle: "none", padding: 0 }}>
              {[
                {
                  step: "01",
                  title: "Kirim aplikasi",
                  desc: "Ceritakan tentang bisnis dan kanal jualan Anda — hanya ±2 menit.",
                },
                {
                  step: "02",
                  title: "Kami review dalam 1–2 hari kerja",
                  desc: "Tim kami akan memeriksa detail dan mungkin menghubungi untuk verifikasi singkat.",
                },
                {
                  step: "03",
                  title: "Disetujui & mulai memesan",
                  desc: "Harga reseller otomatis berlaku di setiap pesanan dari akun Anda.",
                },
              ].map((s) => (
                <li key={s.step} style={{ display: "flex", gap: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--gold)", marginTop: 2 }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{s.title}</div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
              Ada pertanyaan? <ArrowRight style={{ width: 14, height: 14, color: "var(--gold)" }} /> Hubungi tim kami via form atau WhatsApp.
            </div>
          </div>
        </div>

        <ResellerForm />
      </div>
    </div>
  );
}
