import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ChevronRight, Home } from "lucide-react";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/products/ProductCard";

export const revalidate = 3600; // revalidate every hour

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [],
    "description": product.shortDescription,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Juragan Grosir"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://juragangrosir.com/shop/${product.slug}`,
      "priceCurrency": "IDR",
      "price": product.retailPrice,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    ...(product.reviewCount > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount
      }
    })
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Script
        id={`product-jsonld-${product.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section style={{ borderBottom: "1px solid var(--border)", padding: "120px 8% 24px" }}>
        <nav aria-label="Breadcrumb">
          <ol style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            <li>
              <Link href="/" style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                <Home style={{ width: 14, height: 14 }} />
              </Link>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ChevronRight style={{ width: 14, height: 14, color: "var(--border)" }} />
              <Link href="/shop" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                Belanja
              </Link>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ChevronRight style={{ width: 14, height: 14, color: "var(--border)" }} />
              <Link href={`/collections/${product.category}`} style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--gold)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                {product.categoryLabel}
              </Link>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ChevronRight style={{ width: 14, height: 14, color: "var(--border)" }} />
              <span style={{ color: "var(--text)" }}>
                {product.name}
              </span>
            </li>
          </ol>
        </nav>
      </section>

      <div style={{ padding: "0 8% 64px" }}>
        <ProductDetailClient product={product} />

        {related.length > 0 && (
          <div style={{ marginTop: 96 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: "var(--text)", marginBottom: 32 }}>
              Anda mungkin juga suka
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "48px 28px" }}>
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
