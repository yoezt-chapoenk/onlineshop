import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/products/ProductGrid";
import { getCategories, getProductSummariesByCategory } from "@/lib/data";
import type { CategorySlug } from "@/lib/types";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Koleksi tidak ditemukan" };
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();
  const list = await getProductSummariesByCategory(category as CategorySlug);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PageHeader
        eyebrow={cat.name}
        title={cat.name}
        description={cat.description}
        breadcrumbs={[
          { label: "Koleksi", href: "/collections" },
          { label: cat.name },
        ]}
      />
      <div style={{ padding: "64px 8%" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Menampilkan{" "}
          <span style={{ fontWeight: 600, color: "var(--text)" }}>
            {list.length}
          </span>{" "}
          produk
        </div>
        <ProductGrid products={list} />
      </div>
    </div>
  );
}
