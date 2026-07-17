-- Customer phone sign-in and profile onboarding for Ratna.
-- Apply after 202607170014_today_operations_and_tax.sql.

alter table public.ratna_customer_profiles
  add column if not exists full_name text,
  add column if not exists default_address text;

create table if not exists public.ratna_customer_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  purpose text not null check (purpose in ('sign_in', 'create_account')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists ratna_customer_otps_phone_idx on public.ratna_customer_otps(phone, created_at desc);
alter table public.ratna_customer_otps enable row level security;
grant all on public.ratna_customer_otps to service_role;

-- A full customer account for demos. The application sends its development OTP
-- through its server function; replace that delivery step with an SMS provider for live use.
insert into public.ratna_customer_profiles
  (phone, full_name, email, birthday, anniversary, preferences, notes, marketing_consent, gender, relationship_status, important_people, important_dates, default_address)
values
  ('9999999999', 'Ram Kumar', 'ram@example.com', '1991-07-28', '2018-12-12', array['Chicken biryani','Family dinner'], 'Prefers medium spice.', true, 'male', 'married', '[{"name":"Ananya","relation":"Spouse","date":"12-12"}]'::jsonb, '[{"label":"Wedding anniversary","date":"12-12"}]'::jsonb, 'Plot 90, Kushaiguda, Hyderabad')
on conflict (phone) do update set
  full_name = excluded.full_name, email = excluded.email, birthday = excluded.birthday,
  anniversary = excluded.anniversary, preferences = excluded.preferences, notes = excluded.notes,
  marketing_consent = excluded.marketing_consent, gender = excluded.gender,
  relationship_status = excluded.relationship_status, important_people = excluded.important_people,
  important_dates = excluded.important_dates, default_address = excluded.default_address,
  updated_at = now();

-- Ten realistic past Ratna orders for Ram. Re-running this migration does not duplicate them.
insert into public.ratna_orders (id, customer_name, customer_phone, fulfilment, delivery_address, payment_method, status, subtotal, delivery_fee, gst_amount, total, notes, created_at) values
('b1000000-0000-4000-8000-000000000001','Ram Kumar','9999999999','delivery','Plot 90, Kushaiguda, Hyderabad','upi','delivered',440,0,22,462,'','2026-07-16 20:10:00+05:30'),
('b1000000-0000-4000-8000-000000000002','Ram Kumar','9999999999','pickup',null,'upi','delivered',480,0,24,504,'','2026-07-10 19:25:00+05:30'),
('b1000000-0000-4000-8000-000000000003','Ram Kumar','9999999999','delivery','Plot 90, Kushaiguda, Hyderabad','card','delivered',350,30,19,399,'','2026-07-04 13:05:00+05:30'),
('b1000000-0000-4000-8000-000000000004','Ram Kumar','9999999999','delivery','Plot 90, Kushaiguda, Hyderabad','upi','delivered',610,0,31,641,'','2026-06-27 20:40:00+05:30'),
('b1000000-0000-4000-8000-000000000005','Ram Kumar','9999999999','pickup',null,'cod','delivered',270,0,14,284,'','2026-06-18 21:15:00+05:30'),
('b1000000-0000-4000-8000-000000000006','Ram Kumar','9999999999','delivery','Plot 90, Kushaiguda, Hyderabad','upi','delivered',440,0,22,462,'','2026-06-09 19:50:00+05:30'),
('b1000000-0000-4000-8000-000000000007','Ram Kumar','9999999999','pickup',null,'card','delivered',520,0,26,546,'','2026-05-29 20:05:00+05:30'),
('b1000000-0000-4000-8000-000000000008','Ram Kumar','9999999999','delivery','Plot 90, Kushaiguda, Hyderabad','upi','delivered',390,30,21,441,'','2026-05-16 13:20:00+05:30'),
('b1000000-0000-4000-8000-000000000009','Ram Kumar','9999999999','delivery','Plot 90, Kushaiguda, Hyderabad','upi','delivered',700,0,35,735,'','2026-05-02 20:30:00+05:30'),
('b1000000-0000-4000-8000-000000000010','Ram Kumar','9999999999','pickup',null,'card','delivered',260,0,13,273,'','2026-04-19 19:10:00+05:30')
on conflict (id) do nothing;

insert into public.ratna_order_items (order_id, menu_item_id, item_name, quantity, unit_price) values
('b1000000-0000-4000-8000-000000000001','chicken-dum','Chicken Dum Biryani',2,220),
('b1000000-0000-4000-8000-000000000002','chicken-fry','Chicken Fry Piece Biryani',2,240),
('b1000000-0000-4000-8000-000000000003','veg-manchurian','Veg Manchurian',1,160),('b1000000-0000-4000-8000-000000000003','paneer-tikka','Paneer Tikka',1,190),
('b1000000-0000-4000-8000-000000000004','mutton-biryani','Mutton Dum Biryani',2,305),
('b1000000-0000-4000-8000-000000000005','chicken-65','Chicken 65',1,220),('b1000000-0000-4000-8000-000000000005','lassi','Mango Lassi',1,50),
('b1000000-0000-4000-8000-000000000006','chicken-dum','Chicken Dum Biryani',2,220),
('b1000000-0000-4000-8000-000000000007','family-pack','Chicken Family Pack',1,520),
('b1000000-0000-4000-8000-000000000008','paneer-majestic','Paneer Majestic',1,190),('b1000000-0000-4000-8000-000000000008','veg-biryani','Veg Dum Biryani',1,200),
('b1000000-0000-4000-8000-000000000009','family-pack','Chicken Family Pack',1,700),
('b1000000-0000-4000-8000-000000000010','chicken-biryani','Chicken Biryani',1,260)
on conflict do nothing;
