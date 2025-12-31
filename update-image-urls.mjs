import { drizzle } from "drizzle-orm/mysql2";
import { products } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const imageMapping = {
  "/images/windows-11-pro.png": "/images/windows-11-pro.webp",
  "/images/windows-11-home.png": "/images/windows-11-home.webp",
  "/images/office-2021.png": "/images/office-2021.webp",
  "/images/microsoft-365.png": "/images/microsoft-365.webp",
  "/images/autocad.png": "/images/autocad.webp",
  "/images/adobe-cc.png": "/images/adobe-cc.webp",
  "/images/capcut.png": "/images/capcut.webp",
  "/images/canva.png": "/images/canva.webp",
  "/images/chatgpt.png": "/images/chatgpt.webp",
  "/images/perplexity.png": "/images/perplexity.webp",
};

async function updateImageUrls() {
  console.log("Updating product image URLs to WebP format...\n");
  
  const allProducts = await db.select().from(products);
  
  for (const product of allProducts) {
    const oldUrl = product.imageUrl;
    const newUrl = imageMapping[oldUrl];
    
    if (newUrl) {
      await db.update(products)
        .set({ imageUrl: newUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✓ Updated ${product.name}: ${oldUrl} → ${newUrl}`);
    }
  }
  
  console.log("\n✅ All product images updated to WebP format!");
  process.exit(0);
}

updateImageUrls().catch(console.error);
