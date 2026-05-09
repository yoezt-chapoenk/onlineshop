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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Categories</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Used to group products on /shop and /collections.
        </p>
      </header>
      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}
      <CategoriesClient initial={categories} />
    </div>
  );
}
