-- =============================================================
-- Stock movements log
-- =============================================================
--
-- Append-only ledger of every stock change. The existing
-- `decrement_stock_atomic` function (used by /api/orders) is extended
-- to insert one row per item it decrements. Admin manual edits and
-- refund-time restocks also write here so we have a complete history
-- of how each product/variant arrived at its current stock value.
--
-- Run this once in Supabase SQL editor; idempotent.

create table if not exists public.stock_movements (
  id         bigserial primary key,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  delta      int  not null,                  -- negative = decrement, positive = restock
  reason     text not null,                  -- 'order_create' | 'order_refund' | 'admin_edit' | 'import'
  order_id   uuid references public.orders(id) on delete set null,
  note       text,
  actor      text,                           -- admin email when reason='admin_edit'
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_idx
  on public.stock_movements (product_id, created_at desc);
create index if not exists stock_movements_variant_idx
  on public.stock_movements (variant_id, created_at desc);
create index if not exists stock_movements_order_idx
  on public.stock_movements (order_id);

-- Replace decrement_stock_atomic to also write a movement row per item.
create or replace function public.decrement_stock_atomic(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item       jsonb;
  affected   int;
  v_qty      int;
  v_vid      uuid;
  v_pid      uuid;
  v_order_id uuid;
begin
  v_order_id := nullif(p_items->0->>'order_id','')::uuid;

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
      insert into public.stock_movements
        (product_id, variant_id, delta, reason, order_id)
        values (v_pid, v_vid, -v_qty, 'order_create', v_order_id);
    elsif v_pid is not null then
      update public.products
         set stock = stock - v_qty
       where id = v_pid and stock >= v_qty;
      get diagnostics affected = row_count;
      if affected = 0 then
        raise exception 'insufficient stock for product %', v_pid
          using errcode = 'P0001';
      end if;
      insert into public.stock_movements
        (product_id, variant_id, delta, reason, order_id)
        values (v_pid, null, -v_qty, 'order_create', v_order_id);
    end if;
  end loop;
end;
$$;

-- Mirror function for refund / cancel — increments stock back and
-- logs each line with reason='order_refund'.
create or replace function public.restock_order_items(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  row record;
  already int;
begin
  -- Idempotency: refuse to double-restock the same order. We check for
  -- any prior refund movement tied to this order. If found, exit silently.
  select count(*) into already
    from public.stock_movements
   where order_id = p_order_id and reason = 'order_refund';
  if already > 0 then return; end if;

  for row in
    select product_id, variant_id, quantity
      from public.order_items
     where order_id = p_order_id
  loop
    if row.variant_id is not null then
      update public.product_variants
         set stock = stock + row.quantity
       where id = row.variant_id;
      insert into public.stock_movements
        (product_id, variant_id, delta, reason, order_id)
        values (row.product_id, row.variant_id, row.quantity, 'order_refund', p_order_id);
    elsif row.product_id is not null then
      update public.products
         set stock = stock + row.quantity
       where id = row.product_id;
      insert into public.stock_movements
        (product_id, variant_id, delta, reason, order_id)
        values (row.product_id, null, row.quantity, 'order_refund', p_order_id);
    end if;
  end loop;
end;
$$;
