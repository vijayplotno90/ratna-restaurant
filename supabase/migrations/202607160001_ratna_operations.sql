-- Ratna Deluxe operational foundation. Apply this only to Ratna's own Supabase project.
create extension if not exists pgcrypto;

create type public.ratna_role as enum ('customer', 'staff', 'admin', 'owner');
create type public.ratna_order_status as enum ('new', 'preparing', 'ready', 'out', 'delivered', 'cancelled');
create type public.ratna_reservation_status as enum ('pending', 'confirmed', 'seated', 'no_show', 'cancelled');

create table public.ratna_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  role public.ratna_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ratna_orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_id uuid references public.ratna_profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  fulfilment text not null check (fulfilment in ('pickup', 'delivery')),
  delivery_address text,
  payment_method text not null check (payment_method in ('upi', 'card', 'cod')),
  status public.ratna_order_status not null default 'new',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  gst_amount numeric(12,2) not null default 0 check (gst_amount >= 0),
  total numeric(12,2) not null check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ratna_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ratna_orders(id) on delete cascade,
  menu_item_id text not null,
  item_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table public.ratna_reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.ratna_profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  reservation_at timestamptz not null,
  guests integer not null check (guests > 0),
  hall text not null,
  seating text,
  notes text,
  status public.ratna_reservation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ratna_customer_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.ratna_profiles(id) on delete cascade,
  audience text not null default 'individual',
  channel text not null check (channel in ('whatsapp', 'sms', 'email', 'in_app')),
  body text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ratna_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.ratna_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ratna_orders_customer_phone_idx on public.ratna_orders(customer_phone);
create index ratna_orders_created_at_idx on public.ratna_orders(created_at desc);
create index ratna_reservations_at_idx on public.ratna_reservations(reservation_at);

create or replace function public.ratna_is_team_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ratna_profiles where id = auth.uid() and role in ('staff', 'admin', 'owner'));
$$;

alter table public.ratna_profiles enable row level security;
alter table public.ratna_orders enable row level security;
alter table public.ratna_order_items enable row level security;
alter table public.ratna_reservations enable row level security;
alter table public.ratna_customer_messages enable row level security;
alter table public.ratna_audit_log enable row level security;

create policy "ratna profiles own record" on public.ratna_profiles for select using (id = auth.uid() or public.ratna_is_team_member());
create policy "ratna profiles own update" on public.ratna_profiles for update using (id = auth.uid() or public.ratna_is_team_member());
create policy "ratna orders customers or team" on public.ratna_orders for select using (customer_id = auth.uid() or public.ratna_is_team_member());
create policy "ratna order items customers or team" on public.ratna_order_items for select using (exists (select 1 from public.ratna_orders o where o.id = order_id and (o.customer_id = auth.uid() or public.ratna_is_team_member())));
create policy "ratna reservations customers or team" on public.ratna_reservations for select using (customer_id = auth.uid() or public.ratna_is_team_member());
create policy "ratna messages customer or team" on public.ratna_customer_messages for select using (customer_id = auth.uid() or public.ratna_is_team_member());
create policy "ratna audit owner only" on public.ratna_audit_log for select using (exists (select 1 from public.ratna_profiles where id = auth.uid() and role = 'owner'));

-- Checkout, staff status updates, finance exports, and customer onboarding should use
-- server-side functions with the service role; do not expose those write privileges to browsers.
