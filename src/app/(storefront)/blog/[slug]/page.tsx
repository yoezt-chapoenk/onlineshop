import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/admin/format";
import { parseMarkdown } from "@/lib/markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Script from "next/script";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getServerSupabase();
  if (!supabase) return { title: "Blog" };

  const { data } = await supabase
    .from("articles")
    .select("title, content, image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) return { title: "Not Found" };

  return {
    title: data.title,
    description: data.content.slice(0, 160).replace(/[#*`_\[\]]/g, ''),
    openGraph: {
      images: data.image_url ? [data.image_url] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getServerSupabase();
  if (!supabase) return <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Supabase not configured.</div>;

  const { data } = await supabase
    .from("articles")
    .select("title, content, image_url, created_at, updated_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();

  // Parse markdown
  const htmlContent = parseMarkdown(data.content);

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data.title,
    "image": data.image_url ? [data.image_url] : [],
    "datePublished": data.created_at,
    "dateModified": data.updated_at,
    "author": [{
      "@type": "Organization",
      "name": "Juragan Grosir",
    }]
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
      <Script
        id={`article-jsonld-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--gold)", textDecoration: "none", marginBottom: 32 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Kembali ke Blog
      </Link>

      <article>
        <header style={{ textAlign: "center", marginBottom: 40 }}>
          <time style={{ fontSize: 13, color: "var(--text-muted)" }}>{formatDateTime(data.created_at)}</time>
          <h1 style={{ marginTop: 16, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", lineHeight: 1.2 }}>
            {data.title}
          </h1>
        </header>

        {data.image_url && (
          <div style={{ marginBottom: 48, aspectRatio: "2/1", width: "100%", overflow: "hidden", background: "var(--bg2)", border: "1px solid var(--border)", position: "relative" }}>
            <Image src={data.image_url} alt={data.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 1024px) 100vw, 800px" priority />
          </div>
        )}

        <div 
          className="article-body prose"
          style={{ color: "var(--text)", lineHeight: 1.8, fontSize: 16 }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
}
