-- Ratna owner/admin console. Run AFTER 202607160001_ratna_operations.sql.
create extension if not exists pgcrypto;

create table if not exists public.ratna_team_users (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null check (user_id ~ '^[a-z0-9_]{3,40}$'),
  name text not null,
  role text not null check (role in ('owner', 'admin', 'staff')),
  active boolean not null default true,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ratna_customer_profiles (
  phone text primary key,
  email text,
  birthday date,
  anniversary date,
  preferences text[] not null default '{}',
  notes text,
  marketing_consent boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.ratna_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience text not null check (audience in ('all', 'new', 'regular', 'at_risk', 'vip')),
  trigger_type text not null check (trigger_type in ('scheduled', 'birthday', 'anniversary', 'festival', 'manual')),
  schedule_label text not null,
  message text not null,
  enabled boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ratna_console_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ratna_team_users enable row level security;
alter table public.ratna_customer_profiles enable row level security;
alter table public.ratna_campaigns enable row level security;
alter table public.ratna_console_audit enable row level security;

grant all on public.ratna_team_users, public.ratna_customer_profiles, public.ratna_campaigns, public.ratna_console_audit to service_role;

create or replace function public.ratna_authenticate_team(p_user_id text, p_password text)
returns table (id uuid, user_id text, name text, role text)
language sql security definer set search_path = public, extensions as $$
  select u.id, u.user_id, u.name, u.role from public.ratna_team_users u
  where u.user_id = p_user_id and u.active and u.password_hash = crypt(p_password, u.password_hash) limit 1;
$$;
revoke all on function public.ratna_authenticate_team(text, text) from public, anon, authenticated;
grant execute on function public.ratna_authenticate_team(text, text) to service_role;

-- Demo-only staff. Change their passwords or remove them before live staff use.
insert into public.ratna_team_users (user_id, name, role, password_hash) values
  ('owner_demo', 'Demo Owner', 'owner', crypt('OwnerDemo@2026!', gen_salt('bf', 12))),
  ('admin_demo', 'Demo Administrator', 'admin', crypt('AdminDemo@2026!', gen_salt('bf', 12)))
on conflict (user_id) do nothing;

insert into public.ratna_customer_profiles (phone, email, birthday, anniversary, preferences, notes, marketing_consent) values
  ('9876543210', 'aarav.demo@example.com', '1992-08-18', '2019-12-06', array['Chicken biryani','UPI','Delivery'], 'Prefers mild spice.', true),
  ('9876543211', 'meera.demo@example.com', '1995-03-24', null, array['Vegetarian','Paneer','Pickup'], 'Likes early-evening pickup reminders.', true),
  ('9876543212', 'nikhil.demo@example.com', '1988-11-10', null, array['Mutton','Chicken starters'], 'Weekend family-pack campaign candidate.', true),
  ('9876543213', null, null, null, array['Vegetarian','COD','Family meals'], 'No marketing consent — service messages only.', false)
on conflict (phone) do nothing;

insert into public.ratna_campaigns (name, audience, trigger_type, schedule_label, message) values
  ('Weekday lunch reminder', 'regular', 'scheduled', 'Mon–Fri · 12:15 PM', 'Hi {name}, Ratna lunch is ready. Enjoy a complimentary drink on orders above ₹499 today.'),
  ('30-day return offer', 'at_risk', 'scheduled', 'Every Tuesday · 6:30 PM', 'Hi {name}, we miss you at Ratna. Come back this week and enjoy 10% off with code WELCOMEHOME.'),
  ('Birthday greeting', 'all', 'birthday', 'On birthday · 10:00 AM', 'Happy birthday, {name}! Celebrate with a complimentary dessert at Ratna this month.')
on conflict do nothing;
