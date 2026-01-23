import { getDb } from "./db";
import { paymentMethods } from "../drizzle/schema";

async function seedPaymentMethods() {
  console.log("[Seed] Inserting default payment methods...");
  
  const db = getDb();
  
  try {
    // Check if there are already records
    const existing = await db.select().from(paymentMethods);
    
    if (existing.length > 0) {
      console.log(`[Seed] Payment methods already exist (${existing.length} records)`);
      return;
    }
    
    // Insert WhatsApp method
    await db.insert(paymentMethods).values({
      name: "whatsapp",
      displayName: "WhatsApp",
      enabled: 1,
      config: JSON.stringify({
        phone: "+593999999999",
        message_template: "Hola, me interesa comprar: {{products}}"
      })
    });
    
    // Insert Hoodpay method
    await db.insert(paymentMethods).values({
      name: "hoodpay",
      displayName: "Hoodpay (Crypto)",
      enabled: 0,
      config: JSON.stringify({
        business_id: "",
        api_key: "",
        webhook_secret: "",
        currency: "USD",
        test_mode: true
      })
    });
    
    console.log("[Seed] ✅ Default payment methods inserted successfully");
  } catch (error) {
    console.error("[Seed] ❌ Error inserting payment methods:", error);
    throw error;
  }
}

seedPaymentMethods()
  .then(() => {
    console.log("[Seed] Completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Seed] Failed:", error);
    process.exit(1);
  });
