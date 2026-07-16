-- Owner-created festival plans for 2028 onward (or one-off local occasions).
create table if not exists public.ratna_custom_festival_plans (
  id uuid primary key default gen_random_uuid(),
  festival_name text not null,
  scheduled_date date not null,
  message_template text not null,
  delivery_time time not null default '05:00',
  channels text[] not null default array['in_app','whatsapp','sms'],
  active boolean not null default true,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ratna_custom_festival_plans enable row level security;
grant all on public.ratna_custom_festival_plans to service_role;

-- A cleanup runs whenever an owner refreshes the console. This is deliberately
-- data deletion (not merely a hidden UI row) after the one-month retention.
create or replace function public.ratna_prune_expired_custom_festivals()
returns integer language plpgsql security definer set search_path = public as $$
declare removed integer;
begin
  delete from public.ratna_custom_festival_plans
  where scheduled_date < current_date - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;
revoke all on function public.ratna_prune_expired_custom_festivals() from public, anon, authenticated;
grant execute on function public.ratna_prune_expired_custom_festivals() to service_role;
