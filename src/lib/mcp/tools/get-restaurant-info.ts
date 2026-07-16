import { defineTool } from "@lovable.dev/mcp-js";
import { RESTAURANT, LOCATIONS } from "@/data/menu";

export default defineTool({
  name: "get_restaurant_info",
  title: "Get restaurant info",
  description:
    "Return Ratna & Ratna Deluxe's public info: name, address, phone, hours, rating, delivery radius, and the two dining halls (Ratna and Ratna Deluxe).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const payload = {
      restaurant: RESTAURANT,
      locations: LOCATIONS.map((l) => ({
        id: l.id,
        name: l.name,
        tagline: l.tagline,
        description: l.description,
        ac: l.ac,
        seats: l.seats,
        priceMultiplier: l.priceMultiplier,
        reserveNote: l.reserveNote,
        bestFor: l.bestFor,
      })),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});