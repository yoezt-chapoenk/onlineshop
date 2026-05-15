import Link from "next/link";
import { Code2, BookOpen, Key, Package, FileText } from "lucide-react";

export const metadata = {
  title: "API Documentation · Admin · Juragan Grosir",
};

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <pre className="rounded-xl bg-[color:var(--color-navy-900)] text-[#e2e8f0] text-xs p-4 overflow-x-auto mt-2 leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-cloud-200)] bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[color:var(--color-cloud-200)] bg-[color:var(--color-cloud-50)]">
        <Icon className="h-4 w-4 text-[color:var(--color-navy-400)]" />
        <h2 className="text-sm font-bold text-[color:var(--color-navy-900)] uppercase tracking-[0.14em]">{title}</h2>
      </div>
      <div className="p-5 space-y-4 text-sm text-[color:var(--color-navy-700)]">
        {children}
      </div>
    </section>
  );
}

function Endpoint({ method, path, description }: { method: "POST" | "GET" | "PATCH" | "DELETE"; path: string; description: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-green-100 text-green-800",
    PATCH: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
  };
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[color:var(--color-cloud-100)] last:border-0">
      <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-bold ${colors[method]}`}>{method}</span>
      <div>
        <code className="font-mono text-xs text-[color:var(--color-navy-900)]">{path}</code>
        <p className="text-xs text-[color:var(--color-navy-400)] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-navy-900)]">
            Dokumentasi API
          </h1>
          <p className="text-sm text-[color:var(--color-navy-400)] mt-1">
            Referensi lengkap endpoint untuk AI Agent dan integrasi eksternal.
          </p>
        </div>
        <Link href="/admin/api-keys" className="btn btn-outline text-xs inline-flex items-center gap-2">
          <Key className="h-3 w-3" /> Kelola API Keys
        </Link>
      </header>

      {/* Auth */}
      <Section title="Autentikasi" icon={Key}>
        <p>Semua endpoint <code className="bg-[color:var(--color-cloud-200)] px-1.5 py-0.5 rounded text-xs">/api/v1/*</code> membutuhkan API Key yang valid. Sertakan di setiap request:</p>
        <CodeBlock code={`Authorization: Bearer jg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
        <p className="text-xs text-[color:var(--color-navy-400)]">
          API Key dapat dibuat dan dikelola di halaman <Link href="/admin/api-keys" className="underline text-blue-600 hover:text-blue-800">API Keys</Link>.
          Jangan pernah expose API Key di kode frontend atau repository publik.
        </p>
      </Section>

      {/* Endpoints Overview */}
      <Section title="Daftar Endpoint" icon={Code2}>
        <Endpoint method="POST" path="/api/v1/articles" description="Buat atau update artikel blog (upsert berdasarkan slug)." />
        <Endpoint method="POST" path="/api/v1/products" description="Buat atau update produk (upsert berdasarkan slug)." />
      </Section>

      {/* Articles */}
      <Section title="POST /api/v1/articles" icon={FileText}>
        <p>Membuat artikel baru atau memperbarui artikel yang sudah ada berdasarkan <strong>slug</strong>. Konten menggunakan format <strong>Markdown</strong>.</p>
        
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Request Body (JSON)</p>
          <CodeBlock language="json" code={`{
  "slug": "tips-memilih-kacamata",          // required — URL-friendly identifier
  "title": "Tips Memilih Kacamata yang Tepat", // required
  "content": "# Tips Memilih Kacamata\\n\\nPilih sesuai...", // required, Markdown
  "image_url": "https://cdn.example.com/img.jpg", // optional
  "is_published": true                          // default: true
}`} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Response Sukses (200)</p>
          <CodeBlock language="json" code={`{ "success": true, "id": "uuid-artikel" }`} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Contoh (cURL)</p>
          <CodeBlock code={`curl -X POST https://yourdomain.com/api/v1/articles \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer jg_live_XXXXXXXXXX" \\
  -d '{
    "slug": "tips-kacamata-2025",
    "title": "Tips Memilih Kacamata 2025",
    "content": "## Pendahuluan\\n\\nMemilih kacamata yang tepat...",
    "is_published": true
  }'`} />
        </div>
      </Section>

      {/* Products */}
      <Section title="POST /api/v1/products" icon={Package}>
        <p>Membuat produk baru atau memperbarui produk yang sudah ada berdasarkan <strong>slug</strong>.</p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Request Body (JSON)</p>
          <CodeBlock language="json" code={`{
  "slug": "kacamata-klasik-hitam",           // required — URL-friendly
  "sku": "JG-KLS-001",                       // required — unique product code
  "name": "Kacamata Klasik Hitam",           // required
  "short_description": "Frame minimalis...", // required
  "description": "Deskripsi panjang...",     // required
  "category_slug": "eyeglasses",             // required — harus ada di tabel categories
  "retail_price": 145000,                    // required (Rupiah, integer)
  "reseller_price": 105000,                  // optional
  "stock": 100,                              // default: 100
  "weight_gram": 500,                        // default: 500
  "image_urls": [                            // optional
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg"
  ]
}`} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Response Sukses (200)</p>
          <CodeBlock language="json" code={`{ "success": true, "id": "uuid-produk" }`} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Category Slug yang Tersedia</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {["eyeglasses", "sunglasses", "blue-light", "accessories"].map((s) => (
              <code key={s} className="bg-[color:var(--color-cloud-200)] px-2 py-0.5 rounded text-xs">{s}</code>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-navy-400)] mb-1">Contoh (cURL)</p>
          <CodeBlock code={`curl -X POST https://yourdomain.com/api/v1/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer jg_live_XXXXXXXXXX" \\
  -d '{
    "slug": "kacamata-sporty-abu",
    "sku": "JG-SPT-ABU-01",
    "name": "Kacamata Sporty Abu-abu",
    "short_description": "Frame sporty anti-UV",
    "description": "Kacamata sporty dengan...",
    "category_slug": "sunglasses",
    "retail_price": 175000,
    "stock": 50
  }'`} />
        </div>
      </Section>

      {/* Error Codes */}
      <Section title="Kode Error" icon={BookOpen}>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[color:var(--color-navy-400)] uppercase tracking-wider border-b border-[color:var(--color-cloud-200)]">
              <th className="py-2 pr-4 font-semibold">HTTP Status</th>
              <th className="py-2 font-semibold">Penyebab</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-cloud-100)]">
            {[
              { code: "200 OK", desc: "Request berhasil diproses." },
              { code: "400 Bad Request", desc: "Data tidak valid atau field wajib kosong." },
              { code: "401 Unauthorized", desc: "API Key tidak disertakan atau tidak valid." },
              { code: "500 Internal Server Error", desc: "Kesalahan server, coba lagi beberapa saat." },
            ].map((row) => (
              <tr key={row.code}>
                <td className="py-2 pr-4 font-mono text-[color:var(--color-navy-900)]">{row.code}</td>
                <td className="py-2 text-[color:var(--color-navy-500)]">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
