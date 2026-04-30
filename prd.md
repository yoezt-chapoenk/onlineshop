# PRD — Juragan Grosir Online Shop

## 1. Ringkasan Produk

**Juragan Grosir** adalah platform e-commerce B2C dan B2B untuk penjualan kacamata secara online. Website ini melayani tiga segmen pelanggan: **retail** (satuan), **reseller** (harga khusus), dan **wholesale/grosir** (harga tier berdasarkan kuantitas). Toko berlokasi di Jember, Jawa Timur dan telah di-deploy di **juragangrosir.com** via Vercel.

### Informasi Bisnis

| Item | Detail |
|------|--------|
| Nama Toko | Juragan Grosir |
| Tagline | Kacamata Premium dan Grosir |
| Domain | juragangrosir.com |
| Alamat Fisik | Dusun Krajan 1, RT 002/008 Jombang, Kec. Jombang, Kab. Jember, Jawa Timur 68168 |
| Kontak | WhatsApp: +62 812 3456 7890 |
| Email | support@juragangrosir.id |

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | **Next.js 16.2.4** (App Router) |
| Runtime | React 19.2.4 |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | **Supabase** (PostgreSQL + Row Level Security) |
| Auth | **Supabase Auth** (email/password, magic link) |
| Object Storage | **Cloudflare R2** (S3-compatible, untuk gambar produk) |
| Shipping | **Biteship API** (tarif kurir real-time: JNE, J&T, Central Cargo) |
| Icons | Lucide React |
| Validation | Zod v4 |
| Export | ExcelJS, PapaParse (admin CSV/Excel export) |
| Deployment | **Vercel** (auto-deploy dari GitHub) |

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Edge)                     │
│  ┌───────────────────────────────────────────────┐   │
│  │            Next.js 16 App Router              │   │
│  │  ┌─────────────┐  ┌────────────────────────┐  │   │
│  │  │  Storefront  │  │    Admin Dashboard     │  │   │
│  │  │  (Public)    │  │  (HTTP Basic Auth)     │  │   │
│  │  └──────┬───────┘  └──────────┬─────────────┘  │   │
│  │         │                     │                │   │
│  │  ┌──────┴─────────────────────┴──────────┐     │   │
│  │  │         API Routes (/api/*)           │     │   │
│  │  │  orders · products · shipping · admin │     │   │
│  │  └──────┬────────────┬───────────────────┘     │   │
│  └─────────┼────────────┼────────────────────────┘   │
│            │            │                            │
└────────────┼────────────┼────────────────────────────┘
             │            │
    ┌────────▼──────┐  ┌──▼──────────┐  ┌─────────────┐
    │   Supabase    │  │  Biteship   │  │ Cloudflare  │
    │  (PostgreSQL) │  │  API (v1)   │  │   R2        │
    │  Auth + RLS   │  │  Shipping   │  │  Images     │
    └───────────────┘  └─────────────┘  └─────────────┘
```

---

## 4. Katalog Produk

### 4.1 Kategori

| Slug | Nama | Deskripsi |
|------|------|-----------|
| `eyeglasses` | Eyeglasses | Frame optik dari asetat, titanium, dan TR-90 |
| `sunglasses` | Sunglasses | Kacamata hitam UV400 fashion dan sport |
| `blue-light` | Blue Light Glasses | Lensa anti-blue-light untuk layar |
| `accessories` | Accessories | Case, cleaning kit, dan perawatan |

### 4.2 Produk (12 SKU Awal)

| SKU | Nama | Kategori | Harga Retail | Harga Reseller | Berat |
|-----|------|----------|-------------|----------------|-------|
| JG-CLS-BLK-01 | JG Classic Black | Eyeglasses | Rp 145.000 | Rp 105.000 | 60g |
| JG-RND-GLD-01 | JG Round Gold | Eyeglasses | Rp 165.000 | Rp 119.000 | 45g |
| JG-AVT-ELT-01 | JG Aviator Elite | Sunglasses | Rp 185.000 | Rp 135.000 | 55g |
| JG-TRT-BRN-01 | JG Tortoise Brown | Eyeglasses | Rp 155.000 | Rp 112.000 | 58g |
| JG-BLP-NVY-01 | JG Bluelight Pro | Blue Light | Rp 175.000 → Rp 149.000 | Rp 122.000 | 25g |
| JG-CAT-RSE-01 | JG Cat Eye Rose | Eyeglasses | Rp 169.000 | Rp 122.000 | 50g |
| JG-SPR-OLV-01 | JG Sport Runner | Sunglasses | Rp 159.000 | Rp 115.000 | 30g |
| JG-MIR-SLV-01 | JG Mirror Silver | Sunglasses | Rp 199.000 | Rp 145.000 | 53g |
| JG-KID-NVY-01 | JG Kid Buddy | Blue Light | Rp 125.000 | Rp 89.000 | 18g |
| JG-PRM-TIT-01 | JG Premium Titanium | Eyeglasses | Rp 285.000 | Rp 215.000 | 14g |
| JG-ACC-CSE-01 | JG Hard Leather Case | Accessories | Rp 65.000 | Rp 42.000 | 90g |
| JG-ACC-CLN-01 | JG Lens Cleaning Kit | Accessories | Rp 35.000 | Rp 22.000 | 80g |

### 4.3 Varian Produk

Setiap produk dapat memiliki varian berdasarkan:
- **Warna frame** (color)
- **Tipe** (variant_type)
- **Ukuran** (size)

Varian memiliki stok independen dan opsional `price_override`.

---

## 5. Halaman Storefront

### 5.1 Homepage (`/`)
- Hero section dengan CTA "Belanja Sekarang"
- Grid produk unggulan (Featured Products)
- Kategori populer
- FAQ Preview
- Floating WhatsApp button

### 5.2 Shop (`/shop`)
- Katalog lengkap semua produk
- Filter: kategori, gender, style, frame, warna
- Sorting: harga, nama, rating
- Pagination

### 5.3 Product Detail (`/shop/[slug]`)
- Galeri gambar produk (Cloudflare R2)
- Spesifikasi produk (material, ukuran lensa, bridge, temple)
- Pemilihan varian (warna/tipe/ukuran)
- Tabel harga grosir (tier pricing)
- Rating & review count
- Tombol "Tambah ke Keranjang" + "Beli Sekarang"
- Produk terkait

### 5.4 Collections (`/collections`)
- Halaman koleksi berdasarkan kategori
- Grid produk per kategori

### 5.5 Cart (`/cart`)
- Daftar item keranjang (localStorage-based)
- Perubahan kuantitas real-time
- Perhitungan subtotal otomatis (tier pricing applied)
- CTA ke Checkout

### 5.6 Checkout (`/checkout`)
- **Informasi Pelanggan**: Nama, HP/WhatsApp, Email
- **Alamat Pengiriman**: 
  - Autocomplete kota/kecamatan via Biteship Maps API
  - Auto-fill provinsi, kota, kode pos
  - Alamat lengkap + catatan
- **Metode Pengiriman**: Tarif kurir real-time dari Biteship
  - JNE (REG, YES, OKE)
  - J&T (EZ, Express)
  - Central Cargo
- **Metode Pembayaran**: QRIS, Virtual Account, Transfer Bank
- **Ringkasan Pesanan**: line items, subtotal, ongkir, total
- Server-side price validation (anti-manipulation)

### 5.7 Checkout Success (`/checkout/success`)
- Konfirmasi nomor pesanan
- Ringkasan pembayaran
- CTA ke halaman pesanan

### 5.8 Halaman Lainnya

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| About | `/about` | Tentang Juragan Grosir, keunggulan |
| Contact | `/contact` | Form kontak + info WhatsApp |
| Wholesale | `/wholesale` | Penjelasan program grosir + tabel harga |
| Legal: Shipping | `/legal/shipping` | Kebijakan pengiriman |
| Legal: Privacy | `/legal/privacy` | Kebijakan privasi |
| Legal: Terms | `/legal/terms` | Syarat & ketentuan |

---

## 6. Sistem Autentikasi

### 6.1 Flow

| Path | Fungsi |
|------|--------|
| `/login` | Login via email + password (Supabase Auth) |
| `/register` | Registrasi akun baru |
| `/forgot-password` | Reset password via email |

### 6.2 User Roles

| Role | Deskripsi | Pricing |
|------|-----------|---------|
| `customer` | Pelanggan biasa | Retail price / promo price |
| `reseller` | Reseller terverifikasi | Reseller price (lebih murah) |
| `wholesale` | Pembeli grosir | Tier pricing berdasarkan kuantitas |
| `admin` | Administrator | Akses dashboard admin |

### 6.3 Reseller Application

- Pelanggan bisa apply jadi reseller via `/account/become-reseller`
- Status: `none` → `pending` → `approved` / `rejected`
- Admin review di dashboard

### 6.4 Account Dashboard (`/account`)

- Profil pengguna (edit nama, HP, email)
- Daftar pesanan + detail + tracking
- Status reseller
- Tombol "Beli Lagi" (repeat order)

---

## 7. Sistem Pricing

### 7.1 Pricing Waterfall

Prioritas harga ditentukan oleh rules berikut (dari tinggi ke rendah):

```
1. Variant price_override → jika varian punya harga khusus
2. Reseller price        → jika user = reseller & reseller_price ada
3. Wholesale tier        → jika quantity >= tier.min_qty
4. Promotional price     → jika promotional_price ada
5. Retail price          → harga default
```

### 7.2 Wholesale Tiers

Setiap produk bisa punya beberapa tier harga grosir:

| Tier | Kuantitas | Contoh (JG Classic Black) |
|------|-----------|--------------------------|
| Tier 1 | 6–11 pcs | Rp 125.000/pcs |
| Tier 2 | 12+ pcs | Rp 110.000/pcs |

Minimum wholesale quantity: **6 pcs**.

---

## 8. Sistem Pengiriman (Biteship)

### 8.1 Integrasi

| Endpoint | Fungsi |
|----------|--------|
| `GET /v1/maps/areas` | Autocomplete area tujuan |
| `POST /v1/rates/couriers` | Cek tarif ongkir real-time |

### 8.2 Proxy API Routes

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/shipping/areas?q=...` | GET | Autocomplete kota/kecamatan |
| `/api/shipping/rates` | POST | Ambil tarif kurir berdasarkan tujuan + berat |

### 8.3 Alamat Asal

- Lokasi: Jember, Jawa Timur
- Kode Pos: **68168**

### 8.4 Kurir Aktif

| Kode Biteship | Nama |
|---------------|------|
| `jne` | JNE |
| `jnt` | J&T Express |
| `sentralcargo` | Central Cargo |

### 8.5 Validasi Server-Side

Saat order dibuat, server **re-fetch tarif dari Biteship** untuk:
- Memverifikasi kurir + layanan masih tersedia
- Menggunakan harga dari server (bukan harga yang dikirim client)
- Mencegah manipulasi ongkos kirim

---

## 9. Admin Dashboard

### 9.1 Autentikasi

Admin dashboard dilindungi oleh **HTTP Basic Auth** (`ADMIN_BASIC_AUTH_USER` + `ADMIN_BASIC_AUTH_PASSWORD` env vars).

### 9.2 Halaman Admin

| Halaman | Path | Fitur |
|---------|------|-------|
| Dashboard | `/admin` | Overview: total pesanan, revenue, pending orders |
| Products | `/admin/products` | CRUD produk, varian, tier harga, upload gambar |
| Categories | `/admin/categories` | Kelola kategori produk |
| Orders | `/admin/orders` | Daftar pesanan, update status, input resi |
| Customers | `/admin/customers` | Daftar pelanggan |
| Reseller Apps | `/admin/reseller-applications` | Review & approve/reject aplikasi reseller |
| Contact Messages | `/admin/contact-messages` | Inbox pesan kontak dari customer |
| Settings | `/admin/settings` | Konfigurasi toko, API keys, SEO, pixel tracking |

### 9.3 Manajemen Produk

- CRUD lengkap: tambah, edit, hapus produk
- Upload gambar ke Cloudflare R2
- Kelola varian (warna, tipe, ukuran) dengan stok per-varian
- Kelola tier harga grosir
- Atomic stock decrement (race condition safe)

### 9.4 Manajemen Pesanan

Status pesanan: `pending` → `paid` → `processing` → `packed` → `shipped` → `fulfilled`

- Update status pesanan
- Input nomor resi (tracking number) + kurir
- Catatan admin per pesanan
- Export data pesanan (CSV/Excel)

---

## 10. Database Schema (Supabase)

### 10.1 Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `categories` | Kategori produk (slug, nama, deskripsi) |
| `products` | Produk (12+ kolom: harga, stok, berat, specs, dll) |
| `product_variants` | Varian per produk (warna, tipe, ukuran, stok) |
| `product_price_tiers` | Tier harga grosir per produk |
| `customers` | Data pelanggan (email, nama, HP) |
| `orders` | Pesanan (alamat, kurir, biaya, status) |
| `order_items` | Item per pesanan (produk, varian, qty, harga) |
| `users` | User accounts (role, reseller_status) |
| `reseller_applications` | Aplikasi jadi reseller |
| `contact_messages` | Pesan kontak dari form |
| `site_settings` | Konfigurasi toko (singleton, id=1) |

### 10.2 Stored Procedures (RPC)

| Function | Deskripsi |
|----------|-----------|
| `decrement_stock_atomic(p_items)` | Kurangi stok secara atomic, raise exception jika kurang |
| `replace_product_variants(p_product_id, p_variants)` | Replace varian atomically |
| `replace_product_price_tiers(p_product_id, p_tiers)` | Replace tier atomically |

### 10.3 Row Level Security

- Katalog (products, categories, variants, tiers): **public read**
- Users: **read own row only** (by `auth.uid()`)
- Orders, customers, settings: **no public access** (service-role only via API routes)

---

## 11. Environment Variables

| Variable | Scope | Deskripsi |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | URL Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role key (bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | Public | Domain produksi (juragangrosir.com) |
| `ADMIN_BASIC_AUTH_USER` | Server | Username admin dashboard |
| `ADMIN_BASIC_AUTH_PASSWORD` | Server | Password admin dashboard |
| `BITESHIP_API_KEY` | Server | API key Biteship (testing/production) |
| `R2_ACCOUNT_ID` | Server | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Server | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Server | R2 secret key |
| `R2_BUCKET_NAME` | Server | Nama bucket R2 |
| `R2_PUBLIC_URL` | Server | URL publik R2 bucket |

---

## 12. API Routes

### 12.1 Public Routes

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/products` | Daftar produk (dengan filter) |
| GET | `/api/products/[slug]` | Detail produk |
| POST | `/api/orders` | Buat pesanan baru |
| POST | `/api/contact-messages` | Kirim pesan kontak |
| POST | `/api/reseller-applications` | Submit aplikasi reseller |
| GET | `/api/me` | Info user yang login |
| GET | `/api/shipping/areas?q=...` | Autocomplete area tujuan |
| POST | `/api/shipping/rates` | Tarif kurir real-time |

### 12.2 Admin Routes (HTTP Basic Auth)

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET/POST/PATCH/DELETE | `/api/admin/products/*` | CRUD produk + upload gambar |
| GET/PATCH | `/api/admin/settings` | Konfigurasi toko |
| GET/PATCH | `/api/admin/orders/*` | Kelola pesanan |
| GET | `/api/admin/customers` | Daftar pelanggan |
| GET/PATCH | `/api/admin/reseller-applications/*` | Review reseller |
| GET/PATCH | `/api/admin/contact-messages/*` | Kelola pesan kontak |

---

## 13. SEO & Analytics

### 13.1 SEO

- Sitemap otomatis (`/sitemap.xml`)
- Robots.txt (`/robots.txt`)
- Meta title & description per halaman
- Open Graph & Twitter Card metadata
- Semantic HTML (h1 per page, proper heading hierarchy)

### 13.2 Tracking Pixel (Configurable via Admin)

| Platform | Field di Settings |
|----------|-------------------|
| Meta/Facebook Pixel | `pixel_meta_id` |
| TikTok Pixel | `pixel_tiktok_id` |
| Google Analytics | `pixel_google_id` |

---

## 14. Fitur Keamanan

1. **Server-side price validation** — Harga dihitung ulang di server saat order, bukan dari client
2. **Atomic stock decrement** — Stok dikurangi via stored procedure untuk menghindari race condition
3. **Aggregated quantity check** — Duplikat item di-aggregate sebelum validasi stok
4. **Variant ownership check** — Variant ID harus milik product yang benar
5. **Shipping cost verification** — Tarif kurir di-re-fetch dari Biteship saat order
6. **RLS (Row Level Security)** — Akses database dibatasi per-role
7. **HTTP Basic Auth** — Admin dashboard dilindungi credential
8. **Server-only secrets** — API keys tidak pernah di-expose ke browser

---

## 15. Future Roadmap

| Fase | Fitur | Status |
|------|-------|--------|
| ✅ MVP | Storefront, Cart, Checkout, Admin Dashboard | Done |
| ✅ Shipping | Biteship API integration (real-time rates) | Done |
| 🔲 Phase 2 | Biteship Order API (auto-booking & tracking) | Planned |
| 🔲 Phase 2 | Payment gateway (Midtrans/Xendit) | Planned |
| 🔲 Phase 3 | WhatsApp order notification (auto-send) | Planned |
| 🔲 Phase 3 | Customer reviews & ratings system | Planned |
| 🔲 Phase 4 | Coupon/discount system | Planned |
| 🔲 Phase 4 | Multi-language support (EN) | Planned |
