import { getAdminClient } from "@/lib/supabase/admin";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

interface Category {
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export default async function AdminCategoriesPage() {
  const supabase = getAdminClient();
  let categories: Category[] = [];
  let configured = false;
  if (supabase) {
    configured = true;
    const { data } = await supabase
      .from("categories")
      .select("slug, name, description, sort_order")
      .order("sort_order");
    categories = (data ?? []) as Category[];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[color:var(--color-navy-900)]">Categories</h1>
        <p className="text-sm text-[color:var(--color-navy-400)]">
          Used to group products on /shop and /collections.
        </p>
      </header>
      {!configured && (
        <div className="rounded-2xl border border-[color:var(--color-blue-200)] bg-[color:var(--color-blue-50)] p-4 text-sm">
          Supabase isn&apos;t configured.
        </div>
      )}
      <CategoriesClient initial={categories} />
    </div>
  );
}
