import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import WholesaleCTA from "@/components/home/WholesaleCTA";
import FAQPreview from "@/components/home/FAQPreview";
import ProductGrid from "@/components/products/ProductGrid";
import { getCategories, getProducts } from "@/lib/data";

export const revalidate = 3600; // revalidate every hour


export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div>
      <Hero />

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Produk Pilihan
          </h2>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            Lihat Semua Produk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Trust badges */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
        <TrustBadges />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <CategoryGrid categories={categories} products={products} />
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Paling Laris
          </h2>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            Lihat Semua Produk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={bestSellers} />
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <WholesaleCTA />
      </section>

      {/* New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Produk Terbaru
          </h2>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            Lihat Semua Produk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={newArrivals} />
        </div>
      </section>



      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 mb-16">
        <FAQPreview />
      </section>
    </div>
  );
}
