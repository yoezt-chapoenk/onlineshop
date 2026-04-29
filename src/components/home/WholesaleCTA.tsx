import Link from "next/link";
import { ArrowRight, Tags, Users, BadgeCheck } from "lucide-react";

export default function WholesaleCTA() {
  return (
    <section className="rounded-2xl overflow-hidden bg-[color:var(--color-navy-900)] text-white relative">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <svg
          className="absolute -top-10 -right-10 h-72 w-72"
          viewBox="0 0 200 200"
        >
          <defs>
            <pattern id="dots" patternUnits="userSpaceOnUse" width="14" height="14">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#dots)" />
        </svg>
      </div>
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 sm:p-12 lg:p-14 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Program Grosir & Reseller
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Beli lebih banyak, hemat lebih banyak — dan kembangkan bisnis kacamata Anda bersama kami.
          </h2>
          <p className="mt-4 text-white/75 max-w-md">
            Harga grosir berlaku mulai 6 pcs. Reseller yang disetujui
            mendapatkan harga eksklusif untuk seluruh katalog, dengan prioritas
            stok dan dukungan akun khusus.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/wholesale"
              className="btn !bg-white !text-[color:var(--color-navy-900)] !border-white hover:!bg-white/90"
            >
              Jadi Reseller <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="btn !border-white/40 !text-white hover:!bg-white/10"
            >
              Lihat Harga Grosir
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          {[
            {
              icon: Tags,
              title: "Harga bertingkat mulai 6 pcs",
              desc: "Dua tingkat harga grosir transparan di setiap produk.",
            },
            {
              icon: BadgeCheck,
              title: "Harga khusus reseller",
              desc: "Akun reseller yang disetujui mendapat harga eksklusif.",
            },
            {
              icon: Users,
              title: "Prioritas stok & dukungan",
              desc: "Jalur WhatsApp khusus untuk reseller dan pembeli grosir.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-4"
            >
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-white/70 mt-0.5">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
