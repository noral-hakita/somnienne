-- ================================================================
-- SOMNIENNE · PRODUCTION SCHEMA v1 · run ONCE in the SQL editor
-- No secrets in this file → also save it as supabase/schema.sql in the repo
-- ================================================================

-- ---------- ENUMS ----------
create type public.user_role as enum ('owner','operations','support','customer');
create type public.order_status as enum ('pending_confirmation','confirmed','packed','shipped','delivered','cancelled','returned');
create type public.payment_method as enum ('cod','payfast');
create type public.media_type as enum ('image','video');
create type public.coupon_type as enum ('percent','fixed');
create type public.shipment_status as enum ('pending','in_transit','delivered','failed');

-- ---------- TABLES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  tags text[] not null default '{}',
  retail_price numeric(10,2) not null check (retail_price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  care_instructions text,
  return_policy text,
  delivery_estimate text,
  video_url text,
  size_chart_url text,
  has_sizes boolean not null default false,
  custom_lead_time_days int not null default 7,
  is_featured boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  type public.media_type not null default 'image',
  position int not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  attributes jsonb not null default '{}', -- {size,color,material,sleeve_length,pant_length,fit_type}
  stock int not null default 0 check (stock >= 0),
  is_custom boolean not null default false,
  image_url text
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('shipping_fee', '250'),
  ('free_shipping_threshold', '15000'),
  ('low_stock_threshold', '5'),
  ('order_confirmation_hours', '12')
on conflict (key) do nothing;

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.coupon_type not null,
  value numeric(10,2) not null check (value > 0),
  min_order numeric(10,2) not null default 0,
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.wishlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending_confirmation',
  payment_method public.payment_method not null default 'cod',
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  currency text not null default 'PKR',
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  coupon_id uuid references public.coupons(id),
  confirmation_token uuid not null default gen_random_uuid(),
  confirmation_sent_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null,
  variant_id uuid,
  name_snapshot text not null,
  price_snapshot numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  attributes_snapshot jsonb not null default '{}',
  custom_notes text
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  from_status public.order_status,
  to_status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  courier text not null,
  tracking_number text,
  status public.shipment_status not null default 'pending',
  shipped_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta int not null,
  reason text not null,
  actor_id uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_verified boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- ---------- INDEXES ----------
create index idx_products_category on public.products (category_id);
create index idx_products_active on public.products (is_active) where is_active;
create index idx_variants_product on public.product_variants (product_id);
create index idx_media_product on public.product_media (product_id);
create index idx_orders_user on public.orders (user_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_pending on public.orders (confirmation_sent_at) where status = 'pending_confirmation';
create index idx_order_items_order on public.order_items (order_id);
create index idx_reviews_product on public.reviews (product_id) where is_approved;
create index idx_movements_variant on public.inventory_movements (variant_id);

-- ---------- TRIGGERS ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- Every signup becomes a customer profile automatically
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- ROLE HELPERS ----------
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('owner','operations','support'));
$$;

create or replace function public.is_ops() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('owner','operations'));
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and is_active and role = 'owner');
$$;

-- ---------- RLS: ENABLE EVERYWHERE ----------
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_variants enable row level security;
alter table public.settings enable row level security;
alter table public.coupons enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.shipments enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.reviews enable row level security;

-- ---------- RLS: POLICIES ----------
-- profiles: see yourself; staff see everyone; update only your own row
create policy profiles_read on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update using (id = auth.uid());

-- customers may ONLY change name/phone — never role/is_active (column grants)
revoke update on table public.profiles from anon, authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

create policy addresses_own on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- catalog: public reads active rows; staff full control
create policy categories_read on public.categories for select using (is_active or public.is_staff());
create policy categories_write on public.categories for insert to authenticated with check (public.is_staff());
create policy categories_update on public.categories for update to authenticated using (public.is_staff());
create policy categories_delete on public.categories for delete to authenticated using (public.is_staff());

create policy products_read on public.products for select using (is_active or public.is_staff());
create policy products_write on public.products for insert to authenticated with check (public.is_staff());
create policy products_update on public.products for update to authenticated using (public.is_staff());
create policy products_delete on public.products for delete to authenticated using (public.is_staff());

create policy media_read on public.product_media for select using (true);
create policy media_write on public.product_media for insert to authenticated with check (public.is_staff());
create policy media_update on public.product_media for update to authenticated using (public.is_staff());
create policy media_delete on public.product_media for delete to authenticated using (public.is_staff());

create policy variants_read on public.product_variants for select using (true);
create policy variants_write on public.product_variants for insert to authenticated with check (public.is_staff());
create policy variants_update on public.product_variants for update to authenticated using (public.is_staff());
create policy variants_delete on public.product_variants for delete to authenticated using (public.is_staff());

-- settings & coupons: staff only (storefront uses RPCs below)
create policy settings_staff on public.settings for select using (public.is_staff());
create policy settings_staff_upd on public.settings for update using (public.is_staff());
create policy coupons_staff on public.coupons for select using (public.is_staff());
create policy coupons_staff_w on public.coupons for insert to authenticated with check (public.is_staff());
create policy coupons_staff_u on public.coupons for update to authenticated using (public.is_staff());
create policy coupons_staff_d on public.coupons for delete to authenticated using (public.is_staff());

create policy wishlists_own on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: NO public insert (only place_order RPC). Customer reads own; ops updates.
revoke insert, delete on table public.orders from anon, authenticated;
create policy orders_read on public.orders for select using (user_id = auth.uid() or public.is_staff());
create policy orders_update on public.orders for update using (public.is_ops());

create policy items_read on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
revoke insert, update, delete on table public.order_items from anon, authenticated;

create policy events_read on public.order_events for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy events_write on public.order_events for insert to authenticated with check (public.is_staff());

create policy shipments_read on public.shipments for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy shipments_write on public.shipments for insert to authenticated with check (public.is_ops());
create policy shipments_update on public.shipments for update using (public.is_ops());

create policy movements_staff on public.inventory_movements for select using (public.is_staff());
create policy movements_staff_w on public.inventory_movements for insert to authenticated with check (public.is_staff());

-- reviews: public sees approved; verified-buyers-only inserts; staff approve
revoke insert, update on table public.reviews from anon, authenticated;
grant insert (product_id, rating, title, body) on table public.reviews to authenticated;
grant update (is_approved) on table public.reviews to authenticated;
create policy reviews_read on public.reviews for select using (is_approved or user_id = auth.uid() or public.is_staff());
create policy reviews_write on public.reviews for insert to authenticated with check (
  user_id = auth.uid() and exists (
    select 1 from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where oi.product_id = product_id and o.user_id = auth.uid() and o.status = 'delivered'));
create policy reviews_approve on public.reviews for update using (public.is_staff());

-- ---------- RPC: checkout info & coupon validation (public, safe) ----------
create or replace function public.get_checkout_info() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'shipping_fee', coalesce((select value::numeric from public.settings where key = 'shipping_fee'), 0),
    'free_shipping_threshold', coalesce((select value::numeric from public.settings where key = 'free_shipping_threshold'), 0));
$$;

create or replace function public.validate_coupon(code text, subtotal numeric) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.coupons%rowtype; disc numeric;
begin
  select * into c from public.coupons
   where code = upper(btrim(code)) and is_active
     and (starts_at is null or starts_at <= now())
     and (expires_at is null or expires_at >= now())
     and (max_uses is null or used_count < max_uses);
  if not found then return jsonb_build_object('valid', false, 'message', 'Invalid or expired code'); end if;
  if subtotal < c.min_order then
    return jsonb_build_object('valid', false, 'message', 'Minimum order Rs. ' || c.min_order);
  end if;
  disc := case c.type when 'percent' then round(subtotal * c.value / 100, 2)
                      else least(c.value, subtotal) end;
  return jsonb_build_object('valid', true, 'discount', disc, 'code', c.code);
end $$;

-- ---------- RPC: PLACE ORDER (the only door into orders) ----------
create or replace function public.place_order(
  items jsonb,
  full_name text,
  phone text,
  address text,
  city text,
  payment_method public.payment_method default 'cod',
  coupon_code text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  item jsonb; vid uuid; qty int; rc int;
  v_rec public.product_variants%rowtype;
  p_rec public.products%rowtype;
  c_rec public.coupons%rowtype;
  unit numeric; subtotal numeric := 0; discount numeric := 0;
  ship numeric; threshold numeric; order_id uuid; user_email text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select email into user_email from auth.users where id = uid;

  -- Pass 1: server-side pricing + advisory stock check
  for item in select * from jsonb_array_elements(items) loop
    vid := (item ->> 'variant_id')::uuid;
    qty := greatest(coalesce((item ->> 'quantity')::int, 1), 1);
    select * into v_rec from public.product_variants where id = vid;
    if not found then raise exception 'Unknown variant'; end if;
    select * into p_rec from public.products where id = v_rec.product_id;
    if not p_rec.is_active then raise exception 'Product unavailable'; end if;
    if v_rec.stock < qty then raise exception 'Insufficient stock for %', v_rec.sku; end if;
    subtotal := subtotal + coalesce(p_rec.sale_price, p_rec.retail_price) * qty;
  end loop;

  -- Coupon (validated server-side)
  if coupon_code is not null then
    select * into c_rec from public.coupons
     where code = upper(btrim(coupon_code)) and is_active
       and (starts_at is null or starts_at <= now())
       and (expires_at is null or expires_at >= now())
       and (max_uses is null or used_count < max_uses);
    if found and subtotal >= c_rec.min_order then
      discount := case c_rec.type when 'percent' then round(subtotal * c_rec.value / 100, 2)
                                  else least(c_rec.value, subtotal) end;
      update public.coupons set used_count = used_count + 1 where id = c_rec.id;
    end if;
  end if;

  -- Shipping from settings
  ship := coalesce((select value::numeric from public.settings where key = 'shipping_fee'), 0);
  threshold := coalesce((select value::numeric from public.settings where key = 'free_shipping_threshold'), 0);
  if (subtotal - discount) >= threshold then ship := 0; end if;

  insert into public.orders (user_id, payment_method, subtotal, shipping_fee, discount, total,
    full_name, email, phone, address, city, coupon_id, confirmation_sent_at)
  values (uid, payment_method, subtotal, ship, discount, subtotal - discount + ship,
    full_name, user_email, phone, address, city, c_rec.id, now())
  returning id into order_id;

  -- Pass 2: snapshots + ATOMIC stock decrement (concurrency-safe)
  for item in select * from jsonb_array_elements(items) loop
    vid := (item ->> 'variant_id')::uuid;
    qty := greatest(coalesce((item ->> 'quantity')::int, 1), 1);
    select * into v_rec from public.product_variants where id = vid;
    select * into p_rec from public.products where id = v_rec.product_id;
    unit := coalesce(p_rec.sale_price, p_rec.retail_price);

    insert into public.order_items (order_id, product_id, variant_id, name_snapshot,
      price_snapshot, quantity, attributes_snapshot, custom_notes)
    values (order_id, p_rec.id, vid, p_rec.name, unit, qty, v_rec.attributes, item ->> 'custom_notes');

    update public.product_variants set stock = stock - qty
     where id = vid and stock >= qty;
    get diagnostics rc = row_count;
    if rc = 0 then raise exception 'Insufficient stock for %', v_rec.sku; end if;

    insert into public.inventory_movements (variant_id, delta, reason, actor_id, note)
    values (vid, -qty, 'sale', uid, 'Order ' || order_id);
  end loop;

  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (order_id, uid, null, 'pending_confirmation', 'Order placed by customer');

  return order_id;
end $$;

-- ---------- RPC: customer confirm / cancel via signed link ----------
create or replace function public.confirm_order(token uuid, action text) returns text
language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  select * into o from public.orders where confirmation_token = token;
  if not found then return 'invalid'; end if;
  if o.status <> 'pending_confirmation' then return 'already_processed'; end if;

  if action = 'confirm' then
    update public.orders set status = 'confirmed', confirmed_at = now() where id = o.id;
    insert into public.order_events (order_id, from_status, to_status, note)
    values (o.id, 'pending_confirmation', 'confirmed', 'Customer confirmed');
    return 'confirmed';
  elsif action = 'cancel' then
    update public.orders set status = 'cancelled', cancelled_at = now(),
      cancel_reason = 'Cancelled by customer' where id = o.id;
    update public.product_variants v set stock = v.stock + oi.quantity
      from public.order_items oi where oi.order_id = o.id and oi.variant_id = v.id;
    insert into public.inventory_movements (variant_id, delta, reason, note)
      select oi.variant_id, oi.quantity, 'release', 'Customer cancel ' || o.id
        from public.order_items oi where oi.order_id = o.id;
    insert into public.order_events (order_id, from_status, to_status, note)
    values (o.id, 'pending_confirmation', 'cancelled', 'Customer cancelled');
    return 'cancelled';
  end if;
  return 'invalid';
end $$;

-- ---------- RPC: 12-hour sweep (called by cron in Phase 3) ----------
create or replace function public.sweep_stale_orders() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; h int;
begin
  h := coalesce((select value::int from public.settings where key = 'order_confirmation_hours'), 12);
  for r in select id from public.orders
    where status = 'pending_confirmation'
      and confirmation_sent_at < now() - make_interval(hours => h)
  loop
    update public.orders set status = 'cancelled', cancelled_at = now(),
      cancel_reason = 'Confirmation window expired' where id = r.id;
    update public.product_variants v set stock = v.stock + oi.quantity
      from public.order_items oi where oi.order_id = r.id and oi.variant_id = v.id;
    insert into public.inventory_movements (variant_id, delta, reason, note)
      select oi.variant_id, oi.quantity, 'release', 'Auto-cancel ' || r.id
        from public.order_items oi where oi.order_id = r.id;
    insert into public.order_events (order_id, from_status, to_status, note)
    values (r.id, 'pending_confirmation', 'cancelled', 'Auto-cancelled after ' || h || 'h');
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------- RPC: owner-only staff management ----------
create or replace function public.admin_update_staff(target uuid, new_role public.user_role default null, active boolean default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'Owner only'; end if;
  if new_role is not null and new_role not in ('owner','operations','support') then
    raise exception 'Staff roles only';
  end if;
  update public.profiles set
    role = coalesce(new_role, role),
    is_active = coalesce(active, is_active)
  where id = target;
end $$;

-- ================================================================
-- SOMNIENNE · SCHEMA ADDENDUM v1.1 · staff order actions
-- ================================================================

create or replace function public.admin_confirm_order(order_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_ops() then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id = order_id;
  if not found or o.status <> 'pending_confirmation' then raise exception 'Invalid order state'; end if;

  update public.orders set status = 'confirmed', confirmed_at = now() where id = order_id;
  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (order_id, auth.uid(), 'pending_confirmation', 'confirmed', 'Manually confirmed by staff');
end $$;

create or replace function public.admin_cancel_order(order_id uuid, reason text default 'Cancelled by staff')
returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_ops() then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id = order_id;
  if not found or o.status not in ('pending_confirmation', 'confirmed') then raise exception 'Invalid order state'; end if;

  update public.orders set status = 'cancelled', cancelled_at = now(), cancel_reason = reason where id = order_id;

  -- release the reserved stock, atomically
  update public.product_variants v set stock = v.stock + oi.quantity
    from public.order_items oi where oi.order_id = order_id and oi.variant_id = v.id;
  insert into public.inventory_movements (variant_id, delta, reason, actor_id, note)
    select oi.variant_id, oi.quantity, 'release', auth.uid(), 'Staff cancel ' || order_id
      from public.order_items oi where oi.order_id = order_id and oi.variant_id is not null;

  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (order_id, auth.uid(), o.status, 'cancelled', reason);
end $$;

-- ================================================================
-- SOMNIENNE · SCHEMA ADDENDUM v1.2 (corrected) · coupon hardening
-- ================================================================
drop function if exists public.validate_coupon(text, numeric);

create function public.validate_coupon(p_code text, p_subtotal numeric) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.coupons%rowtype; disc numeric;
begin
  select * into c from public.coupons
   where code = upper(btrim(p_code)) and is_active
     and (starts_at is null or starts_at <= now())
     and (expires_at is null or expires_at >= now())
     and (max_uses is null or used_count < max_uses);
  if not found then return jsonb_build_object('valid', false, 'message', 'Invalid or expired code'); end if;
  if p_subtotal < c.min_order then
    return jsonb_build_object('valid', false, 'message', 'Minimum order Rs. ' || c.min_order);
  end if;
  disc := case c.type when 'percent' then round(p_subtotal * c.value / 100, 2)
                      else least(c.value, p_subtotal) end;
  return jsonb_build_object('valid', true, 'discount', disc, 'code', c.code);
end $$;

grant execute on function public.validate_coupon(text, numeric) to anon, authenticated, service_role;

-- ================================================================
-- SOMNIENNE · SCHEMA ADDENDUM v1.3 · order lifecycle + stock adjustments
-- ================================================================
create or replace function public.admin_advance_order(
  order_id uuid,
  new_status public.order_status,
  courier text default null,
  tracking text default null
)
returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_ops() then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id = order_id;
  if not found then raise exception 'Order not found'; end if;

  -- the ladder is law: no skipping steps
  if not (
    (o.status = 'confirmed' and new_status = 'packed') or
    (o.status = 'packed'    and new_status = 'shipped') or
    (o.status = 'shipped'   and new_status = 'delivered') or
    (o.status = 'delivered' and new_status = 'returned')
  ) then raise exception 'Invalid transition % -> %', o.status, new_status; end if;

  if new_status = 'shipped' then
    if courier is null or btrim(tracking) = '' then raise exception 'Courier and tracking required'; end if;
    insert into public.shipments (order_id, courier, tracking_number, status, shipped_at)
    values (order_id, courier, tracking, 'in_transit', now());
  end if;

  if new_status = 'delivered' then
    update public.shipments set status = 'delivered' where order_id = order_id and status = 'in_transit';
  end if;

  update public.orders set status = new_status where id = order_id;
  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (order_id, auth.uid(), o.status, new_status, 'Status advanced by staff');
end $$;

create or replace function public.admin_adjust_stock(variant_id uuid, delta int, reason text default 'adjustment', note text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not authorized'; end if;
  update public.product_variants set stock = greatest(stock + delta, 0) where id = variant_id;
  insert into public.inventory_movements (variant_id, delta, reason, actor_id, note)
  values (variant_id, delta, reason, auth.uid(), note);
end $$;

-- ================================================================
-- SOMNIENNE · SCHEMA ADDENDUM v1.4 · parameter collision fixes
-- RULE: all PL/pgSQL parameters use p_ prefix. No exceptions.
-- ================================================================
drop function if exists public.admin_advance_order(uuid, public.order_status, text, text);
drop function if exists public.admin_cancel_order(uuid, text);
drop function if exists public.admin_confirm_order(uuid);

create function public.admin_confirm_order(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_ops() then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id = p_order_id;
  if not found or o.status <> 'pending_confirmation' then raise exception 'Invalid order state'; end if;
  update public.orders set status = 'confirmed', confirmed_at = now() where id = p_order_id;
  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (p_order_id, auth.uid(), 'pending_confirmation', 'confirmed', 'Manually confirmed by staff');
end $$;

create function public.admin_cancel_order(p_order_id uuid, p_reason text default 'Cancelled by staff')
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_ops() then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id = p_order_id;
  if not found or o.status not in ('pending_confirmation', 'confirmed') then raise exception 'Invalid order state'; end if;
  update public.orders set status = 'cancelled', cancelled_at = now(), cancel_reason = p_reason where id = p_order_id;
  update public.product_variants v set stock = v.stock + oi.quantity
    from public.order_items oi where oi.order_id = p_order_id and oi.variant_id = v.id;
  insert into public.inventory_movements (variant_id, delta, reason, actor_id, note)
    select oi.variant_id, oi.quantity, 'release', auth.uid(), 'Staff cancel ' || p_order_id
      from public.order_items oi where oi.order_id = p_order_id and oi.variant_id is not null;
  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (p_order_id, auth.uid(), o.status, 'cancelled', p_reason);
end $$;

create function public.admin_advance_order(
  p_order_id uuid,
  p_new_status public.order_status,
  p_courier text default null,
  p_tracking text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_ops() then raise exception 'Not authorized'; end if;
  select * into o from public.orders where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;

  if not (
    (o.status = 'confirmed' and p_new_status = 'packed') or
    (o.status = 'packed'    and p_new_status = 'shipped') or
    (o.status = 'shipped'   and p_new_status = 'delivered') or
    (o.status = 'delivered' and p_new_status = 'returned')
  ) then raise exception 'Invalid transition % -> %', o.status, p_new_status; end if;

  if p_new_status = 'shipped' then
    if p_courier is null or btrim(coalesce(p_tracking, '')) = '' then raise exception 'Courier and tracking required'; end if;
    insert into public.shipments (order_id, courier, tracking_number, status, shipped_at)
    values (p_order_id, p_courier, p_tracking, 'in_transit', now());
  end if;

  if p_new_status = 'delivered' then
    update public.shipments set status = 'delivered' where order_id = p_order_id and status = 'in_transit';
  end if;

  update public.orders set status = p_new_status where id = p_order_id;
  insert into public.order_events (order_id, actor_id, from_status, to_status, note)
  values (p_order_id, auth.uid(), o.status, p_new_status, 'Status advanced by staff');
end $$;

-- ================================================================
-- SOMNIENNE · SCHEMA ADDENDUM v1.5 · product media storage
-- Rule: bucket is public-read (storefront), staff-only write.
-- ================================================================
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

create policy "media public read"
on storage.objects for select
using (bucket_id = 'product-media');

create policy "media staff insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-media' and public.is_staff());

create policy "media staff update"
on storage.objects for update to authenticated
using (bucket_id = 'product-media' and public.is_staff());

create policy "media staff delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-media' and public.is_staff());

-- ================================================================
-- SOMNIENNE · SCHEMA ADDENDUM v1.6 · color-tagged photography
-- ================================================================
alter table public.product_media add column if not exists color text;