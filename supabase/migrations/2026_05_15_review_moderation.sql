-- =============================================================
-- Product review moderation
-- =============================================================
-- Add a status column so admins can hide spam / abusive reviews.
-- Default `approved` preserves prior behavior: existing reviews and
-- new submissions stay visible until an admin acts. Switch the default
-- to 'pending' if you want moderation-before-publish flow.

alter table public.product_reviews
  add column if not exists status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected'));

create index if not exists product_reviews_status_idx
  on public.product_reviews (product_id, status);

-- Trigger that keeps products.rating + review_count in sync whenever a
-- review is added, updated, or deleted. Only `approved` reviews count
-- toward the aggregate so hiding a 1-star review takes effect without
-- a manual recompute.
create or replace function public.recompute_product_rating(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_avg numeric;
begin
  select count(*), coalesce(avg(rating), 0)
    into v_count, v_avg
    from public.product_reviews
   where product_id = p_product_id and status = 'approved';
  update public.products
     set rating = round(v_avg::numeric, 1),
         review_count = v_count
   where id = p_product_id;
end;
$$;

create or replace function public.product_reviews_after_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_product_rating(old.product_id);
    return old;
  else
    perform public.recompute_product_rating(new.product_id);
    return new;
  end if;
end;
$$;

drop trigger if exists product_reviews_after_change_trg on public.product_reviews;
create trigger product_reviews_after_change_trg
  after insert or update or delete on public.product_reviews
  for each row execute function public.product_reviews_after_change();
