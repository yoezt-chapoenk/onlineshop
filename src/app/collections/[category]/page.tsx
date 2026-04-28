import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ProductGrid from "@/components/products/ProductGrid";
import { categories, getProductsByCategory } from "@/lib/products";
import type { CategorySlug } from "@/lib/types";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return { title: "Collection not found" };
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();
  const list = getProductsByCategory(category as CategorySlug);

  return (
    <div>
      <PageHeader
        eyebrow={cat.name}
        title={cat.name}
        description={cat.description}
        breadcrumbs={[
          { label: "Collections", href: "/collections" },
          { label: cat.name },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-sm text-[color:var(--color-muted)] mb-5">
          Showing{" "}
          <span className="font-semibold text-[color:var(--color-ink)]">
            {list.length}
          </span>{" "}
          products in {cat.name}
        </div>
        <ProductGrid products={list} />
      </div>
    </div>
  );
}
