-- =============================================================
-- admin_overview_stats() — single RPC that returns the dashboard
-- snapshot in one round-trip instead of three full table scans
-- followed by JS aggregation.
-- =============================================================
create or replace function public.admin_overview_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_sales      bigint;
  v_total_orders     int;
  v_pending_payments int;
  v_to_process       int;
  v_low_stock        int;
  v_best_sellers     jsonb;
begin
  -- One pass over orders for the four counters.
  select
    coalesce(sum(total) filter (where status not in ('cancelled','refunded')), 0),
    count(*),
    count(*) filter (where status = 'pending'),
    count(*) filter (where status in ('paid','processing','packed'))
  into v_total_sales, v_total_orders, v_pending_payments, v_to_process
  from public.orders;

  select count(*) into v_low_stock
    from public.products where stock <= 10;

  -- Best sellers aggregated by product_id (renaming a product no longer
  -- splits its sales). Limits to top 5 server-side.
  select coalesce(jsonb_agg(t), '[]'::jsonb)
    into v_best_sellers
  from (
    select
      coalesce(oi.product_id::text, oi.product_name) as key,
      max(oi.product_name)                            as product_name,
      sum(oi.quantity)::int                           as total_qty
    from public.order_items oi
    group by 1
    order by total_qty desc
    limit 5
  ) t;

  return jsonb_build_object(
    'totalSales',      v_total_sales,
    'totalOrders',     v_total_orders,
    'pendingPayments', v_pending_payments,
    'toProcess',       v_to_process,
    'lowStockCount',   v_low_stock,
    'bestSellers',     v_best_sellers
  );
end;
$$;
