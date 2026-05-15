import Image from "next/image";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/admin/format";

export const revalidate = 3600; // revalidate every hour

export default async function BlogIndexPage() {
  const supabase = await getServerSupabase();
  if (!supabase) return <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>Supabase not configured.</div>;

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, image_url, created_at, content")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (!articles || articles.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>Blog</h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)" }}>Belum ada artikel yang diterbitkan.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 32 }}>Artikel Terbaru</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 32 }}>
        {articles.map((a) => (
          <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-card" style={{ display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--border)", textDecoration: "none", overflow: "hidden", transition: "border 0.2s" }}>
            {a.image_url ? (
              <div style={{ aspectRatio: "16/9", width: "100%", overflow: "hidden", background: "var(--bg2)", borderBottom: "1px solid var(--border)", position: "relative" }}>
                <Image src={a.image_url} alt={a.title} fill style={{ objectFit: "cover", transition: "transform 0.5s ease" }} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
            ) : (
              <div style={{ aspectRatio: "16/9", width: "100%", background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--text-dim)", fontSize: 14 }}>Tidak ada gambar</span>
              </div>
            )}
            <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column" }}>
              <time style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{formatDateTime(a.created_at)}</time>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 12, lineHeight: 1.4 }}>
                {a.title}
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {/* Clean markdown syntax for plain text excerpt */}
              {a.content
                .replace(/^#{1,6}\s+/gm, '')      // headings
                .replace(/\*\*(.+?)\*\*/g, '$1')  // bold
                .replace(/\*(.+?)\*/g, '$1')       // italic
                .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
                .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links/images
                .replace(/^[-*+>]\s+/gm, '')        // lists/blockquotes
                .replace(/\n+/g, ' ')               // newlines
                .trim()
                .slice(0, 150)}...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
