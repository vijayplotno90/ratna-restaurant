-- Cumulative owner-console defaults. Safe even if the earlier demo-detail
-- migration was skipped.
alter table public.ratna_campaigns add column if not exists icon text not null default '📣';

update public.ratna_campaigns set
  name = 'Birthday Celebration', schedule_label = 'On birthday · 05:00 AM',
  message = 'Hello {name} garu, happy birthday from the Ratna family! 🎂 Celebrate with a complimentary dessert on your meal this month.', icon = '🎂', enabled = true
where name in ('Birthday greeting', 'Birthday Celebration');

insert into public.ratna_campaigns (name, audience, trigger_type, schedule_label, message, enabled, icon)
select * from (values
  ('Anniversary Wishes', 'all', 'anniversary', 'On anniversary · 05:00 AM', 'Hello {name} garu, happy anniversary from Ratna! 💍 Wishing you many more years of togetherness. Enjoy a complimentary dessert with your family meal.', true, '💍'),
  ('Festival & New Year Greetings', 'all', 'festival', 'Festival date · 05:00 AM', 'Hello {name} garu, warm festive wishes from Ratna! ✨ May your home be filled with joy, flavour and togetherness.', true, '✨'),
  ('New Dish Launch', 'regular', 'manual', 'Friday · 06:00 PM', 'Hello {name} garu, something delicious is new at Ratna! 🔥 Discover our newest chef special this weekend.', false, '🔥')
) as seed(name, audience, trigger_type, schedule_label, message, enabled, icon)
where not exists (select 1 from public.ratna_campaigns c where c.name = seed.name);

insert into public.ratna_campaign_deliveries (id, recipient_phone, channel, status, body, created_at, sent_at) values
  ('e0000000-0000-4000-8000-000000000001', '9876543210', 'whatsapp', 'sent', 'Hello Aarav garu, Ratna lunch is ready. Enjoy a complimentary drink on orders above ₹499 today.', now() - interval '1 day', now() - interval '1 day'),
  ('e0000000-0000-4000-8000-000000000002', '9876543211', 'whatsapp', 'sent', 'Hello Meera garu, happy birthday from the Ratna family! 🎂 Celebrate with a complimentary dessert this month.', now() - interval '5 days', now() - interval '5 days'),
  ('e0000000-0000-4000-8000-000000000003', '9876543212', 'in_app', 'sent', 'Hello Nikhil garu, we miss you at Ratna. Return this week and enjoy 10% off with code WELCOMEHOME.', now() - interval '12 days', now() - interval '12 days')
on conflict (id) do nothing;

update public.ratna_menu_change_requests
set target_name = 'Chicken Dum Biryani',
  summary = 'Weekday lunch price decrease: show ₹250 struck through and ₹199 as the limited-time offer price (12 PM–4 PM).',
  payload = '{"old_price":250,"offer_price":199,"display_strike_price":true,"validity":"Weekdays · 12 PM–4 PM"}'::jsonb
where id = 'c0000000-0000-4000-8000-000000000001';

update public.ratna_menu_change_requests
set target_name = 'Monsoon Family Feast',
  summary = 'Add a weekend family combo: Chicken Dum Biryani, Chicken 65, 2 Butter Naans and Double Ka Meetha for ₹799.',
  payload = '{"price":799,"availability":"Weekends","items":["Chicken Dum Biryani","Chicken 65","2 Butter Naans","Double Ka Meetha"]}'::jsonb
where id = 'c0000000-0000-4000-8000-000000000002';
