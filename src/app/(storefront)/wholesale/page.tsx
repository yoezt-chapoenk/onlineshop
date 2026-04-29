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
    <div>
      <PageHeader
        eyebrow="Grosir & Reseller"
        title="Kembangkan bisnis kacamata Anda bersama kami."
        description="Harga grosir bertingkat berlaku mulai 6 pcs. Reseller yang disetujui mendapat harga terendah kami di seluruh katalog."
        breadcrumbs={[{ label: "Grosir" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,460px)] gap-10 lg:gap-14">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kenapa bermitra dengan kami</h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="card p-5 flex items-start gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] flex items-center justify-center text-[color:var(--color-navy-900)] shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{title}</div>
                  <p className="text-xs text-[color:var(--color-muted)] mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 card p-6">
            <h3 className="text-base font-semibold">Cara kerjanya</h3>
            <ol className="mt-4 space-y-4">
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
                <li key={s.step} className="flex gap-4">
                  <div className="text-xs font-bold text-[color:var(--color-navy-900)] mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.title}</div>
                    <p className="text-xs text-[color:var(--color-muted)] mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 text-xs text-[color:var(--color-muted)] flex items-center gap-1">
              Ada pertanyaan? <ArrowRight className="h-3 w-3" /> Hubungi tim kami via form atau WhatsApp.
            </div>
          </div>
        </div>

        <ResellerForm />
      </div>
    </div>
  );
}
