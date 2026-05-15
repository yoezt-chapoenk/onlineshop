import ArticleForm from "../ArticleForm";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">Tulis Artikel Baru</h1>
      </header>
      <ArticleForm
        mode="create"
        initial={{
          slug: "",
          title: "",
          content: "",
          image_url: "",
          is_published: false,
        }}
      />
    </div>
  );
}
