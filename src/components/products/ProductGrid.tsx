import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  className?: string;
}

export default function ProductGrid({ products, className }: Props) {
  if (products.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-[color:var(--color-muted)]">
        No products match your filters yet. Try clearing some filters.
      </div>
    );
  }
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 ${className ?? ""}`}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
