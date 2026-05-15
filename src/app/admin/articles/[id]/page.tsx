import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  if (!supabase) return <div>No DB</div>;

  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">Edit Artikel</h1>
      </header>
      <ArticleForm
        mode="edit"
        initial={{
          id: data.id,
          slug: data.slug,
          title: data.title,
          content: data.content,
          image_url: data.image_url || "",
          is_published: data.is_published,
        }}
      />
    </div>
  );
}
