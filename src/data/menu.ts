// Ratna Restaurant menu — real dishes from the physical menu.
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  halfPrice?: number;
  image: string;   // key in dishImages
  category: string;
  veg: boolean;
  popular?: boolean;
  chefPick?: boolean;
  spicy?: 1 | 2 | 3;
  description?: string;
};

export type Category = { id: string; title: string; subtitle: string };

export const categories: Category[] = [
  { id: "popular",     title: "Chef's Picks",     subtitle: "What the regulars order" },
  { id: "soups",       title: "Soups",            subtitle: "Warm openers, veg & non-veg" },
  { id: "starters-v",  title: "Starters · Veg",   subtitle: "Manchuria, tikka & 65" },
  { id: "starters-nv", title: "Starters · Non-Veg", subtitle: "Kebabs, 65 & tandoori bites" },
  { id: "biryani",     title: "Biryani",          subtitle: "Slow-cooked dum, veg & non-veg" },
  { id: "curries-nv",  title: "Main Course · Non-Veg", subtitle: "Chicken, mutton, fish gravies" },
  { id: "curries-v",   title: "Main Course · Veg",     subtitle: "Paneer, dal, seasonal veg" },
  { id: "chinese",     title: "Indo-Chinese",     subtitle: "Wok-tossed favourites" },
  { id: "rice",        title: "Rice & Noodles",   subtitle: "Fried rice & hakka noodles" },
  { id: "breads",      title: "Indian Breads",    subtitle: "Naan, roti, kulcha, paratha" },
  { id: "desserts",    title: "Desserts",         subtitle: "Sweet endings, hot & cold" },
  { id: "drinks",      title: "Juices & Mocktails", subtitle: "Fresh fruit & house specials" },
];

export const menuItems: MenuItem[] = [
  // Soups
  { id: "veg-corn-soup", name: "Veg Corn Soup", price: 70, image: "veg-corn-soup", category: "soups", veg: true },
  { id: "cream-tomato-soup", name: "Cream of Tomato Soup", price: 70, image: "cream-of-tomato-soup", category: "soups", veg: true },
  { id: "veg-hot-sour", name: "Veg Hot & Sour Soup", price: 70, image: "veg-hot-and-sour-soup", category: "soups", veg: true, spicy: 2 },
  { id: "veg-mushroom-soup", name: "Veg Mushroom Soup", price: 70, image: "veg-mushroom-soup", category: "soups", veg: true },
  { id: "chicken-corn-soup", name: "Chicken Corn Soup", price: 80, image: "chicken-corn-soup", category: "soups", veg: false },
  { id: "chicken-hot-sour", name: "Chicken Hot & Sour Soup", price: 80, image: "chicken-hot-and-sour-soup", category: "soups", veg: false, spicy: 2 },
  { id: "chicken-clear-soup", name: "Chicken Clear Soup", price: 80, image: "chicken-clear-soup", category: "soups", veg: false },
  { id: "chicken-manchow", name: "Chicken Manchow Soup", price: 80, image: "chicken-manchow-soup", category: "soups", veg: false },

  // Starters Veg
  { id: "aloo-65", name: "Aloo 65", price: 130, image: "aloo-65", category: "starters-v", veg: true, spicy: 2 },
  { id: "veg-manchuria", name: "Veg Manchuria", price: 160, image: "veg-manchuria", category: "starters-v", veg: true, popular: true },
  { id: "gobi-manchuria", name: "Gobi Manchuria", price: 160, image: "gobi-manchuria", category: "starters-v", veg: true, popular: true },
  { id: "gobi-65", name: "Gobi 65", price: 160, image: "gobi-65", category: "starters-v", veg: true, spicy: 2 },
  { id: "paneer-65", name: "Paneer 65", price: 180, image: "paneer-65", category: "starters-v", veg: true, spicy: 2 },
  { id: "paneer-tikka", name: "Paneer Tikka", price: 180, image: "paneer-tikka", category: "starters-v", veg: true, chefPick: true, description: "Cottage cheese cubes marinated in yoghurt & tandoori spices, charred in the clay oven." },
  { id: "paneer-manchuria", name: "Paneer Manchuria", price: 180, image: "paneer-manchuriya", category: "starters-v", veg: true },
  { id: "mushroom-65", name: "Mushroom 65", price: 180, image: "mushroom-65", category: "starters-v", veg: true, spicy: 2 },
  { id: "paneer-majestic", name: "Paneer Majestic", price: 190, image: "paneer-majestic", category: "starters-v", veg: true, chefPick: true, description: "Hyderabadi favourite — crisp paneer tossed in curry leaves, garlic and green chilli." },

  // Starters Non-Veg
  { id: "chicken-65", name: "Chicken 65", price: 220, image: "chicken-65", category: "starters-nv", veg: false, popular: true, spicy: 3, description: "The Hyderabad classic — bone-in chicken fried with curry leaves & red chilli." },
  { id: "chicken-majestic", name: "Chicken Majestic", price: 240, image: "chicken-majestic", category: "starters-nv", veg: false, popular: true, spicy: 2 },
  { id: "chicken-lollipop", name: "Chicken Lollipop", price: 240, image: "chicken-lollipop", category: "starters-nv", veg: false, popular: true },
  { id: "chicken-tikka", name: "Chicken Tikka", price: 260, image: "chicken-tikka", category: "starters-nv", veg: false, chefPick: true, description: "Boneless chicken marinated overnight in yoghurt and hand-ground tandoori masala." },
  { id: "tandoori-chicken-half", name: "Tandoori Chicken (Half)", price: 240, halfPrice: 240, image: "tandoori-chicken", category: "starters-nv", veg: false, chefPick: true },
  { id: "tandoori-chicken", name: "Tandoori Chicken (Full)", price: 440, image: "tandoori-chicken", category: "starters-nv", veg: false, chefPick: true, description: "Whole chicken, 24-hour marination, live charcoal tandoor." },
  { id: "chicken-seekh", name: "Chicken Seekh Kebab", price: 260, image: "chicken-seekh-kebab", category: "starters-nv", veg: false },
  { id: "mutton-fry", name: "Mutton Fry", price: 320, image: "mutton-fry", category: "starters-nv", veg: false, spicy: 2 },
  { id: "fish-fry", name: "Fish Fry", price: 280, image: "fish-fry", category: "starters-nv", veg: false },
  { id: "prawns-65", name: "Prawns 65", price: 320, image: "prawns-65", category: "starters-nv", veg: false, spicy: 2 },

  // Biryani
  { id: "veg-biryani", name: "Veg Dum Biryani", price: 160, image: "veg-dum-biryani", category: "biryani", veg: true },
  { id: "paneer-biryani", name: "Paneer Biryani", price: 220, image: "paneer-biryani", category: "biryani", veg: true },
  { id: "mushroom-biryani", name: "Mushroom Biryani", price: 210, image: "mushroom-biryani", category: "biryani", veg: true },
  { id: "kashmir-pulao", name: "Kashmir Pulao", price: 210, image: "kashmir-pulao", category: "biryani", veg: true, description: "Fragrant rice with dry fruits, saffron & mild spice." },
  { id: "chicken-biryani", name: "Chicken Dum Biryani", price: 220, image: "chicken-dum-biryani", category: "biryani", veg: false, popular: true, chefPick: true, description: "Our signature — 4 hours of dum, aged basmati, tender chicken, saffron milk." },
  { id: "chicken-fry-biryani", name: "Chicken Fry Piece Biryani", price: 260, image: "chicken-fry-piece-biryani", category: "biryani", veg: false, popular: true },
  { id: "chicken-65-biryani", name: "Chicken 65 Biryani", price: 260, image: "chicken-dum-biryani", category: "biryani", veg: false, spicy: 2 },
  { id: "mutton-biryani", name: "Mutton Dum Biryani", price: 320, image: "mutton-dum-biryani", category: "biryani", veg: false, chefPick: true, description: "Bone-in tender goat, slow-cooked handi-sealed with atta dough." },
  { id: "fish-biryani", name: "Fish Biryani", price: 320, image: "fish-biryani", category: "biryani", veg: false },
  { id: "prawns-biryani", name: "Prawns Biryani", price: 340, image: "prawns-biryani", category: "biryani", veg: false },
  { id: "egg-biryani", name: "Egg Biryani", price: 180, image: "egg-biryani", category: "biryani", veg: false },

  // Curries Veg
  { id: "paneer-butter-masala", name: "Paneer Butter Masala", price: 240, image: "paneer-butter-masala", category: "curries-v", veg: true, popular: true, description: "Rich tomato-cashew gravy, fresh cream, kasuri methi." },
  { id: "kadai-paneer", name: "Kadai Paneer", price: 240, image: "kadai-paneer", category: "curries-v", veg: true, spicy: 2 },
  { id: "palak-paneer", name: "Palak Paneer", price: 220, image: "palak-paneer", category: "curries-v", veg: true },
  { id: "dal-tadka", name: "Dal Tadka", price: 160, image: "dal-tadka", category: "curries-v", veg: true },
  { id: "dal-makhani", name: "Dal Makhani", price: 200, image: "dal-makhani", category: "curries-v", veg: true, description: "Overnight-simmered black urad dal with butter & cream." },
  { id: "veg-kolhapuri", name: "Veg Kolhapuri", price: 210, image: "veg-kolhapuri", category: "curries-v", veg: true, spicy: 3 },
  { id: "mushroom-masala", name: "Mushroom Masala", price: 220, image: "mushroom-masala", category: "curries-v", veg: true },

  // Curries Non-Veg
  { id: "butter-chicken", name: "Butter Chicken", price: 320, image: "butter-chicken", category: "curries-nv", veg: false, popular: true, chefPick: true, description: "North Indian classic — tandoori chicken in silky tomato-butter gravy." },
  { id: "chicken-curry", name: "Chicken Curry", price: 280, image: "chicken-curry", category: "curries-nv", veg: false, spicy: 2 },
  { id: "kadai-chicken", name: "Kadai Chicken", price: 300, image: "kadai-chicken", category: "curries-nv", veg: false, spicy: 2 },
  { id: "chicken-tikka-masala", name: "Chicken Tikka Masala", price: 320, image: "chicken-tikka-masala", category: "curries-nv", veg: false },
  { id: "mutton-rogan", name: "Mutton Rogan Josh", price: 380, image: "mutton-rogan-josh", category: "curries-nv", veg: false, chefPick: true, description: "Kashmiri-style slow-cooked mutton in aromatic red gravy." },
  { id: "mutton-curry", name: "Mutton Curry", price: 380, image: "mutton-curry", category: "curries-nv", veg: false, spicy: 2 },
  { id: "fish-curry", name: "Fish Curry", price: 320, image: "fish-curry", category: "curries-nv", veg: false },
  { id: "prawns-masala", name: "Prawns Masala", price: 360, image: "prawns-masala", category: "curries-nv", veg: false },

  // Indo-Chinese
  { id: "chilli-chicken", name: "Chilli Chicken", price: 240, image: "chilli-chicken", category: "chinese", veg: false, popular: true, spicy: 2, description: "Wok-tossed with capsicum, spring onion & house schezwan." },
  { id: "chicken-manchuria", name: "Chicken Manchuria (Dry)", price: 240, image: "chicken-manchuria-dry", category: "chinese", veg: false },
  { id: "chilli-paneer", name: "Chilli Paneer", price: 200, image: "chilli-paneer", category: "chinese", veg: true, popular: true, spicy: 2 },
  { id: "schezwan-chicken", name: "Schezwan Chicken", price: 260, image: "schezwan-chicken", category: "chinese", veg: false, spicy: 3 },

  // Rice & Noodles
  { id: "veg-fried-rice", name: "Veg Fried Rice", price: 140, image: "veg-frield-rice", category: "rice", veg: true },
  { id: "chicken-fried-rice", name: "Chicken Fried Rice", price: 180, image: "schezwan-fried-rice", category: "rice", veg: false },
  { id: "schezwan-fried-rice", name: "Schezwan Fried Rice", price: 180, image: "schezwan-fried-rice", category: "rice", veg: true, spicy: 2 },
  { id: "veg-hakka", name: "Veg Hakka Noodles", price: 160, image: "veg-hakka-noodles", category: "rice", veg: true },
  { id: "chicken-hakka", name: "Chicken Hakka Noodles", price: 200, image: "chicken-hakka-noodles", category: "rice", veg: false },

  // Breads
  { id: "tandoori-roti", name: "Tandoori Roti", price: 30, image: "tandoori-roti", category: "breads", veg: true },
  { id: "butter-naan", name: "Butter Naan", price: 50, image: "butter-naan", category: "breads", veg: true, popular: true },
  { id: "garlic-naan", name: "Garlic Naan", price: 70, image: "garlic-naan", category: "breads", veg: true, popular: true },
  { id: "cheese-naan", name: "Cheese Naan", price: 90, image: "cheese-naan", category: "breads", veg: true },
  { id: "lachha-paratha", name: "Lachha Paratha", price: 60, image: "lachha-paratha", category: "breads", veg: true },

  // Desserts
  { id: "gulab-jamun", name: "Gulab Jamun (2 pcs)", price: 60, image: "gulab-jamun", category: "desserts", veg: true, popular: true },
  { id: "double-meetha", name: "Double Ka Meetha", price: 90, image: "double-ka-meetha", category: "desserts", veg: true, description: "Hyderabadi bread pudding, saffron milk, dry fruits." },
  { id: "qubani-meetha", name: "Qubani Ka Meetha", price: 110, image: "qubani-ka-meetha", category: "desserts", veg: true, chefPick: true, description: "Slow-cooked apricots with fresh cream. A wedding-table classic." },
  { id: "ice-cream", name: "Vanilla Ice Cream (2 scoops)", price: 80, image: "vanilla-icecream", category: "desserts", veg: true },

  // Drinks
  { id: "fresh-lime", name: "Fresh Lime Soda", price: 60, image: "fresh-lime-soda", category: "drinks", veg: true },
  { id: "sweet-lassi", name: "Sweet Lassi", price: 80, image: "sweet-lassi", category: "drinks", veg: true },
  { id: "mango-lassi", name: "Mango Lassi", price: 100, image: "mango-lassi", category: "drinks", veg: true, popular: true },
  { id: "virgin-mojito", name: "Virgin Mojito", price: 120, image: "virgin-mojito", category: "drinks", veg: true },
  { id: "watermelon-juice", name: "Watermelon Juice", price: 90, image: "water-melon-juice", category: "drinks", veg: true },
];

export function getItem(id: string) {
  return menuItems.find((m) => m.id === id);
}

// Real dish photography, uploaded to the Lovable CDN. Each menu item's `image`
// field is a slug matching one of the JPG files under src/assets/dishes.
import imgThali from "@/assets/dish-thali.jpg";
import { photoBySlug } from "./dish-images";

export const dishImages: Record<string, string> = { ...photoBySlug };

export function dishUrl(slug: string): string {
  return dishImages[slug] ?? imgThali;
}

export const RESTAURANT = {
  name: "Ratna & Ratna Deluxe",
  tagline: "Multi-Cuisine Restaurant · Veg & Non-Veg · A/C",
  address: "Road No. 3, Bhagawan Colony, Chakripuram Cross Roads, Nagarjuna Nagar, Secunderabad, Telangana 500062",
  area: "Chakripuram · Kushaiguda, Hyderabad",
  phone: "+91 40 6456 3439",
  phoneShort: "040 6456 3439",
  hours: "12:00 PM – 11:30 PM · All 7 days",
  established: 2004,
  rating: 4.0,
  reviews: 8616,
  seats: 120,
  ac: true,
  map: "https://maps.google.com/?q=Ratna+Restaurant+Chakripuram+Kushaiguda+Hyderabad",
  // Approximate coordinates of the storefront — used for delivery-radius checks.
  lat: 17.4948,
  lng: 78.5606,
  deliveryRadiusKm: 7,
};

// Ratna has two dining rooms under one roof — the standard hall and the fully
// A/C Deluxe hall. Pricing on Deluxe is a modest surcharge for the A/C service.
export type Location = {
  id: "ratna" | "deluxe";
  name: string;
  short: string;
  tagline: string;
  description: string;
  ac: boolean;
  seats: number;
  priceMultiplier: number;
  minGuests: number;
  reserveNote: string;
  bestFor: string[];
};

export const LOCATIONS: Location[] = [
  {
    id: "ratna",
    name: "Ratna",
    short: "Ratna",
    tagline: "The original hall · walk-in friendly",
    description:
      "Our classic multi-cuisine hall — buzzy, family-friendly, quick service. Standard menu pricing, no service charge. Perfect for weekday meals and takeaway.",
    ac: false,
    seats: 60,
    priceMultiplier: 1,
    minGuests: 1,
    reserveNote: "Walk-ins welcome. Reservations recommended for groups of 6+.",
    bestFor: ["Weekday meals", "Family lunch", "Takeaway", "Quick dine-in"],
  },
  {
    id: "deluxe",
    name: "Ratna Deluxe",
    short: "Deluxe",
    tagline: "Full A/C · reservations recommended",
    description:
      "Our premium fully air-conditioned dining hall — soft lighting, roomier tables, quieter setting. Deluxe pricing includes A/C service. Ideal for date nights, celebrations and corporate lunches.",
    ac: true,
    seats: 120,
    priceMultiplier: 1.15,
    minGuests: 2,
    reserveNote: "Reservations recommended after 7 PM and on weekends.",
    bestFor: ["Date nights", "Celebrations", "Corporate lunches", "Weekend dinners"],
  },
];

export function getLocation(id: string): Location {
  return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];
}

export function priceAt(basePrice: number, locationId: string): number {
  const loc = getLocation(locationId);
  return Math.round(basePrice * loc.priceMultiplier);
}
