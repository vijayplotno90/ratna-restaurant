# Admin Dashboard + Real Dish Photos

Two things in one pass: (1) upload the 75 real dish photos from `images.zip` and wire them to menu items, (2) build an admin control center for the operations you listed — reservations, orders, delivery, enquiries, and menu editing.

## Part 1 — Real dish photography

- Extract `images.zip` and upload every JPG through the Lovable Assets CDN (no binaries in the repo).
- Generate `src/data/dish-images.ts` — a map from menu item id → CDN URL, matched by dish name (e.g. `chicken-dum-biryani` → `chicken dum biryani.jpg`).
- Update `src/data/menu.ts` so each item's `image` field points to the real photo when we have one; the current 5 shared stock photos become the fallback for the handful of items without a match (e.g. some breads/desserts if any are missing).
- Menu card, dish detail page, cart, and hero rails automatically pick up the new photos — they already read `dishImages[item.image]`.

## Part 2 — Admin Control Center

New protected area at `/admin` with a left-rail dashboard shell (site chrome hidden). All data lives in `localStorage` for now (matches how cart/orders/reservations already work) so it's fully functional without a backend — swappable to Lovable Cloud later when you want real multi-device sync.

### Simple gate
- `/admin/login` — passphrase input (default `ratna-admin`, stored in `localStorage`). Not real auth; just keeps the page from being casually opened. We can promote to Lovable Cloud auth in a follow-up.

### Sections (left rail)

1. **Overview** — today's numbers: reservations, orders, revenue, pending deliveries, unread enquiries. Recent activity feed.
2. **Reservations** — every booking made via `/reserve`. Columns: name, phone, date/time, guests, hall (Ratna / Deluxe), seating pref, status. Actions: **Confirm**, **Assign table** (pick from a table list per hall), **Mark seated**, **No-show**, **Cancel & refund fee**. Filter by date, hall, status.
3. **Orders & Delivery** — every order from `/checkout`. Kanban-style columns: *New → Preparing → Ready → Out for delivery → Delivered* (dine-in flow: *New → Preparing → Served*). Order card shows items, total, customer, address, distance. Actions: advance stage, assign rider (free-text name), print bill (browser print view), cancel.
4. **Menu Manager** — full table of every dish. Inline edit: name, price, half price, category, veg/non-veg, chef's pick, popular, spicy level, description, photo (pick from uploaded CDN photos or paste URL). Toggle **Available / 86'd** (sold out) — 86'd dishes show as unavailable on the public menu. Add new dish. Delete dish. Reorder categories.
5. **Enquiries** — a new inbox. Add a small "Send us a message" form on `/visit` (name, phone, message) that writes into this inbox. Admin can mark **Read / Replied / Archived**, and click phone to call.
6. **Tables & Halls** — configure how many tables per hall, capacity per table. Used by the Reservations "Assign table" picker.
7. **Settings** — restaurant hours, phone, delivery radius (used by MCP + delivery checker), admin passphrase, "Kitchen paused" master switch that stops accepting online orders.

### How it stays in sync with the public site

- `/reserve` writes bookings into the same `localStorage` key the admin reads.
- `/checkout` writes orders similarly (already does — admin just gains a view + status updates).
- Menu Manager writes an overrides layer on top of `src/data/menu.ts`; the public menu merges base data + overrides so edits appear instantly without a rebuild.
- "Kitchen paused" flag disables the Order button on `/menu` and shows a banner.

## Technical notes

- New files: `src/routes/admin.tsx` (layout with sidebar + auth gate), `src/routes/admin.index.tsx` (Overview), plus one route per section (`admin.reservations.tsx`, `admin.orders.tsx`, `admin.menu.tsx`, `admin.enquiries.tsx`, `admin.tables.tsx`, `admin.settings.tsx`, `admin.login.tsx`).
- New store: `src/lib/admin-store.ts` — typed localStorage hooks for reservations, orders, enquiries, menu overrides, table config, settings. Reused by public pages so writes flow into the admin automatically.
- Existing `/reserve` and `/checkout` get tiny edits so their submissions land in the admin store (they already store data locally; we just standardize the key + shape).
- `/visit` gains an enquiry form.
- Design language matches the emerald & brass palette already in use — no new palette, no new fonts.
- Images: uploaded via `lovable-assets create` and referenced by `.asset.json` pointers, keeping the repo binary-free.
- MCP tools automatically benefit from menu overrides + settings (delivery radius, hours) because they read the same source of truth.

Nothing here changes routing structure beyond adding `/admin/*`, and nothing touches auth/business logic on public pages beyond the tiny writes into the admin store.
