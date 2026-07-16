import { defineMcp } from "@lovable.dev/mcp-js";
import getRestaurantInfo from "./tools/get-restaurant-info";
import listCategories from "./tools/list-categories";
import searchMenu from "./tools/search-menu";
import checkDelivery from "./tools/check-delivery";

export default defineMcp({
  name: "ratna-mcp",
  title: "Ratna Deluxe",
  version: "0.1.0",
  instructions:
    "Public tools for Ratna & Ratna Deluxe, a multi-cuisine restaurant in Kushaiguda, Hyderabad. Look up restaurant info (address, phone, hours), browse menu categories, search dishes with prices for either dining hall, and check whether an address is within the 7 km delivery radius.",
  tools: [getRestaurantInfo, listCategories, searchMenu, checkDelivery],
});