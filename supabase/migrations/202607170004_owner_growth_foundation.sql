-- Ratna owner growth dashboard: lead attribution, campaign delivery history,
-- and a durable approval queue for admin-originated changes.

create table if not exists public.ratna_web_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null check (lead_type in ('whatsapp', 'phone')),
  placement text not null,
  page_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.ratna_menu_change_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by text not null,
  change_type text not null check (change_type in ('dish', 'price', 'availability', 'offer', 'special', 'custom_dish', 'website')),
  target_name text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  owner_comment text,
  reviewed_by text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.ratna_campaign_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.ratna_campaigns(id) on delete set null,
  recipient_phone text,
  channel text not null check (channel in ('whatsapp', 'sms', 'email', 'in_app')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  body text not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.ratna_customer_profiles
  add column if not exists gender text,
  add column if not exists relationship_status text,
  add column if not exists important_people jsonb not null default '[]'::jsonb,
  add column if not exists important_dates jsonb not null default '[]'::jsonb;

alter table public.ratna_web_leads enable row level security;
alter table public.ratna_menu_change_requests enable row level security;
alter table public.ratna_campaign_deliveries enable row level security;
grant all on public.ratna_web_leads, public.ratna_menu_change_requests, public.ratna_campaign_deliveries to service_role;

-- Presentation-only lead evidence. Real WhatsApp and phone buttons will add
-- future rows via a server function, retaining the page placement.
insert into public.ratna_web_leads (id, lead_type, placement, page_path, created_at) values
  ('b0000000-0000-4000-8000-000000000001', 'whatsapp', 'floating_whatsapp', '/', now() - interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000002', 'phone', 'header_phone', '/', now() - interval '4 hours'),
  ('b0000000-0000-4000-8000-000000000003', 'whatsapp', 'floating_whatsapp', '/menu', now() - interval '1 day'),
  ('b0000000-0000-4000-8000-000000000004', 'whatsapp', 'footer_whatsapp', '/reserve', now() - interval '3 days'),
  ('b0000000-0000-4000-8000-000000000005', 'phone', 'footer_phone', '/corporate', now() - interval '5 days'),
  ('b0000000-0000-4000-8000-000000000006', 'whatsapp', 'floating_whatsapp', '/menu', now() - interval '9 days')
on conflict (id) do nothing;

insert into public.ratna_menu_change_requests (id, requested_by, change_type, target_name, summary, payload) values
  ('c0000000-0000-4000-8000-000000000001', 'admin_demo', 'offer', 'Chicken Dum Biryani', 'Weekend offer: ₹299 for delivery orders above ₹799.', '{"offer_price":299,"reason":"Weekend family traffic"}'::jsonb),
  ('c0000000-0000-4000-8000-000000000002', 'admin_demo', 'special', 'Monsoon Pepper Chicken', 'Add a limited-time monsoon special to the homepage rail.', '{"price":340,"availability":"weekends"}'::jsonb)
on conflict (id) do nothing;
