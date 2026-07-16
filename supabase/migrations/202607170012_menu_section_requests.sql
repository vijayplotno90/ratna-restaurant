-- Menu sections are also owner-controlled: add, rename or retire a section.
alter table public.ratna_menu_change_requests
  drop constraint if exists ratna_menu_change_requests_change_type_check;
alter table public.ratna_menu_change_requests
  add constraint ratna_menu_change_requests_change_type_check
  check (change_type in ('dish', 'price', 'availability', 'offer', 'special', 'custom_dish', 'website', 'category'));
