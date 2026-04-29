# Juragan Grosir — Eyewear E-Commerce

A modern e-commerce storefront for **Juragan Grosir**, an Indonesian retail and
wholesale eyewear brand. Built per the project PRD with **Next.js 16 (App
Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

This is the public storefront MVP scaffold — covering homepage, catalog, product
detail with tiered pricing, cart, checkout UI, reseller application, contact,
collections, about, and the legal pages required by the PRD.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (zero-config, theme tokens via `@theme inline`)
- **lucide-react** for icons
- Self-contained SVG product imagery (no remote images required)

## Brand & design

| Token         | Value      |
| ------------- | ---------- |
| Primary navy  | `#01083C`  |
| Secondary     | Light blue accents |
| Background    | Clean white |
| Body font     | Inter (Google Fonts) |

The visual language is set in `src/app/globals.css` via `@theme inline` — colors,
radii, shadows, and shared `.btn`, `.card`, `.input` utility classes.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript only
```

## Project structure

```
src/
  app/                     # App Router routes
    page.tsx               # Home (hero, featured, categories, wholesale CTA…)
    shop/                  # Product catalog + filters
    shop/[slug]/           # Product detail + tiered-price calculator
    collections/           # Collections index + per-category pages
    about/                 # About Us
    wholesale/             # Become a Reseller (form)
    contact/               # Contact (form, WhatsApp, address)
    cart/                  # Shopping cart
    checkout/              # Checkout (customer info, address, shipping, payment)
    checkout/success/      # Order confirmation
    legal/{privacy,terms,returns,shipping}/
    sitemap.ts, robots.ts
  components/
    layout/                # Header, Footer, WhatsAppFloat
    home/                  # Hero, TrustBadges, CategoryGrid, WholesaleCTA, Testimonials, FAQPreview
    products/              # ProductCard, ProductGrid, GlassesArt (SVG)
    cart/                  # CartProvider (React Context + localStorage)
    legal/                 # Shared LegalPage component
    ui/                    # PageHeader
  lib/
    constants.ts           # SITE_NAME, WhatsApp number, NAV links…
    products.ts            # Mock product data + helpers
    pricing.ts             # Tiered-price calculator (PRD §7.4)
    format.ts              # Rupiah formatting
    types.ts
```

## Implemented PRD sections

| PRD ref      | Feature                                            | Status |
| ------------ | -------------------------------------------------- | ------ |
| §7.1         | Homepage (hero, featured, categories, wholesale CTA, best sellers, new arrivals, testimonials, FAQ) | Done |
| §7.2         | Product catalog with category / gender / style / price / wholesale / stock filters and sorting | Done |
| §7.3         | Product detail with image gallery, tier table, dynamic price preview, Add to Cart, Buy Now (WhatsApp question button) | Done |
| §7.4         | Tiered pricing system — retail, promo, wholesale tiers, reseller-aware logic | Done (client-side calculator) |
| §7.5         | Cart — add / update / remove, applied tier label, weight, persisted via localStorage | Done |
| §7.6         | Checkout UI — customer info, address, shipping method, payment method, order success | Done (client-only, payment integration is a stub) |
| §7.12        | WhatsApp floating support button + product detail support button | Done |
| §12          | Basic SEO — metadata, sitemap, robots, OG tags    | Done |
| §5.x         | Brand visual direction & navy palette              | Done |

## Supabase backend

Catalog data and order/lead writes are backed by **Supabase**. The storefront
falls back to the seed array in `src/lib/products.ts` when env vars are not
set, so local dev still works without database access.

### 1. Run the SQL schema

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**. This creates all tables, RLS policies, and seeds the 12
   products + 4 categories.
3. The script is idempotent — safe to re-run after editing.

### 2. Set environment variables

Copy `.env.example` to `.env.local` for local development, and add the same
variables to **Vercel → Project Settings → Environment Variables** for
the deployed site:

| Variable                          | Where it's used | Notes |
| --------------------------------- | --------------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL`        | server + browser | safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | server + browser | safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY`       | server only      | never exposed to the browser |
| `NEXT_PUBLIC_SITE_URL`            | server only      | **Required in production.** Canonical origin (no trailing slash) used to build Supabase auth email-confirmation and password-reset links. If unset in production the register / forgot-password actions return an error instead of falling back to attacker-controllable `Host` headers. |
| `ADMIN_BASIC_AUTH_USER`           | server only      | HTTP Basic-Auth username for `/admin/*`. If unset, `/admin` returns 503. |
| `ADMIN_BASIC_AUTH_PASSWORD`       | server only      | HTTP Basic-Auth password for `/admin/*`. |

### 3. Wired endpoints

| Route                         | Action |
| ----------------------------- | ------ |
| `POST /api/orders`            | Validates + recomputes pricing server-side, upserts the customer, inserts `orders` + `order_items` |
| `POST /api/reseller-applications` | Inserts a row into `reseller_applications` |
| `POST /api/contact-messages`  | Inserts a row into `contact_messages` |

Reads (`getProducts`, `getCategories`, `getProductBySlug`,
`getProductsByCategory`, `getRelatedProducts`) live in `src/lib/data.ts` and
prefer Supabase when configured; otherwise they fall back to the seed array.

### Re-generating the seed block

After editing `src/lib/products.ts`, regenerate the seed insert section of
`supabase/schema.sql` with:

```bash
npx tsx scripts/generate-seed-sql.mjs
```

This rewrites `supabase/_seed.sql` (a transient file) — paste its contents
into the bottom of `supabase/schema.sql`, replacing the previous seed block.

## Deployment

Deploy to **Vercel** with the three Supabase env vars above set. Future
phases (RajaOngkir live shipping rates, Komerce payment redirects, admin
dashboard) layer on top of the same `orders` / `order_items` tables.
