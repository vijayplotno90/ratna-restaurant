-- Celebration dates that are meaningful for restaurant campaigns.
insert into public.ratna_festival_calendar (category, festival_name, date_2026, date_2027, hyderabad_context, lunar_date, message_template, delivery_time, channels, active)
select 'Celebration', 'Valentine''s Day', '2026-02-14', '2027-02-14', 'Couples dining and intimate celebration tables.', false, 'Hello {name} garu, celebrate your special day with a memorable meal at Ratna. Reserve your table today.', '05:00', array['in_app','whatsapp','sms'], true
where not exists (select 1 from public.ratna_festival_calendar where festival_name = 'Valentine''s Day');

insert into public.ratna_campaigns (name, audience, trigger_type, schedule_label, message, enabled, icon)
select 'Celebrate with Ratna', 'all', 'manual', 'Owner schedules as needed', 'Hello {name} garu, celebrating a birthday, anniversary, new job or family moment? Bring your people to Ratna for a memorable meal.', false, '🎉'
where not exists (select 1 from public.ratna_campaigns where name = 'Celebrate with Ratna');
