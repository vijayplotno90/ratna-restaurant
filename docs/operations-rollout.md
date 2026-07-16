# Ratna operations rollout

Ratna must use a separate Supabase project from Sri Ram. The migration in `supabase/migrations` creates the customer, order, reservation, messaging and audit foundations with role-aware read access.

1. Create a new Supabase project for Ratna Deluxe and apply the migration.
2. Add the values in `.env.example` to local development and Vercel. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
3. Move checkout, reservation creation, admin status updates, and CA exports from the current browser store to server-side functions.
4. Enable email/OTP authentication, then use the resulting profile role to gate `/admin` and `/owner`.

The current application remains usable locally while the database is being connected. It must not be used for shared production records until step 3 is complete: browser storage is per device and is not an audit-safe business ledger.
