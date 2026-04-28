import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassesArt from "@/components/products/GlassesArt";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse Juragan Grosir eyewear collections — Eyeglasses, Sunglasses, Blue Light, and Accessories.",
};

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  const sample = (slug: string) =>
    products.find((p) => p.category === slug);

  return (
    <div>
      <PageHeader
        eyebrow="Collections"
        title="Shop By Category"
        description="From everyday eyeglasses to fashion sunglasses and screen-time blue-light frames — find the right collection for you."
        breadcrumbs={[{ label: "Collections" }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((c) => {
            const sampleProduct = sample(c.slug);
            return (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="card group p-7 sm:p-8 flex items-center gap-6 hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {c.name}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--color-muted)] max-w-xs">
                    {c.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)]">
                    Shop {c.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <div className="mt-3 text-xs text-[color:var(--color-muted)]">
                    {c.productCount} products
                  </div>
                </div>
                {sampleProduct && (
                  <div className="hidden sm:block">
                    <GlassesArt product={sampleProduct} size={140} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
