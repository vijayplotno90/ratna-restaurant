import { defineTool } from "@lovable.dev/mcp-js";
import { categories } from "@/data/menu";

export default defineTool({
  name: "list_menu_categories",
  title: "List menu categories",
  description: "List all menu categories at Ratna (soups, biryani, tandoori, indo-chinese, breads, desserts, etc.).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(categories, null, 2) }],
    structuredContent: { categories },
  }),
});