import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { categories } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const iconUpdates = [
  { slug: "sistemas-operativos", iconUrl: "/icons/sistemas-operativos.webp" },
  { slug: "productividad", iconUrl: "/icons/productividad.webp" },
  { slug: "diseno-creatividad", iconUrl: "/icons/diseno-creatividad.webp" },
  { slug: "inteligencia-artificial", iconUrl: "/icons/inteligencia-artificial.webp" },
];

for (const update of iconUpdates) {
  await db
    .update(categories)
    .set({ iconUrl: update.iconUrl })
    .where(eq(categories.slug, update.slug));
  console.log(`✓ Updated icon for ${update.slug}`);
}

console.log("\n✅ All category icons updated successfully!");
process.exit(0);
