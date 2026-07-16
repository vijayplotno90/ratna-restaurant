-- Admins propose menu work; the owner is the only person who can approve it.
-- The request itself is retained as the operational record, rather than hiding
-- menu edits in one employee's browser.

alter table public.ratna_menu_change_requests
  add column if not exists applied_at timestamptz,
  add column if not exists applied_by text;

create index if not exists ratna_menu_change_requests_status_requested_at_idx
  on public.ratna_menu_change_requests (status, requested_at desc);

