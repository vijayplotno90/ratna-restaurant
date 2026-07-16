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
  if (minimumRole === "owner" && (data as TeamUser).role !== "owner") throw new Error("Owner access required");
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
    const [ordersResult, profilesResult, campaignsResult, itemsResult, auditResult, messagesResult, leadsResult, approvalsResult, deliveriesResult] = await Promise.all([
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
      db.from("ratna_order_items").select("order_id, item_name, quantity, unit_price"),
      db
        .from("ratna_console_audit")
        .select("id, actor_user_id, action, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("ratna_customer_messages")
        .select("id, audience, channel, body, sent_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      db.from("ratna_web_leads").select("id, lead_type, placement, page_path, created_at").order("created_at", { ascending: false }).limit(500),
      db.from("ratna_menu_change_requests").select("id, requested_by, change_type, target_name, summary, payload, status, owner_comment, requested_at, reviewed_at").order("requested_at", { ascending: false }).limit(100),
      db.from("ratna_campaign_deliveries").select("id, campaign_id, recipient_phone, channel, status, body, created_at, sent_at").order("created_at", { ascending: false }).limit(200),
    ]);
    if (ordersResult.error) throw new Error(ordersResult.error.message);
    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (campaignsResult.error) throw new Error(campaignsResult.error.message);
    if (itemsResult.error) throw new Error(itemsResult.error.message);
    if (auditResult.error) throw new Error(auditResult.error.message);
    if (messagesResult.error) throw new Error(messagesResult.error.message);
    return {
      user,
      orders: ordersResult.data ?? [],
      profiles: profilesResult.data ?? [],
      campaigns: campaignsResult.data ?? [],
      items: itemsResult.data ?? [],
      audit: auditResult.data ?? [],
      messages: messagesResult.data ?? [],
      leads: leadsResult.error ? [] : leadsResult.data ?? [],
      approvals: approvalsResult.error ? [] : approvalsResult.data ?? [],
      deliveries: deliveriesResult.error ? [] : deliveriesResult.data ?? [],
    };
  });
