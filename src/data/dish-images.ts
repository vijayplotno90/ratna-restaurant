// Auto-load every dish photo stored under src/assets/dishes/*.jpg.
// Key is the filename slug (for example, "chicken-dum-biryani").
const modules = import.meta.glob("../assets/dishes/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const photoBySlug: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split("/").pop() ?? "";
  const slug = file.replace(/\.jpg$/i, "");
  photoBySlug[slug] = url;
}
