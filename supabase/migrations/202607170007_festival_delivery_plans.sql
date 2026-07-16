-- Each festival has its own editable message and delivery plan.
alter table public.ratna_festival_calendar
  add column if not exists message_template text,
  add column if not exists delivery_time time not null default '05:00',
  add column if not exists channels text[] not null default array['in_app','whatsapp','sms'],
  add column if not exists active boolean not null default true;

update public.ratna_festival_calendar
set message_template = format(
  'Hello {name} garu, warm wishes from Ratna on %s! May your day be filled with joy, family time and memorable flavours. We look forward to serving you.',
  festival_name
)
where message_template is null;

-- A few more personal Ratna-ready templates for the key Hyderabad occasions.
update public.ratna_festival_calendar set message_template = 'Hello {name} garu, Sankranti शुभాకాంక్షలు from Ratna! Wishing you a bright harvest season full of family, kites and delicious celebrations.' where festival_name = 'Makar Sankranti / Pongal';
update public.ratna_festival_calendar set message_template = 'Hello {name} garu, Ugadi శుభాకాంక్షలు from Ratna! May the Telugu New Year bring sweetness, prosperity and beautiful family moments.' where festival_name = 'Ugadi / Gudi Padwa';
update public.ratna_festival_calendar set message_template = 'Hello {name} garu, Ramzan Mubarak from the Ratna family. Wishing you peace, blessings and joyful Iftar celebrations.' where festival_name = 'Eid al-Fitr (Ramzan Eid)';
update public.ratna_festival_calendar set message_template = 'Hello {name} garu, Vinayaka Chavithi wishes from Ratna! May Lord Ganesha bring wisdom, happiness and success to your family.' where festival_name = 'Ganesh Chaturthi / Vinayaka Chavithi';
update public.ratna_festival_calendar set message_template = 'Hello {name} garu, Diwali शुभాకాంక్షలు from Ratna! May your home shine with happiness, warmth and togetherness.' where festival_name = 'Diwali (Deepavali)';
update public.ratna_festival_calendar set message_template = 'Hello {name} garu, Merry Christmas from Ratna! Wishing your family a season of peace, joy and shared celebrations.' where festival_name = 'Christmas';
