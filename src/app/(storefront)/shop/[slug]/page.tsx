import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import ProductGrid from "@/components/products/ProductGrid";

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
  if (!product) return { title: "Produk tidak ditemukan" };
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
                  Belanja
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
        <ProductDetailClient product={product} />

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">Anda mungkin juga suka</h2>
            <div className="mt-6">
              <ProductGrid products={related} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
