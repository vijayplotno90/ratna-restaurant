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
    const [ordersResult, profilesResult, campaignsResult, itemsResult, auditResult, messagesResult, leadsResult, approvalsResult, deliveriesResult, festivalsResult] = await Promise.all([
      db
        .from("ratna_orders")
        .select(
          "id, order_number, customer_name, customer_phone, total, gst_amount, status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      db
        .from("ratna_customer_profiles")
        .select("phone, email, birthday, anniversary, preferences, notes, marketing_consent, gender, relationship_status, important_people, important_dates"),
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
      db.from("ratna_festival_calendar").select("id, category, festival_name, date_2026, date_2027, hyderabad_context, lunar_date").order("date_2026"),
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
      festivals: festivalsResult.error ? [] : festivalsResult.data ?? [],
    };
  });

const campaignInput = credentials.extend({
  id: z.string().uuid(),
  name: z.string().trim().min(3).max(120),
  audience: z.enum(["all", "new", "regular", "at_risk", "vip"]),
  triggerType: z.enum(["scheduled", "birthday", "anniversary", "festival", "manual"]),
  scheduleLabel: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(1000),
  enabled: z.boolean(),
});

export const ratnaUpdateCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => campaignInput.parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_campaigns").update({
      name: data.name, audience: data.audience, trigger_type: data.triggerType,
      schedule_label: data.scheduleLabel, message: data.message, enabled: data.enabled,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "campaign_updated", metadata: { campaign_id: data.id, name: data.name } });
    return { ok: true };
  });

export const ratnaRunCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { data: campaign, error } = await db.from("ratna_campaigns").select("id, name, audience, message").eq("id", data.id).maybeSingle();
    if (error || !campaign) throw new Error(error?.message ?? "Campaign not found");
    const { data: profiles } = await db.from("ratna_customer_profiles").select("phone, marketing_consent").eq("marketing_consent", true);
    const recipients = profiles ?? [];
    if (recipients.length) {
      const { error: insertError } = await db.from("ratna_campaign_deliveries").insert(recipients.map((profile) => ({
        campaign_id: campaign.id, recipient_phone: profile.phone, channel: "whatsapp", status: "queued",
        body: campaign.message, created_at: new Date().toISOString(),
      })));
      if (insertError) throw new Error(insertError.message);
    }
    await db.from("ratna_campaigns").update({ last_run_at: new Date().toISOString() }).eq("id", campaign.id);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "campaign_queued", metadata: { campaign_id: campaign.id, recipients: recipients.length } });
    return { queued: recipients.length };
  });
