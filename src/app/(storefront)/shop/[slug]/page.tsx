import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Star } from "lucide-react";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import GlassesArt from "@/components/products/GlassesArt";
import ProductGrid from "@/components/products/ProductGrid";
import { formatRupiah } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  return (
    <div>
      <section className="bg-[color:var(--color-cloud-100)] border-b border-[color:var(--color-line)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1 text-xs text-[color:var(--color-muted)]">
              <li>
                <Link href="/" className="inline-flex items-center hover:text-[color:var(--color-navy-900)]">
                  <Home className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-[color:var(--color-cloud-300)]" />
                <Link href="/shop" className="hover:text-[color:var(--color-navy-900)]">
                  Shop
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-[color:var(--color-cloud-300)]" />
                <Link
                  href={`/collections/${product.category}`}
                  className="hover:text-[color:var(--color-navy-900)]"
                >
                  {product.categoryLabel}
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-[color:var(--color-cloud-300)]" />
                <span className="text-[color:var(--color-ink)] font-medium line-clamp-1">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <div className="rounded-2xl bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] aspect-square flex items-center justify-center p-10">
              <GlassesArt product={product} size={360} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[color:var(--color-cloud-100)] border border-[color:var(--color-line)] aspect-square flex items-center justify-center p-3"
                >
                  <GlassesArt product={product} size={70} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-900)]">
              {product.categoryLabel} · SKU {product.sku}
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <div className="flex items-center text-[color:var(--color-navy-900)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-[color:var(--color-muted)]">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="mt-5 text-[color:var(--color-muted)] leading-relaxed">
              {product.description}
            </p>

            <ProductDetailClient product={product} />

            {/* Tier table */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold mb-2">Wholesale price tiers</h3>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[color:var(--color-cloud-100)] text-[color:var(--color-muted)]">
                    <tr>
                      <th className="text-left font-medium py-2.5 px-4">Quantity</th>
                      <th className="text-right font-medium py-2.5 px-4">Unit price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--color-line)]">
                    <tr>
                      <td className="py-2.5 px-4">1–5 pcs</td>
                      <td className="py-2.5 px-4 text-right font-semibold">
                        {formatRupiah(product.retailPrice)}
                      </td>
                    </tr>
                    {product.priceTiers.map((t) => (
                      <tr key={t.minQty}>
                        <td className="py-2.5 px-4">
                          {t.maxQty
                            ? `${t.minQty}–${t.maxQty} pcs`
                            : `${t.minQty}+ pcs`}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-[color:var(--color-navy-900)]">
                          {formatRupiah(t.unitPrice)}
                        </td>
                      </tr>
                    ))}
                    {product.resellerPrice && (
                      <tr className="bg-[color:var(--color-cloud-50)]">
                        <td className="py-2.5 px-4">Approved reseller price</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-[color:var(--color-navy-900)]">
                          {formatRupiah(product.resellerPrice)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-[color:var(--color-muted)]">
                Tier price applies automatically once minimum quantity is reached.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              {product.specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-[color:var(--color-muted)] text-xs">{s.label}</dt>
                  <dd className="font-semibold mt-0.5">{s.value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[color:var(--color-muted)] text-xs">Weight</dt>
                <dd className="font-semibold mt-0.5">{product.weightGram} g</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-muted)] text-xs">Stock</dt>
                <dd className="font-semibold mt-0.5">{product.stock} pcs available</dd>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">You may also like</h2>
            <div className="mt-6">
              <ProductGrid products={related} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
