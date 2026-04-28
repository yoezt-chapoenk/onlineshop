import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/data";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the complete Juragan Grosir eyewear catalog with retail and wholesale tier pricing.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return <ShopClient products={products} categories={categories} />;
}
