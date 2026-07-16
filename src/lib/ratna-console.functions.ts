import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentials = z.object({
  userId: z.string().trim().min(3).max(40),
  password: z.string().min(4).max(100),
});

type TeamUser = { id: string; user_id: string; name: string; role: "owner" | "admin" | "staff" };

async function authenticate(
  input: z.infer<typeof credentials>,
  minimumRole: "owner" | "admin",
): Promise<TeamUser> {
  const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
  const db = getRatnaAdminClient();
  const { data, error } = await db
    .rpc("ratna_authenticate_team", { p_user_id: input.userId, p_password: input.password })
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Invalid user ID or password");
  if (minimumRole === "owner" && data.role !== "owner") throw new Error("Owner access required");
  return data as TeamUser;
}

export const ratnaOwnerLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.parse(input))
  .handler(async ({ data }) => ({ user: await authenticate(data, "owner") }));

export const ratnaAdminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.parse(input))
  .handler(async ({ data }) => ({ user: await authenticate(data, "admin") }));

export const ratnaOwnerOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const [ordersResult, profilesResult, campaignsResult] = await Promise.all([
      db
        .from("ratna_orders")
        .select(
          "id, order_number, customer_name, customer_phone, total, gst_amount, status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      db
        .from("ratna_customer_profiles")
        .select("phone, email, birthday, anniversary, preferences, notes, marketing_consent"),
      db
        .from("ratna_campaigns")
        .select("id, name, audience, trigger_type, schedule_label, message, enabled, last_run_at")
        .order("created_at"),
    ]);
    if (ordersResult.error) throw new Error(ordersResult.error.message);
    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (campaignsResult.error) throw new Error(campaignsResult.error.message);
    return {
      user,
      orders: ordersResult.data ?? [],
      profiles: profilesResult.data ?? [],
      campaigns: campaignsResult.data ?? [],
    };
  });
