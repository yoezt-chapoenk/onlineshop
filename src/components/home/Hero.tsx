import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GlassesArt from "@/components/products/GlassesArt";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[color:var(--color-cloud-100)] to-[color:var(--color-cloud-50)] border-b border-[color:var(--color-line)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12 py-14 sm:py-20 lg:py-24">
          <div className="max-w-xl">
            <span className="eyebrow">Kacamata Premium</span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[color:var(--color-ink)] leading-[1.05]">
              Gaya Bertemu <br className="hidden sm:block" />
              Fungsi
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[color:var(--color-muted)] max-w-md leading-relaxed">
              Desain abadi. Kualitas terbaik. Kacamata yang menyempurnakan
              penampilan Anda dan cocok untuk gaya hidup harian.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">
                Belanja Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/collections" className="btn btn-outline">
                Jelajahi Koleksi
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[5/4] sm:aspect-[6/5] rounded-2xl bg-gradient-to-br from-white to-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] overflow-hidden shadow-[0_30px_60px_-30px_rgba(11,16,36,0.25)]">
              {/* Pedestal */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-1/2 bg-white border-t border-l border-[color:var(--color-line)] rounded-tl-2xl" />
                <div className="absolute right-0 top-0 h-full w-1/3 bg-[color:var(--color-navy-900)] opacity-95" />
                <div className="relative z-10 -mt-8 sm:-mt-10">
                  <GlassesArt
                    product={{
                      frame: "browline",
                      frameColor: "black",
                      lensColor: "smoke",
                      category: "sunglasses",
                    }}
                    size={300}
                    className="drop-shadow-[0_30px_30px_rgba(0,0,0,0.25)]"
                  />
                </div>
              </div>
              {/* Subtle hairline shadow under glasses */}
              <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-3/5 h-2 bg-black/15 blur-md rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
