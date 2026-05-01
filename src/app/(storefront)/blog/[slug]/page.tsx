import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";
import { parseMarkdown } from "@/lib/markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Script from "next/script";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getAdminClient();
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
  const supabase = getAdminClient();
  if (!supabase) return <div className="p-8 text-center">Supabase not configured.</div>;

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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Script
        id={`article-jsonld-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--color-navy-400)] hover:text-[color:var(--color-navy-900)] mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Blog
      </Link>

      <article>
        <header className="mb-10 text-center">
          <time className="text-sm font-medium text-[color:var(--color-muted)]">{formatDateTime(data.created_at)}</time>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[color:var(--color-navy-900)] leading-tight">
            {data.title}
          </h1>
        </header>

        {data.image_url && (
          <div className="mb-12 aspect-[2/1] w-full overflow-hidden rounded-2xl bg-[color:var(--color-cloud-100)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image_url} alt={data.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div 
          className="article-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
}
