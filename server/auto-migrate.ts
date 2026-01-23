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
    
    // Verificar si la tabla existe con una query más simple
    try {
      await db.execute(sql`SELECT 1 FROM payment_methods LIMIT 1`);
      console.log("[Auto-Migration] payment_methods table exists");
      
      // Si llegamos aquí, la tabla existe. Verificar si tiene datos
      const [countResult] = await db.execute(sql`
        SELECT COUNT(*) as count FROM payment_methods
      `);
      
      const count = (countResult as any)?.count || 0;
      
      if (count === 0) {
        console.log("[Auto-Migration] Table is empty, inserting default payment methods...");
        await db.execute(sql`
          INSERT INTO payment_methods (name, displayName, enabled, config) VALUES
          ('whatsapp', 'WhatsApp', 1, '{"phone": ""}'),
          ('hoodpay', 'Hoodpay (Crypto)', 0, '{"apiKey": "", "webhookSecret": ""}')
        `);
        console.log("[Auto-Migration] Default payment methods inserted!");
      } else {
        console.log(`[Auto-Migration] Table has ${count} records, skipping seed`);
      }
    } catch (error: any) {
      // Si la tabla no existe, la query fallará
      if (error.code === 'ER_NO_SUCH_TABLE' || error.errno === 1146) {
        console.log("[Auto-Migration] Table doesn't exist, creating it...");
        
        // Crear tabla
        await db.execute(sql`
          CREATE TABLE payment_methods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            displayName VARCHAR(100) NOT NULL,
            enabled INT DEFAULT 0 NOT NULL,
            config TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
          )
        `);
        
        console.log("[Auto-Migration] Table created, inserting default payment methods...");
        
        // Insertar métodos por defecto
        await db.execute(sql`
          INSERT INTO payment_methods (name, displayName, enabled, config) VALUES
          ('whatsapp', 'WhatsApp', 1, '{"phone": ""}'),
          ('hoodpay', 'Hoodpay (Crypto)', 0, '{"apiKey": "", "webhookSecret": ""}')
        `);
        
        console.log("[Auto-Migration] payment_methods table created and seeded successfully!");
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("[Auto-Migration] Error:", error);
    // No lanzar el error para que el servidor pueda iniciar
  }
}
