import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import TrustBadges from "@/components/home/TrustBadges";
import CategoryGrid from "@/components/home/CategoryGrid";
import WholesaleCTA from "@/components/home/WholesaleCTA";
import Testimonials from "@/components/home/Testimonials";
import FAQPreview from "@/components/home/FAQPreview";
import ProductGrid from "@/components/products/ProductGrid";
import { products } from "@/lib/products";

export default function HomePage() {
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
            Featured Products
          </h2>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            View All Products <ArrowRight className="h-4 w-4" />
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
        <CategoryGrid />
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Best Sellers
          </h2>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            View All Products <ArrowRight className="h-4 w-4" />
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
            New Arrivals
          </h2>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <Testimonials />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 mb-16">
        <FAQPreview />
      </section>
    </div>
  );
}
