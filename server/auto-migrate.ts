import { getDb } from "./db";
import { sql } from "drizzle-orm";

export async function runAutoMigrations() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Auto-Migration] Database not available, skipping migrations");
      return;
    }
    
    console.log("[Auto-Migration] Checking payment_methods table...");
    
    // Verificar si la tabla existe
    const [tableExists] = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'payment_methods'
    `);
    
    if ((tableExists as any).count === 0) {
      console.log("[Auto-Migration] Creating payment_methods table...");
      
      // Crear tabla
      await db.execute(sql`
        CREATE TABLE payment_methods (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          display_name VARCHAR(255) NOT NULL,
          enabled BOOLEAN DEFAULT false,
          config JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log("[Auto-Migration] Inserting default payment methods...");
      
      // Insertar métodos por defecto
      await db.execute(sql`
        INSERT INTO payment_methods (name, display_name, enabled, config) VALUES
        ('whatsapp', 'WhatsApp', true, '{"phone": ""}'),
        ('hoodpay', 'Hoodpay (Crypto)', false, '{"apiKey": "", "webhookSecret": ""}')
      `);
      
      console.log("[Auto-Migration] payment_methods table created successfully!");
    } else {
      console.log("[Auto-Migration] payment_methods table already exists");
    }
  } catch (error) {
    console.error("[Auto-Migration] Error:", error);
    // No lanzar el error para que el servidor pueda iniciar
  }
}
