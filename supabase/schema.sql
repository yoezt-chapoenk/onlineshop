-- =====================================================================
-- Juragan Grosir — Supabase schema
-- =====================================================================
-- Paste the entire contents of this file into the Supabase SQL Editor
-- (Project → SQL Editor → New query) and click Run. Idempotent: safe
-- to re-run; existing rows are preserved by ON CONFLICT clauses.
--
-- After this script runs successfully, set the following env vars in
-- Vercel (Project Settings → Environment Variables):
--   NEXT_PUBLIC_SUPABASE_URL        — https://<project>.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY   — anon public key (safe to expose)
--   SUPABASE_SERVICE_ROLE_KEY       — service role key (server only)
-- =====================================================================

-- 1. Extensions ---------------------------------------------------------
create extension if not exists "pgcrypto";

-- 2. Enums --------------------------------------------------------------
do $$ begin
  create type public.order_status as enum (
    'pending','paid','processing','packed','shipped',
    'fulfilled','cancelled','refunded'
  );
exception when duplicate_object then null; end $$;

-- Append-safe value upserts for clusters that already had the older enum.
do $$ begin alter type public.order_status add value if not exists 'processing'; exception when others then null; end $$;
do $$ begin alter type public.order_status add value if not exists 'packed';     exception when others then null; end $$;
do $$ begin alter type public.order_status add value if not exists 'shipped';    exception when others then null; end $$;
do $$ begin alter type public.order_status add value if not exists 'refunded';   exception when others then null; end $$;

do $$ begin
  create type public.payment_method as enum ('qris','va','transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('customer','reseller','wholesale','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reseller_status as enum ('none','pending','approved','rejected');
exception when duplicate_object then null; end $$;

-- 3. Catalog tables -----------------------------------------------------
create table if not exists public.categories (
  slug         text primary key,
  name         text not null,
  description  text not null,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  sku                 text unique not null,
  name                text not null,
  short_description   text not null,
  description         text not null,
  category_slug       text not null references public.categories(slug),
  category_label      text not null,
  gender              text not null check (gender in ('men','women','unisex','kids')),
  style               text not null check (style in ('fashion','casual','sport','vintage','premium')),
  frame               text not null check (frame in ('classic','round','aviator','rectangle','cateye','browline')),
  retail_price        int  not null,
  promotional_price   int,
  reseller_price      int,
  min_wholesale_qty   int  not null default 0,
  stock               int  not null default 0,
  weight_gram         int  not null default 0,
  is_featured         boolean not null default false,
  is_best_seller      boolean not null default false,
  is_new_arrival      boolean not null default false,
  rating              numeric(3,2) not null default 0,
  review_count        int  not null default 0,
  colors              text[] not null default '{}',
  frame_color         text not null check (frame_color in ('black','gold','silver','tortoise','navy','rose','olive')),
  lens_color          text check (lens_color in ('clear','smoke','green','amber','blue','mirror')),
  specs               jsonb not null default '[]'::jsonb,
  created_at          timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_slug);
create index if not exists products_featured_idx on public.products (is_featured);

create table if not exists public.product_price_tiers (
  id          bigserial primary key,
  product_id  uuid not null references public.products(id) on delete cascade,
  min_qty     int  not null,
  max_qty     int,
  unit_price  int  not null,
  label       text not null,
  unique (product_id, min_qty)
);
create index if not exists tiers_product_idx on public.product_price_tiers (product_id);

-- Per-product variants (color / type / size). A product may have zero
-- variants (single-SKU behaviour, stock tracked on products.stock) or
-- many. When variants exist, per-variant stock is authoritative and the
-- storefront forces the shopper to pick a combination before adding to
-- cart.
create table if not exists public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  sku             text not null,
  color           text,
  variant_type    text,
  size            text,
  stock           int  not null default 0,
  price_override  int,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now(),
  unique (product_id, sku)
);
create index if not exists variants_product_idx on public.product_variants (product_id);

-- Atomic variant replacement used by /api/admin/products PATCH so that
-- a delete-then-insert pair never strands a product without variants
-- when the insert fails (constraint violation, network error, etc).
-- Variant ids carried in the payload are preserved so order_items
-- foreign keys don't dangle when an admin reorders variants.
create or replace function public.replace_product_variants(
  p_product_id uuid,
  p_variants   jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.product_variants where product_id = p_product_id;
  if p_variants is not null and jsonb_typeof(p_variants) = 'array' and jsonb_array_length(p_variants) > 0 then
    insert into public.product_variants (
      id, product_id, sku, color, variant_type, size, stock, price_override, sort_order
    )
    select
      coalesce(nullif(v->>'id','')::uuid, gen_random_uuid()),
      p_product_id,
      v->>'sku',
      nullif(v->>'color',''),
      nullif(v->>'variant_type',''),
      nullif(v->>'size',''),
      coalesce((v->>'stock')::int, 0),
      nullif(v->>'price_override','')::int,
      coalesce((v->>'sort_order')::int, 0)
    from jsonb_array_elements(p_variants) as v;
  end if;
end;
$$;

-- Atomic stock decrement used by POST /api/orders to close the
-- Time-of-Check → Time-of-Use race between stock validation and the
-- final `insert into order_items`. Each UPDATE guards itself with
-- `stock >= quantity`, so two concurrent orders for the same variant
-- cannot both succeed past available stock. Any shortfall raises and
-- aborts the whole call, letting the JS caller roll back the order.
create or replace function public.decrement_stock_atomic(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item     jsonb;
  affected int;
  v_qty    int;
  v_vid    uuid;
  v_pid    uuid;
begin
  for item in select * from jsonb_array_elements(p_items) loop
    v_qty := (item->>'quantity')::int;
    v_vid := nullif(item->>'variant_id','')::uuid;
    v_pid := nullif(item->>'product_id','')::uuid;
    if v_vid is not null then
      update public.product_variants
         set stock = stock - v_qty
       where id = v_vid and stock >= v_qty;
      get diagnostics affected = row_count;
      if affected = 0 then
        raise exception 'insufficient stock for variant %', v_vid
          using errcode = 'P0001';
      end if;
    elsif v_pid is not null then
      update public.products
         set stock = stock - v_qty
       where id = v_pid and stock >= v_qty;
      get diagnostics affected = row_count;
      if affected = 0 then
        raise exception 'insufficient stock for product %', v_pid
          using errcode = 'P0001';
      end if;
    end if;
  end loop;
end;
$$;

-- Atomic tier replacement used by /api/admin/products PATCH so that
-- a delete-then-insert pair never strands a product with no tiers
-- when the insert fails (constraint violation, network error, etc).
create or replace function public.replace_product_price_tiers(
  p_product_id uuid,
  p_tiers      jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.product_price_tiers where product_id = p_product_id;
  if p_tiers is not null and jsonb_typeof(p_tiers) = 'array' and jsonb_array_length(p_tiers) > 0 then
    insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label)
    select
      p_product_id,
      (t->>'min_qty')::int,
      nullif(t->>'max_qty','')::int,
      (t->>'unit_price')::int,
      t->>'label'
    from jsonb_array_elements(p_tiers) as t;
  end if;
end;
$$;

-- 4. Customer / order tables -------------------------------------------
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text not null,
  phone       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  order_number          text unique not null,
  customer_id           uuid references public.customers(id) on delete set null,
  customer_email        text not null,
  customer_name         text not null,
  customer_phone        text not null,
  shipping_province     text not null,
  shipping_city         text not null,
  shipping_district     text not null,
  shipping_postal_code  text not null,
  shipping_address      text not null,
  shipping_notes        text,
  shipping_courier      text not null,
  shipping_service      text not null,
  shipping_cost         int  not null,
  payment_method        public.payment_method not null,
  subtotal              int  not null,
  total                 int  not null,
  item_count            int  not null,
  weight_gram           int  not null,
  status                public.order_status not null default 'pending',
  tracking_courier      text,
  tracking_number       text,
  admin_note            text,
  updated_at            timestamptz not null default now(),
  created_at            timestamptz not null default now()
);
alter table public.orders add column if not exists tracking_courier text;
alter table public.orders add column if not exists tracking_number  text;
alter table public.orders add column if not exists admin_note       text;
alter table public.orders add column if not exists updated_at       timestamptz not null default now();
create index if not exists orders_email_idx on public.orders (customer_email);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id            bigserial primary key,
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_slug  text not null,
  product_sku   text not null,
  product_name  text not null,
  variant_id    uuid references public.product_variants(id) on delete set null,
  variant_label text,
  variant_color text,
  variant_type  text,
  variant_size  text,
  quantity      int  not null,
  unit_price    int  not null,
  tier_label    text,
  subtotal      int  not null
);
alter table public.order_items add column if not exists variant_id    uuid references public.product_variants(id) on delete set null;
alter table public.order_items add column if not exists variant_label text;
alter table public.order_items add column if not exists variant_color text;
alter table public.order_items add column if not exists variant_type  text;
alter table public.order_items add column if not exists variant_size  text;
create index if not exists order_items_order_idx on public.order_items (order_id);

-- 5. Form submissions --------------------------------------------------
create table if not exists public.reseller_applications (
  id              uuid primary key default gen_random_uuid(),
  business_name   text not null,
  contact_name    text not null,
  email           text not null,
  phone           text not null,
  city            text not null,
  monthly_volume  text not null,
  notes           text,
  status          text not null default 'new',
  admin_note      text,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.reseller_applications add column if not exists admin_note  text;
alter table public.reseller_applications add column if not exists reviewed_at timestamptz;

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  status      text not null default 'new',
  admin_note  text,
  created_at  timestamptz not null default now()
);
alter table public.contact_messages add column if not exists admin_note text;

-- 5b. Auth + settings tables (admin dashboard) -------------------------
create table if not exists public.users (
  id               uuid primary key default gen_random_uuid(),
  email            text unique not null,
  phone            text,
  full_name        text not null,
  role             public.user_role not null default 'customer',
  reseller_status  public.reseller_status not null default 'none',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists users_role_idx on public.users (role);
create index if not exists users_reseller_status_idx on public.users (reseller_status);

create table if not exists public.site_settings (
  id                          int primary key default 1,
  store_name                  text not null default 'Juragan Grosir',
  store_logo_url              text,
  contact_email               text,
  whatsapp_number             text,
  store_address               text,
  rajaongkir_api_key          text,
  rajaongkir_payment_settings text,
  default_origin_id           text,
  default_origin_pinpoint     text,
  pixel_meta_id               text,
  pixel_tiktok_id             text,
  pixel_google_id             text,
  seo_default_title           text,
  seo_default_description     text,
  updated_at                  timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- 6. Row Level Security -------------------------------------------------
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.product_price_tiers    enable row level security;
alter table public.product_variants       enable row level security;
alter table public.customers              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.reseller_applications  enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.users                   enable row level security;
alter table public.site_settings           enable row level security;

-- Public catalog: anon may SELECT.
drop policy if exists "Public read categories"   on public.categories;
drop policy if exists "Public read products"     on public.products;
drop policy if exists "Public read price tiers"  on public.product_price_tiers;
drop policy if exists "Public read variants"     on public.product_variants;
create policy "Public read categories"  on public.categories            for select using (true);
create policy "Public read products"    on public.products              for select using (true);
create policy "Public read price tiers" on public.product_price_tiers   for select using (true);
create policy "Public read variants"    on public.product_variants      for select using (true);

-- Authenticated users can read their own profile row. Without this,
-- RLS on public.users silently returns empty, so getCurrentUser() never
-- finds a profile and reseller pricing can never be granted.
--
-- We intentionally do NOT add an UPDATE policy: the anon key is public
-- (NEXT_PUBLIC_SUPABASE_ANON_KEY), so a per-row UPDATE policy would let
-- any authenticated user hit the REST API directly and set their own
-- role/reseller_status to escalate into reseller pricing. All legitimate
-- profile writes go through the service-role admin client instead
-- (see src/app/(storefront)/account/profile/actions.ts and friends).
drop policy if exists "Users can read own row"   on public.users;
drop policy if exists "Users can update own row" on public.users;
create policy "Users can read own row"
  on public.users for select using (auth.uid() = id);

-- Customers / orders / items / form submissions: NO public access.
-- The Next.js API routes use the service-role key, which bypasses RLS,
-- so no permissive policy is needed for inserts.
-- (If you later add an authenticated dashboard, add policies that scope
-- rows to auth.uid() or your admin role here.)

-- 7. Seed data ---------------------------------------------------------
-- AUTO-GENERATED below by scripts/generate-seed-sql.mjs from
-- src/lib/products.ts. Re-run that script after editing the seed
-- file and paste the new section in place of the block below.

-- AUTO-GENERATED by scripts/generate-seed-sql.mjs
-- Re-run with: node scripts/generate-seed-sql.mjs

-- Categories
insert into public.categories (slug, name, description, sort_order) values ('eyeglasses', 'Eyeglasses', 'Everyday optical frames crafted from acetate, titanium, and TR-90.', 1) on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;
insert into public.categories (slug, name, description, sort_order) values ('sunglasses', 'Sunglasses', 'UV400-protected fashion and sport sunglasses.', 2) on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;
insert into public.categories (slug, name, description, sort_order) values ('blue-light', 'Blue Light Glasses', 'Anti-blue-light lenses for long screen days.', 3) on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;
insert into public.categories (slug, name, description, sort_order) values ('accessories', 'Accessories', 'Cases, cleaning kits, and care essentials.', 4) on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

-- Products
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-classic-black', 'JG-CLS-BLK-01', 'JG Classic Black', 'Timeless square frame in matte acetate — the everyday staple.', 'The JG Classic Black is a clean, modern square frame crafted from premium Italian acetate. Spring-hinged temples, lightweight construction, and a versatile silhouette make it the perfect daily eyewear for work, study, or a casual evening out.',
  'eyeglasses', 'Eyeglasses', 'unisex', 'casual', 'rectangle',
  145000, null, 105000,
  6, 84, 60,
  true, true, false,
  4.8, 132, '{"#01083c","#1a225a"}', 'black', 'clear', '[{"label":"Frame Material","value":"Italian acetate"},{"label":"Hinge","value":"Spring-hinge"},{"label":"Lens Width","value":"52 mm"},{"label":"Bridge","value":"20 mm"},{"label":"Temple","value":"145 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 125000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-classic-black' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 110000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-classic-black' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-round-gold', 'JG-RND-GLD-01', 'JG Round Gold', 'Vintage-inspired round wire frame in brushed gold.', 'A modern take on the heritage round frame — slim brushed-gold metal, adjustable nose pads, and ultra-light wire temples that feel barely-there. Effortless, refined, and conversation-starting.',
  'eyeglasses', 'Eyeglasses', 'unisex', 'vintage', 'round',
  165000, null, 119000,
  6, 56, 45,
  true, false, true,
  4.7, 88, '{"#1a225a","#2a3470"}', 'gold', 'clear', '[{"label":"Frame Material","value":"Brushed metal"},{"label":"Hinge","value":"Standard"},{"label":"Lens Width","value":"49 mm"},{"label":"Bridge","value":"21 mm"},{"label":"Temple","value":"145 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 142000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-round-gold' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 125000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-round-gold' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-aviator-elite', 'JG-AVT-ELT-01', 'JG Aviator Elite', 'Polarized aviator sunglasses with smoked green lenses.', 'Iconic teardrop silhouette, hand-finished metal frame, and polarized green-smoke lenses with full UV400 protection. Lightweight comfort meets serious sun-defense for highway drives, beach days, and rooftop evenings.',
  'sunglasses', 'Sunglasses', 'men', 'premium', 'aviator',
  185000, null, 135000,
  6, 42, 55,
  true, true, false,
  4.9, 214, '{"#01083c","#2a6df0"}', 'black', 'green', '[{"label":"Lens Type","value":"Polarized, UV400"},{"label":"Frame Material","value":"Aviation-grade metal"},{"label":"Lens Width","value":"58 mm"},{"label":"Bridge","value":"14 mm"},{"label":"Temple","value":"140 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 162000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-aviator-elite' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 145000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-aviator-elite' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-tortoise-brown', 'JG-TRT-BRN-01', 'JG Tortoise Brown', 'Classic browline frame in rich tortoise acetate — bookish charm.', 'A sophisticated browline frame with hand-polished tortoise pattern and slim metal accents. Rounded corners and a slightly curved brow give a soft, intelligent character that flatters most face shapes.',
  'eyeglasses', 'Eyeglasses', 'unisex', 'fashion', 'browline',
  155000, null, 112000,
  6, 71, 58,
  true, false, true,
  4.6, 95, '{"#060c3f","#1a225a"}', 'tortoise', 'clear', '[{"label":"Frame Material","value":"Acetate + metal brow"},{"label":"Hinge","value":"Spring-hinge"},{"label":"Lens Width","value":"51 mm"},{"label":"Bridge","value":"21 mm"},{"label":"Temple","value":"145 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 134000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-tortoise-brown' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 119000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-tortoise-brown' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-bluelight-pro', 'JG-BLP-NVY-01', 'JG Bluelight Pro', 'Anti-blue-light lenses for long screen days.', 'Designed for developers, designers, and anyone who lives on-screen. The Bluelight Pro filters up to 40% of high-energy blue light while keeping colors true. Ultra-light TR-90 frame stays comfortable through 12-hour shifts.',
  'blue-light', 'Blue Light Glasses', 'unisex', 'casual', 'rectangle',
  175000, 149000, 122000,
  6, 120, 25,
  false, true, true,
  4.7, 168, '{"#01083c","#2a6df0"}', 'navy', 'amber', '[{"label":"Frame Material","value":"TR-90 thermoplastic"},{"label":"Lens Filter","value":"Up to 40% HEV blue light"},{"label":"Lens Width","value":"53 mm"},{"label":"Bridge","value":"18 mm"},{"label":"Temple","value":"145 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 149000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-bluelight-pro' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 132000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-bluelight-pro' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-cateye-rose', 'JG-CAT-RSE-01', 'JG Cat Eye Rose', 'Sculpted cat-eye in rose-tinted acetate.', 'A confident silhouette with sculpted brow corners and a soft rose translucent finish. Built for everyday glamour — from morning meetings to weekend brunches.',
  'eyeglasses', 'Eyeglasses', 'women', 'fashion', 'cateye',
  169000, null, 122000,
  6, 38, 50,
  false, false, true,
  4.6, 47, '{"#7cabff","#1a225a"}', 'rose', 'clear', '[{"label":"Frame Material","value":"Italian acetate"},{"label":"Lens Width","value":"52 mm"},{"label":"Bridge","value":"18 mm"},{"label":"Temple","value":"140 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 145000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-cateye-rose' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 129000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-cateye-rose' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-sport-runner', 'JG-SPR-OLV-01', 'JG Sport Runner', 'Wraparound sport sunglasses for active days.', 'Aerodynamic wraparound sport sunglasses with grippy nose pads, anti-fog vents, and shatter-resistant polycarbonate lenses. Built for runners, cyclists, and weekend warriors.',
  'sunglasses', 'Sunglasses', 'unisex', 'sport', 'rectangle',
  159000, null, 115000,
  6, 64, 30,
  false, true, false,
  4.5, 73, '{"#2a3470","#01083c"}', 'olive', 'smoke', '[{"label":"Frame Material","value":"Polycarbonate"},{"label":"Lens Type","value":"UV400, anti-scratch"},{"label":"Lens Width","value":"62 mm"},{"label":"Bridge","value":"12 mm"},{"label":"Temple","value":"135 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 138000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-sport-runner' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 122000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-sport-runner' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-mirror-silver', 'JG-MIR-SLV-01', 'JG Mirror Silver', 'Statement aviators with silver mirror lenses.', 'Bold reflective aviators with a polished silver finish and double-bridge construction. UV400 protection wrapped in unmistakable confidence.',
  'sunglasses', 'Sunglasses', 'unisex', 'fashion', 'aviator',
  199000, null, 145000,
  6, 28, 53,
  false, false, true,
  4.8, 36, '{"#aab2cf","#495489"}', 'silver', 'mirror', '[{"label":"Lens Type","value":"Mirror coated, UV400"},{"label":"Frame Material","value":"Stainless steel"},{"label":"Lens Width","value":"60 mm"},{"label":"Bridge","value":"14 mm"},{"label":"Temple","value":"140 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 172000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-mirror-silver' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 155000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-mirror-silver' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-kid-buddy', 'JG-KID-NVY-01', 'JG Kid Buddy', 'Flexible blue-light glasses for kids 6–12.', 'Bend-don''t-break TR-90 frames with soft silicone temple tips and 35% blue-light filtering — perfect for tablet time, online classes, and screen-heavy school days.',
  'blue-light', 'Blue Light Glasses', 'kids', 'casual', 'round',
  125000, null, 89000,
  6, 92, 18,
  false, false, false,
  4.7, 51, '{"#1a225a","#7cabff"}', 'navy', 'amber', '[{"label":"Frame Material","value":"TR-90 thermoplastic"},{"label":"Recommended Age","value":"6–12 years"},{"label":"Lens Width","value":"44 mm"},{"label":"Bridge","value":"16 mm"},{"label":"Temple","value":"120 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 108000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-kid-buddy' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 95000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-kid-buddy' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-premium-titanium', 'JG-PRM-TIT-01', 'JG Premium Titanium', 'Featherweight titanium frame — uncompromising luxury.', 'Hand-finished beta-titanium frame with hypoallergenic nose pads and Japanese hinges. Weighs less than 14g, yet feels engineered for a lifetime of daily wear.',
  'eyeglasses', 'Eyeglasses', 'men', 'premium', 'rectangle',
  285000, null, 215000,
  6, 22, 14,
  false, false, true,
  4.9, 41, '{"#1a225a","#01083c"}', 'silver', 'clear', '[{"label":"Frame Material","value":"Beta-titanium"},{"label":"Hinge","value":"Japanese spring-hinge"},{"label":"Lens Width","value":"54 mm"},{"label":"Bridge","value":"18 mm"},{"label":"Temple","value":"145 mm"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 248000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-premium-titanium' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 225000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-premium-titanium' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-leather-case', 'JG-ACC-CSE-01', 'JG Hard Leather Case', 'Premium hard-shell case with magnetic closure and microfiber lining.', 'A protective hard-shell eyewear case wrapped in vegan leather, lined with soft microfiber, and finished with a satisfying magnetic snap closure. Fits all JG eyewear sizes.',
  'accessories', 'Accessories', 'unisex', 'premium', 'rectangle',
  65000, null, 42000,
  6, 240, 90,
  false, true, false,
  4.8, 312, '{"#01083c","#2a3470"}', 'black', null, '[{"label":"Material","value":"Vegan leather, hard shell"},{"label":"Closure","value":"Magnetic snap"},{"label":"Includes","value":"Microfiber cleaning cloth"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 55000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-leather-case' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 48000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-leather-case' on conflict do nothing;
insert into public.products (
  id, slug, sku, name, short_description, description,
  category_slug, category_label, gender, style, frame,
  retail_price, promotional_price, reseller_price,
  min_wholesale_qty, stock, weight_gram,
  is_featured, is_best_seller, is_new_arrival,
  rating, review_count, colors, frame_color, lens_color, specs
) values (
  gen_random_uuid(), 'jg-cleaning-kit', 'JG-ACC-CLN-01', 'JG Lens Cleaning Kit', 'Spray + microfiber cloth bundle for streak-free clarity.', 'Alcohol-free anti-smudge cleaning spray paired with two premium microfiber cloths. Safe for anti-reflective and blue-light coated lenses.',
  'accessories', 'Accessories', 'unisex', 'casual', 'rectangle',
  35000, null, 22000,
  6, 410, 80,
  false, false, false,
  4.6, 218, '{"#aab2cf"}', 'silver', null, '[{"label":"Includes","value":"30ml spray + 2 microfiber cloths"},{"label":"Coatings","value":"Safe for AR, BL, and mirror lenses"}]'::jsonb
) on conflict (slug) do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 6, 11, 30000, 'Wholesale tier 1 (6–11 pcs)' from public.products where slug = 'jg-cleaning-kit' on conflict do nothing;
insert into public.product_price_tiers (product_id, min_qty, max_qty, unit_price, label) select id, 12, null, 26000, 'Wholesale tier 2 (12+ pcs)' from public.products where slug = 'jg-cleaning-kit' on conflict do nothing;
