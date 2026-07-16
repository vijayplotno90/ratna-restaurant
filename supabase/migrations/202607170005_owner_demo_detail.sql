-- Rich, clearly-labelled demo data for the Ratna owner review.
-- It gives charts, family CRM, campaigns and delivery tracking meaningful examples.

update public.ratna_orders set created_at = date_trunc('day', now()) - interval '1 day' + interval '20 hours' where id = 'a0000000-0000-4000-8000-000000000001';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '2 days' + interval '14 hours' where id = 'a0000000-0000-4000-8000-000000000002';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '5 days' + interval '19 hours' where id = 'a0000000-0000-4000-8000-000000000003';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '9 days' + interval '13 hours' where id = 'a0000000-0000-4000-8000-000000000004';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '18 days' + interval '20 hours' where id = 'a0000000-0000-4000-8000-000000000005';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '34 days' + interval '20 hours' where id = 'a0000000-0000-4000-8000-000000000006';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '47 days' + interval '13 hours' where id = 'a0000000-0000-4000-8000-000000000007';
update public.ratna_orders set created_at = date_trunc('day', now()) - interval '64 days' + interval '19 hours' where id = 'a0000000-0000-4000-8000-000000000008';

update public.ratna_customer_profiles set
  gender = 'Male', relationship_status = 'Married',
  important_people = '[{"name":"Ananya Reddy","relationship":"Spouse","birthday":"1994-04-17"},{"name":"Vihaan Reddy","relationship":"Son","birthday":"2020-11-09"}]'::jsonb,
  important_dates = '[{"label":"Wedding anniversary","date":"2019-12-06"}]'::jsonb
where phone = '9876543210';
update public.ratna_customer_profiles set
  gender = 'Female', relationship_status = 'Married',
  important_people = '[{"name":"Karthik Shah","relationship":"Spouse","birthday":"1993-06-22"}]'::jsonb,
  important_dates = '[{"label":"Wedding anniversary","date":"2022-11-18"}]'::jsonb
where phone = '9876543211';
update public.ratna_customer_profiles set
  gender = 'Male', relationship_status = 'Married',
  important_people = '[{"name":"Nandini Varma","relationship":"Spouse","birthday":"1990-02-15"}]'::jsonb,
  important_dates = '[{"label":"Wedding anniversary","date":"2016-08-14"}]'::jsonb
where phone = '9876543212';
update public.ratna_customer_profiles set
  gender = 'Female', relationship_status = 'Married',
  important_people = '[{"name":"Ayaan Khan","relationship":"Son","birthday":"2018-07-26"}]'::jsonb,
  important_dates = '[{"label":"Family dinner preference","date":"2026-08-02"}]'::jsonb
where phone = '9876543213';

insert into public.ratna_customer_profiles (phone, email, birthday, anniversary, preferences, notes, marketing_consent, gender, relationship_status, important_people, important_dates) values
  ('9876543214', 'saanvi.demo@example.com', '1997-01-31', null, array['Vegetarian','North Indian','Pickup'], 'Likes birthday dessert offers.', true, 'Female', 'Single', '[{"name":"Rohini Rao","relationship":"Mother","birthday":"1968-05-11"}]'::jsonb, '[{"label":"Birthday month","date":"1997-01-31"}]'::jsonb)
on conflict (phone) do update set gender = excluded.gender, relationship_status = excluded.relationship_status, important_people = excluded.important_people, important_dates = excluded.important_dates;

insert into public.ratna_campaigns (name, audience, trigger_type, schedule_label, message, enabled) select * from (values
  ('Anniversary Wishes', 'all', 'anniversary', 'On anniversary · 05:00 AM', 'Happy Anniversary, {name}! Celebrate together at Ratna with a complimentary dessert on your family meal.', true),
  ('Festival & New Year Greetings', 'all', 'festival', 'Festival date · 05:00 AM', 'Warm festive wishes from Ratna ✨ May your home be filled with joy, flavour and togetherness.', true),
  ('New Dish Launch', 'regular', 'manual', 'Friday · 06:00 PM', 'Something delicious is new at Ratna! 🔥 Hi {name}, discover our newest chef special this weekend.', false)
) as seed(name, audience, trigger_type, schedule_label, message, enabled)
where not exists (select 1 from public.ratna_campaigns c where c.name = seed.name);

insert into public.ratna_campaign_deliveries (id, recipient_phone, channel, status, body, created_at, sent_at) values
  ('d0000000-0000-4000-8000-000000000001', '9876543210', 'whatsapp', 'sent', 'Hi Aarav, Ratna lunch is ready. Enjoy a complimentary drink on orders above ₹499 today.', now() - interval '1 day', now() - interval '1 day'),
  ('d0000000-0000-4000-8000-000000000002', '9876543211', 'whatsapp', 'sent', 'Happy Birthday, Meera! 🎉 Celebrate with a complimentary dessert at Ratna this month.', now() - interval '5 days', now() - interval '5 days'),
  ('d0000000-0000-4000-8000-000000000003', '9876543212', 'in_app', 'sent', 'We miss you at Ratna. Come back this week and enjoy 10% off with code WELCOMEHOME.', now() - interval '12 days', now() - interval '12 days')
on conflict (id) do nothing;
