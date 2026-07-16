-- Owner festival planning calendar. Lunar-calendar dates marked in the UI as
-- provisional should be reconfirmed locally before a campaign is scheduled.
create table if not exists public.ratna_festival_calendar (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  festival_name text not null unique,
  date_2026 date not null,
  date_2027 date not null,
  hyderabad_context text,
  lunar_date boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ratna_festival_calendar enable row level security;
grant all on public.ratna_festival_calendar to service_role;

insert into public.ratna_festival_calendar (category, festival_name, date_2026, date_2027, hyderabad_context, lunar_date) values
  ('Hindu · Harvest', 'Makar Sankranti / Pongal', '2026-01-14', '2027-01-14', 'Celebrated over multiple days with kite flying filling Hyderabad skies.', false),
  ('Hindu', 'Maha Shivaratri', '2026-02-15', '2027-03-06', null, false),
  ('Muslim', 'Eid al-Fitr (Ramzan Eid)', '2026-03-21', '2027-03-10', 'A major Old City celebration; the month leading up is known for Haleem and night markets.', true),
  ('Hindu', 'Holi', '2026-03-04', '2027-03-22', null, false),
  ('Hindu · Telugu New Year', 'Ugadi / Gudi Padwa', '2026-03-19', '2027-04-07', 'The Telugu New Year, marked by Ugadi Pachadi.', false),
  ('Christian', 'Good Friday', '2026-04-03', '2027-03-26', null, false),
  ('Christian', 'Easter Sunday', '2026-04-05', '2027-03-28', null, false),
  ('Muslim', 'Eid al-Adha (Bakrid)', '2026-05-28', '2027-05-17', null, true),
  ('Telangana', 'Telangana Formation Day', '2026-06-02', '2027-06-02', 'State holiday marking the formation of Telangana in 2014.', false),
  ('Muslim', 'Muharram (Ashura)', '2026-06-26', '2027-06-16', null, true),
  ('Muslim', 'Eid-e-Milad / Milad-un-Nabi', '2026-08-26', '2027-08-16', 'Colourful peace processions pass through Charminar and the Old City.', true),
  ('Hindu', 'Raksha Bandhan', '2026-08-28', '2027-08-17', null, false),
  ('Hindu', 'Krishna Janmashtami', '2026-09-04', '2027-08-25', null, false),
  ('Hindu', 'Ganesh Chaturthi / Vinayaka Chavithi', '2026-09-14', '2027-09-02', 'Hyderabad hosts major idols including Khairatabad Ganesha; Hussain Sagar immersion is city-wide.', false),
  ('Hindu', 'Dussehra (Vijayadashami)', '2026-10-20', '2027-10-09', null, false),
  ('Hindu', 'Diwali (Deepavali)', '2026-11-08', '2027-10-29', null, false),
  ('Sikh', 'Guru Nanak Jayanti', '2026-11-24', '2027-11-14', null, false),
  ('Christian / Secular', 'Christmas', '2026-12-25', '2027-12-25', null, false)
on conflict (festival_name) do update set
  category = excluded.category, date_2026 = excluded.date_2026, date_2027 = excluded.date_2027,
  hyderabad_context = excluded.hyderabad_context, lunar_date = excluded.lunar_date, updated_at = now();
