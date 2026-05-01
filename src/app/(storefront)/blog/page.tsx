import Link from "next/link";
import { getAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/admin/format";

export const revalidate = 3600; // revalidate every hour

export default async function BlogIndexPage() {
  const supabase = getAdminClient();
  if (!supabase) return <div className="p-8 text-center">Supabase not configured.</div>;

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, image_url, created_at, content")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (!articles || articles.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-[color:var(--color-muted)]">Belum ada artikel yang diterbitkan.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Artikel Terbaru</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((a) => (
          <Link key={a.slug} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-white transition-shadow hover:shadow-lg">
            {a.image_url ? (
              <div className="aspect-[16/9] w-full overflow-hidden bg-[color:var(--color-cloud-100)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_url} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            ) : (
              <div className="aspect-[16/9] w-full bg-[color:var(--color-cloud-200)] flex items-center justify-center">
                <span className="text-[color:var(--color-muted)] text-sm">Tidak ada gambar</span>
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <time className="text-xs text-[color:var(--color-muted)] mb-2">{formatDateTime(a.created_at)}</time>
              <h2 className="text-lg font-bold leading-tight text-[color:var(--color-navy-900)] mb-3 group-hover:text-blue-600 transition-colors">
                {a.title}
              </h2>
              <p className="text-sm text-[color:var(--color-muted)] line-clamp-3">
                {/* Strip markdown/HTML roughly for the preview */}
                {a.content.replace(/[#*`_\[\]]/g, '').slice(0, 150)}...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
