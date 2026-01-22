import { getDb } from "./db";
import { sql } from "drizzle-orm";

async function forceAddColumns() {
  try {
    console.log("[Force-Add-Columns] Starting...");
    
    const db = getDb();
    
    // Intentar agregar description
    try {
      await db.execute(sql`
        ALTER TABLE payment_methods 
        ADD COLUMN description TEXT AFTER displayName
      `);
      console.log("[Force-Add-Columns] ✅ Added description column");
    } catch (error: any) {
      if (error.message?.includes("Duplicate column")) {
        console.log("[Force-Add-Columns] description column already exists");
      } else {
        console.error("[Force-Add-Columns] Error adding description:", error.message);
      }
    }
    
    // Intentar agregar sortOrder
    try {
      await db.execute(sql`
        ALTER TABLE payment_methods 
        ADD COLUMN sortOrder INT DEFAULT 0 NOT NULL AFTER config
      `);
      console.log("[Force-Add-Columns] ✅ Added sortOrder column");
    } catch (error: any) {
      if (error.message?.includes("Duplicate column")) {
        console.log("[Force-Add-Columns] sortOrder column already exists");
      } else {
        console.error("[Force-Add-Columns] Error adding sortOrder:", error.message);
      }
    }
    
    // Actualizar registros existentes con valores por defecto si es necesario
    try {
      await db.execute(sql`
        UPDATE payment_methods 
        SET description = CASE 
          WHEN name = 'whatsapp' THEN 'Contacta por WhatsApp para completar tu compra'
          WHEN name = 'hoodpay' THEN 'Paga con criptomonedas de forma segura'
          ELSE description
        END,
        sortOrder = CASE 
          WHEN name = 'whatsapp' THEN 1
          WHEN name = 'hoodpay' THEN 2
          ELSE sortOrder
        END
        WHERE description IS NULL OR sortOrder = 0
      `);
      console.log("[Force-Add-Columns] ✅ Updated existing records");
    } catch (error: any) {
      console.error("[Force-Add-Columns] Error updating records:", error.message);
    }
    
    console.log("[Force-Add-Columns] ✅ Completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("[Force-Add-Columns] Fatal error:", error);
    process.exit(1);
  }
}

forceAddColumns();
