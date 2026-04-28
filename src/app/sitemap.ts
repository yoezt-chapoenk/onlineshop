import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/products";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = [
    "/",
    "/shop",
    "/collections",
    "/about",
    "/wholesale",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/returns",
    "/legal/shipping",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.slug}`,
    lastModified,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
