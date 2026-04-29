import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FAQS = [
  {
    q: "Bagaimana cara kerja harga grosir?",
    a: "Harga bertingkat otomatis berlaku setelah Anda mencapai minimum quantity (umumnya 6 pcs). Tingkat 2 berlaku mulai 12 pcs. Reseller yang disetujui selalu mendapat harga reseller di seluruh katalog.",
  },
  {
    q: "Bagaimana ongkos kirim dihitung?",
    a: "Kami integrasi dengan RajaOngkir/Komerce untuk menghitung tarif kurir secara real-time berdasarkan tujuan dan total berat pesanan. Anda memilih kurir dan layanan sebelum pembayaran.",
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
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div>
          <span className="eyebrow">Pertanyaan Umum</span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">
            Jawaban singkat untuk pertanyaan populer
          </h2>
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            Punya pertanyaan lain? Hubungi tim kami via WhatsApp atau form kontak.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            Hubungi customer service <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="lg:col-span-2">
          <ul className="divide-y divide-[color:var(--color-line)] border border-[color:var(--color-line)] rounded-xl bg-white">
            {FAQS.map((f) => (
              <li key={f.q}>
                <details className="group p-5">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <span className="text-sm sm:text-[15px] font-semibold text-[color:var(--color-ink)]">
                      {f.q}
                    </span>
                    <span className="h-6 w-6 shrink-0 rounded-full border border-[color:var(--color-line)] flex items-center justify-center text-[color:var(--color-navy-900)] group-open:rotate-45 transition-transform text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-[color:var(--color-muted)] leading-relaxed">
                    {f.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
