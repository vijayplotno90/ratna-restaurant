import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { menuItems, priceAt } from "@/data/menu";

export default defineTool({
  name: "search_menu",
  title: "Search the menu",
  description:
    "Search Ratna's menu by name/description keyword, category, veg/non-veg, or chef's pick. Returns matching dishes with prices for the chosen dining hall (Ratna or Ratna Deluxe; deluxe adds a small A/C surcharge).",
  inputSchema: {
    query: z.string().optional().describe("Case-insensitive keyword matched against dish name and description."),
    category: z.string().optional().describe("Category id, e.g. biryani, starters-nv, chinese, breads."),
    veg: z.boolean().optional().describe("If true, only vegetarian dishes; if false, only non-veg."),
    chefPickOnly: z.boolean().optional().describe("If true, only Chef's Selection dishes."),
    location: z.enum(["ratna", "deluxe"]).optional().describe("Dining hall for pricing. Defaults to ratna."),
    limit: z.number().int().positive().optional().describe("Max results. Defaults to 25."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, veg, chefPickOnly, location, limit }) => {
    const loc = location ?? "ratna";
    const max = limit ?? 25;
    const q = query?.trim().toLowerCase();
    const results = menuItems
      .filter((d) => {
        if (category && d.category !== category) return false;
        if (typeof veg === "boolean" && d.veg !== veg) return false;
        if (chefPickOnly && !d.chefPick) return false;
        if (q) {
          const hay = `${d.name} ${d.description ?? ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice(0, max)
      .map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        veg: d.veg,
        price: priceAt(d.price, loc),
        halfPrice: d.halfPrice ? priceAt(d.halfPrice, loc) : undefined,
        chefPick: d.chefPick ?? false,
        popular: d.popular ?? false,
        spicy: d.spicy,
        description: d.description,
      }));

    return {
      content: [
        {
          type: "text",
          text:
            results.length === 0
              ? "No dishes matched those filters."
              : JSON.stringify(results, null, 2),
        },
      ],
      structuredContent: { location: loc, count: results.length, results },
    };
  },
});