-- Correct the original demonstration offer to a simple all-day dish offer.
-- This applies to projects which have already run migration 009.
update public.ratna_menu_change_requests
set target_name = 'Chicken Dum Biryani',
  summary = '10% off Chicken Dum Biryani.',
  payload = '{"old_price":250,"offer_price":225,"display_strike_price":true,"validity":"10% off"}'::jsonb
where id = 'c0000000-0000-4000-8000-000000000001';
