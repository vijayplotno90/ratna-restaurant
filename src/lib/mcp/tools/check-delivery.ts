import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { RESTAURANT } from "@/data/menu";

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export default defineTool({
  name: "check_delivery_availability",
  title: "Check delivery availability",
  description:
    "Given a customer's latitude and longitude, check whether Ratna delivers there (within a 7 km radius of the storefront). Returns distance and whether to order online or call.",
  inputSchema: {
    lat: z.number().describe("Customer latitude in decimal degrees."),
    lng: z.number().describe("Customer longitude in decimal degrees."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ lat, lng }) => {
    const distanceKm = haversineKm({ lat, lng }, { lat: RESTAURANT.lat, lng: RESTAURANT.lng });
    const withinRadius = distanceKm <= RESTAURANT.deliveryRadiusKm;
    const payload = {
      withinRadius,
      distanceKm: Math.round(distanceKm * 10) / 10,
      deliveryRadiusKm: RESTAURANT.deliveryRadiusKm,
      phone: RESTAURANT.phone,
      message: withinRadius
        ? "In range — online ordering available."
        : `Out of ${RESTAURANT.deliveryRadiusKm} km delivery range. Please call ${RESTAURANT.phone} to confirm.`,
    };
    return {
      content: [{ type: "text", text: payload.message }],
      structuredContent: payload,
    };
  },
});