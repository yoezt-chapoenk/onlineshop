import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FAQS = [
  {
    q: "Bagaimana cara kerja harga grosir?",
    a: "Harga bertingkat otomatis berlaku setelah Anda mencapai minimum quantity (umumnya 6 pcs). Tingkat 2 berlaku mulai 12 pcs. Reseller yang disetujui selalu mendapat harga reseller di seluruh katalog.",
  },
  {
    q: "Bagaimana ongkos kirim dihitung?",
    a: "Kami integrasi dengan Biteship untuk menghitung tarif kurir secara real-time berdasarkan tujuan dan total berat pesanan. Anda memilih kurir dan layanan sebelum pembayaran.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Bank Transfer, Virtual Account, QRIS, dan saluran lain melalui penyedia pembayaran Komerce kami. Seluruh pembayaran diproses langsung di website dengan aman.",
  },
  {
    q: "Apakah pengiriman menjangkau seluruh Indonesia?",
    a: "Ya — kami mengirim ke seluruh provinsi di Indonesia menggunakan JNE, J&T, SiCepat, dan kurir lainnya. Nomor resi otomatis dikirim setelah pesanan dikirim.",
  },
  {
    q: "Bagaimana cara menjadi reseller?",
    a: "Tentu bisa. Isi form Jadi Reseller dengan saluran penjualan dan estimasi volume bulanan Anda. Tim kami akan meninjau dalam 1–2 hari kerja.",
  },
];

export default function FAQPreview() {
  return (
    <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 48 }}>
      <div>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16, display: "block" }}>Pertanyaan Umum</span>
        <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>
          Jawaban singkat untuk pertanyaan populer
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
          Punya pertanyaan lain? Hubungi tim kami via WhatsApp atau form kontak.
        </p>
        <Link
          href="/contact"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--gold)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          Hubungi customer service <ArrowRight style={{ width: 16, height: 16 }} />
        </Link>
      </div>
      <div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, background: "var(--surface)", border: "1px solid var(--border)" }}>
          {FAQS.map((f, i) => (
            <li key={f.q} style={{ borderBottom: i === FAQS.length - 1 ? "none" : "1px solid var(--border)" }}>
              <details style={{ padding: 24 }}>
                <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", listStyle: "none" }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                    {f.q}
                  </span>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
                    +
                  </span>
                </summary>
                <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
