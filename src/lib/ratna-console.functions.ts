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
    try { await db.rpc("ratna_prune_expired_custom_festivals"); } catch { /* migration may not be applied yet */ }
    const [ordersResult, profilesResult, campaignsResult, itemsResult, auditResult, messagesResult, leadsResult, approvalsResult, deliveriesResult, festivalsResult, customFestivalsResult] = await Promise.all([
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
        .select("id, name, audience, trigger_type, schedule_label, message, enabled, last_run_at, icon")
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
      db.from("ratna_festival_calendar").select("id, category, festival_name, date_2026, date_2027, hyderabad_context, lunar_date, message_template, delivery_time, channels, active").order("date_2026"),
      db.from("ratna_custom_festival_plans").select("id, festival_name, scheduled_date, message_template, delivery_time, channels, active, created_at").order("scheduled_date"),
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
      customFestivals: customFestivalsResult.error ? [] : customFestivalsResult.data ?? [],
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
  icon: z.string().trim().min(1).max(12).optional(),
});

export const ratnaUpdateCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => campaignInput.parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_campaigns").update({
      name: data.name, audience: data.audience, trigger_type: data.triggerType,
      schedule_label: data.scheduleLabel, message: data.message, enabled: data.enabled, icon: data.icon ?? "📣",
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "campaign_updated", metadata: { campaign_id: data.id, name: data.name } });
    return { ok: true };
  });

export const ratnaCreateCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => campaignInput.omit({ id: true }).parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_campaigns").insert({
      name: data.name, audience: data.audience, trigger_type: data.triggerType,
      schedule_label: data.scheduleLabel, message: data.message, enabled: data.enabled, icon: data.icon ?? "📣",
    });
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "campaign_created", metadata: { name: data.name } });
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

export const ratnaUpdateFestivalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.extend({
    id: z.string().uuid(), messageTemplate: z.string().trim().min(10).max(1000),
    deliveryTime: z.string().regex(/^\d{2}:\d{2}$/),
    channels: z.array(z.enum(["in_app", "whatsapp", "sms"])).min(1), active: z.boolean(),
  }).parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_festival_calendar").update({
      message_template: data.messageTemplate, delivery_time: data.deliveryTime, channels: data.channels, active: data.active,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "festival_plan_updated", metadata: { festival_id: data.id } });
    return { ok: true };
  });

export const ratnaAddFestivalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.extend({
    festivalName: z.string().trim().min(3).max(120), scheduledDate: z.string().date(),
    messageTemplate: z.string().trim().min(10).max(1000), deliveryTime: z.string().regex(/^\d{2}:\d{2}$/),
    channels: z.array(z.enum(["in_app", "whatsapp", "sms"])).min(1), active: z.boolean(),
  }).parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_custom_festival_plans").insert({
      festival_name: data.festivalName, scheduled_date: data.scheduledDate, message_template: data.messageTemplate,
      delivery_time: data.deliveryTime, channels: data.channels, active: data.active, created_by: user.user_id,
    });
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "custom_festival_added", metadata: { festival: data.festivalName, date: data.scheduledDate } });
    return { ok: true };
  });

const menuRequestInput = credentials.extend({
  changeType: z.enum(["dish", "price", "availability", "offer", "special", "custom_dish", "website", "category"]),
  targetName: z.string().trim().min(2).max(160),
  summary: z.string().trim().min(8).max(600),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const ratnaSubmitMenuRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => menuRequestInput.parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "admin");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_menu_change_requests").insert({
      requested_by: user.user_id, change_type: data.changeType, target_name: data.targetName,
      summary: data.summary, payload: data.payload,
    });
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: "menu_change_requested", metadata: { change_type: data.changeType, target: data.targetName } });
    return { ok: true };
  });

export const ratnaReviewMenuRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.extend({
    id: z.string().uuid(), decision: z.enum(["approved", "rejected"]), comment: z.string().trim().max(500).optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    const user = await authenticate(data, "owner");
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_menu_change_requests").update({
      status: data.decision, owner_comment: data.comment || null, reviewed_by: user.user_id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", data.id).eq("status", "pending");
    if (error) throw new Error(error.message);
    await db.from("ratna_console_audit").insert({ actor_user_id: user.user_id, action: `menu_change_${data.decision}`, metadata: { request_id: data.id, comment: data.comment || null } });
    return { ok: true };
  });

const customerPhone = z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number");
const customerProfile = z.object({
  fullName: z.string().trim().min(2).max(100), phone: customerPhone,
  email: z.string().trim().email(), birthday: z.string().date(),
  gender: z.string().trim().min(1).max(40), relationshipStatus: z.string().trim().min(1).max(40),
  importantPeople: z.array(z.object({ name: z.string(), relation: z.string(), date: z.string() })).default([]),
  importantDates: z.array(z.object({ label: z.string(), date: z.string() })).default([]),
  referralCode: z.string().trim().max(60).optional(), defaultAddress: z.string().trim().min(8).max(300),
  deliveryLatitude: z.number().min(-90).max(90).nullable().optional(),
  deliveryLongitude: z.number().min(-180).max(180).nullable().optional(),
  marketingConsent: z.boolean().default(false),
});

/** The seeded Ram account can use a private demo code. All real customers require an SMS provider. */
export const ratnaRequestCustomerOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ phone: customerPhone, purpose: z.enum(["sign_in", "create_account"]) }).parse(input))
  .handler(async ({ data }) => {
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { data: profile, error } = await db.from("ratna_customer_profiles").select("phone").eq("phone", data.phone).maybeSingle();
    if (error) throw new Error(error.message);
    if (data.purpose === "sign_in" && !profile) throw new Error("No Ratna account found for this mobile number. Please create one.");
    if (data.purpose === "create_account" && profile) throw new Error("This mobile number already has a Ratna account. Please sign in.");
    await db.from("ratna_customer_otps").delete().eq("phone", data.phone).is("used_at", null);
    const code = data.phone === "9999999999" ? process.env.RATNA_RAM_DEMO_OTP : undefined;
    if (!code) throw new Error("SMS OTP delivery is not configured yet. The Ratna team can still test Ram's demo account after setting RATNA_RAM_DEMO_OTP in Vercel.");
    const { error: insertError } = await db.from("ratna_customer_otps").insert({ phone: data.phone, code, purpose: data.purpose, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
    if (insertError) throw new Error(insertError.message);
    return { demo: data.phone === "9999999999" };
  });

export const ratnaCreateCustomerAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => customerProfile.parse(input))
  .handler(async ({ data }) => {
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { error } = await db.from("ratna_customer_profiles").insert({
      phone: data.phone, full_name: data.fullName, email: data.email, birthday: data.birthday,
      gender: data.gender, relationship_status: data.relationshipStatus, important_people: data.importantPeople,
      important_dates: data.importantDates, default_address: data.defaultAddress, marketing_consent: data.marketingConsent,
      delivery_latitude: data.deliveryLatitude ?? null, delivery_longitude: data.deliveryLongitude ?? null,
      notes: data.referralCode ? `Referral code: ${data.referralCode}` : null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ratnaVerifyCustomerOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ phone: customerPhone, code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") }).parse(input))
  .handler(async ({ data }) => {
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { data: otp, error } = await db.from("ratna_customer_otps").select("id").eq("phone", data.phone).eq("code", data.code).is("used_at", null).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    if (!otp) throw new Error("That code is invalid or has expired. Please request a new one.");
    await db.from("ratna_customer_otps").update({ used_at: new Date().toISOString() }).eq("id", otp.id);
    const { data: profile, error: profileError } = await db.from("ratna_customer_profiles").select("phone, full_name").eq("phone", data.phone).maybeSingle();
    if (profileError || !profile) throw new Error(profileError?.message ?? "Account profile not found");
    return { customer: { phone: profile.phone, name: profile.full_name || "Ratna customer" } };
  });

export const ratnaCustomerOrders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ phone: customerPhone }).parse(input))
  .handler(async ({ data }) => {
    const { getRatnaAdminClient } = await import("@/integrations/supabase/client.server");
    const db = getRatnaAdminClient();
    const { data: orders, error } = await db.from("ratna_orders").select("id, order_number, customer_name, customer_phone, fulfilment, status, subtotal, delivery_fee, gst_amount, total, created_at").eq("customer_phone", data.phone).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (orders ?? []).map((order) => order.id);
    const { data: items, error: itemsError } = ids.length ? await db.from("ratna_order_items").select("order_id, item_name, quantity, unit_price").in("order_id", ids) : { data: [], error: null };
    if (itemsError) throw new Error(itemsError.message);
    return { orders: orders ?? [], items: items ?? [] };
  });
