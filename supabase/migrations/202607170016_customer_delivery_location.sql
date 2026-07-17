-- Exact delivery coordinates captured from the customer's approved device location.
alter table public.ratna_customer_profiles
  add column if not exists delivery_latitude numeric(10,7),
  add column if not exists delivery_longitude numeric(10,7);
