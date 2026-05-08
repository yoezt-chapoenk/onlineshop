import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Globe2, Users } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Juragan Grosir adalah perusahaan kacamata Indonesia yang membuat frame premium dengan harga adil untuk pelanggan retail dan mitra grosir.",
};

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <PageHeader
        eyebrow="Cerita Kami"
        title="Kacamata premium, terjangkau untuk semua."
        description="Juragan Grosir berdiri dengan keyakinan sederhana — kacamata berkualitas bukan barang mewah. Kini kami melayani ribuan pelanggan retail dan mitra grosir di seluruh Indonesia."
        breadcrumbs={[{ label: "Tentang Kami" }]}
      />

      <div style={{ padding: "80px 8%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 80 }}>
          {[
            {
              icon: Users,
              title: "10.000+ pelanggan",
              desc: "Dipercaya pelanggan retail dan reseller di seluruh provinsi Indonesia.",
            },
            {
              icon: Award,
              title: "Material premium",
              desc: "Asetat Italia, beta-titanium, dan TR-90 — dari supplier terpercaya.",
            },
            {
              icon: Globe2,
              title: "Pengiriman nasional",
              desc: "Tarif Biteship realtime untuk JNE, J&T, Central Cargo, dan lainnya.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ padding: 40, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
              <div style={{ width: 48, height: 48, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", marginBottom: 24 }}>
                <Icon style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--text)", marginBottom: 12 }}>{title}</div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 64 }} className="lg:grid-cols-2 lg:gap-24">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--text)", marginBottom: 32 }}>
              Cara kerja kami
            </h2>
            <div style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 20 }}>
              <p>
                Setiap frame Juragan Grosir kami desain in-house, lalu bermitra
                dengan pabrik kacamata terpercaya untuk diproduksi sesuai
                spesifikasi. Setiap batch melewati QC di gudang Jawa Timur
                sebelum sampai ke pelanggan.
              </p>
              <p>
                Karena kami kirim langsung tanpa perantara, harga retail tetap
                adil dan diskon grosir bertingkat benar-benar berarti. Filosofi
                yang sama menjiwai program reseller kami — harga transparan,
                margin nyata, dan stok yang konsisten.
              </p>
              <p>
                Tim kecil kami berbasis di Jawa Timur, tetapi gerak cepat. Sebagian
                besar pesanan dikirim dalam 24 jam, dan tim WhatsApp kami
                merespons dalam hitungan menit di jam kerja.
              </p>
            </div>
            <Link
              href="/wholesale"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: 40,
                background: "var(--gold)", color: "var(--bg)", textDecoration: "none",
                padding: "0 24px", height: 44, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                fontWeight: 500, transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--gold-light)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--gold)"}
            >
              Jadi Reseller <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div style={{ padding: 48, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--text)", marginBottom: 32 }}>Nilai-nilai kami</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 32 }}>
              {[
                {
                  title: "Harga jujur",
                  desc: "Tanpa markup marketplace, tanpa biaya tersembunyi. Harga retail sama online maupun di rak setiap reseller.",
                },
                {
                  title: "Kualitas di atas segalanya",
                  desc: "Setiap frame lulus tes engsel 1.000 lipatan, uji jatuh, dan 24 jam paparan UV sebelum dikirim.",
                },
                {
                  title: "Layanan yang tumbuh bersama Anda",
                  desc: "Dari pelanggan pertama hingga pesanan reseller 1.000 pcs — dukungan dan perhatian yang sama.",
                },
              ].map((v) => (
                <li key={v.title} style={{ paddingLeft: 24, borderLeft: "2px solid var(--gold)" }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>{v.title}</div>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {v.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
