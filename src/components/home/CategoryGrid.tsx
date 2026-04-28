import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GlassesArt from "@/components/products/GlassesArt";
import type { Category, Product } from "@/lib/types";

interface Props {
  categories: Category[];
  products: Product[];
}

export default function CategoryGrid({ categories, products }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Shop By Category
        </h2>
        <Link
          href="/collections"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--color-navy-900)] hover:underline"
        >
          View All Categories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {categories.map((c) => {
          const sample = products.find((p) => p.category === c.slug);
          return (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="card group p-5 flex flex-col gap-3 min-h-[180px] hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[color:var(--color-ink)]">
                    {c.name}
                  </h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-navy-900)]">
                    View Collection <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
              <div className="mt-auto self-end -mr-2 -mb-2 opacity-90">
                {sample && <GlassesArt product={sample} size={110} />}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
