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
    <div>
      <PageHeader
        eyebrow="Cerita Kami"
        title="Kacamata premium, terjangkau untuk semua."
        description="Juragan Grosir berdiri dengan keyakinan sederhana — kacamata berkualitas bukan barang mewah. Kini kami melayani ribuan pelanggan retail dan mitra grosir di seluruh Indonesia."
        breadcrumbs={[{ label: "Tentang Kami" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-14">
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
            <div key={title} className="card p-6">
              <div className="h-11 w-11 rounded-xl bg-[color:var(--color-cloud-100)] flex items-center justify-center text-[color:var(--color-navy-900)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold">{title}</div>
              <p className="mt-1.5 text-sm text-[color:var(--color-muted)] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Cara kerja kami
            </h2>
            <div className="mt-5 space-y-4 text-[color:var(--color-muted)] leading-relaxed text-[15px]">
              <p>
                Setiap frame Juragan Grosir kami desain in-house, lalu bermitra
                dengan pabrik kacamata terpercaya untuk diproduksi sesuai
                spesifikasi. Setiap batch melewati QC di gudang Jakarta
                sebelum sampai ke pelanggan.
              </p>
              <p>
                Karena kami kirim langsung tanpa perantara, harga retail tetap
                adil dan diskon grosir bertingkat benar-benar berarti. Filosofi
                yang sama menjiwai program reseller kami — harga transparan,
                margin nyata, dan stok yang konsisten.
              </p>
              <p>
                Tim kecil kami berbasis di Jakarta, tetapi gerak cepat. Sebagian
                besar pesanan dikirim dalam 24 jam, dan tim WhatsApp kami
                merespons dalam hitungan menit di jam kerja.
              </p>
            </div>
            <Link
              href="/wholesale"
              className="btn btn-primary mt-7 inline-flex"
            >
              Jadi Reseller <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card p-7 bg-[color:var(--color-cloud-100)]">
            <h3 className="text-lg font-semibold">Nilai-nilai kami</h3>
            <ul className="mt-4 space-y-4">
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
                <li key={v.title} className="border-l-2 border-[color:var(--color-navy-900)] pl-4">
                  <div className="text-sm font-semibold">{v.title}</div>
                  <p className="text-sm text-[color:var(--color-muted)] mt-1 leading-relaxed">
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
