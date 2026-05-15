-- =============================================================
-- Discount coupons / voucher codes
-- =============================================================
-- Sitewide promo codes. Two discount modes:
--   * percent: discount_value = 1..100 (off the eligible subtotal)
--   * fixed:   discount_value = IDR amount off
-- A coupon can optionally require a minimum subtotal and have an
-- overall usage cap. Per-customer redemption history is tracked
-- via the coupon_redemptions table.

create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,           -- displayed code (uppercase)
  description     text,
  discount_type   text not null check (discount_type in ('percent','fixed')),
  discount_value  int  not null check (discount_value > 0),
  min_subtotal    int  not null default 0,        -- IDR
  max_uses        int,                            -- null = unlimited
  uses            int  not null default 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists coupons_code_idx on public.coupons (code);

create table if not exists public.coupon_redemptions (
  id         bigserial primary key,
  coupon_id  uuid not null references public.coupons(id) on delete cascade,
  order_id   uuid not null references public.orders(id) on delete cascade,
  customer_email text not null,
  discount   int  not null,
  created_at timestamptz not null default now()
);
create unique index if not exists coupon_redemptions_order_idx
  on public.coupon_redemptions (order_id);

-- Helper that atomically validates a coupon and (when ok) returns the
-- discount it applies to a given subtotal. Use from the order create
-- endpoint to keep the check & increment together.
create or replace function public.validate_and_consume_coupon(
  p_code text,
  p_subtotal int,
  p_order_id uuid,
  p_customer_email text
)
returns int  -- discount amount applied (0 if no coupon)
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  d int;
begin
  if p_code is null or p_code = '' then
    return 0;
  end if;

  select * into c from public.coupons
    where upper(code) = upper(p_code)
      and is_active = true
      and (valid_from is null or valid_from <= now())
      and (valid_until is null or valid_until >= now())
      and (max_uses is null or uses < max_uses)
    for update;

  if not found then
    raise exception 'coupon invalid or expired' using errcode = 'P0002';
  end if;

  if p_subtotal < c.min_subtotal then
    raise exception 'subtotal below coupon minimum'
      using errcode = 'P0003';
  end if;

  if c.discount_type = 'percent' then
    d := floor(p_subtotal * c.discount_value / 100);
  else
    d := c.discount_value;
  end if;
  if d > p_subtotal then d := p_subtotal; end if;

  update public.coupons set uses = uses + 1 where id = c.id;
  insert into public.coupon_redemptions
    (coupon_id, order_id, customer_email, discount)
    values (c.id, p_order_id, p_customer_email, d);

  return d;
end;
$$;

-- Add coupon-related columns to orders so we can show & report discounts.
alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists coupon_discount int not null default 0;
