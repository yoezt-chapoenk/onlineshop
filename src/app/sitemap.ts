import type { MetadataRoute } from "next";
import { getServerSupabase } from "@/lib/supabase/server";

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getServerSupabase();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://juragangrosir.com"; // Fallback URL

  if (!supabase) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }

  // 1. Static Routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...[
      "/wholesale",
      "/legal/privacy",
      "/legal/terms",
      "/legal/returns",
      "/legal/shipping",
    ].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];

  // 2. Fetch Products
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at");

  if (products) {
    for (const product of products) {
      routes.push({
        url: `${baseUrl}/shop/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  // 3. Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  if (categories) {
    for (const category of categories) {
      routes.push({
        url: `${baseUrl}/shop?category=${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // 4. Fetch Blog Articles
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("is_published", true);

  if (articles) {
    for (const article of articles) {
      routes.push({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return routes;
}
