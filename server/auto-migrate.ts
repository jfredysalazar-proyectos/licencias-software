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
          name VARCHAR(50) NOT NULL UNIQUE,
          displayName VARCHAR(100) NOT NULL,
          description TEXT,
          enabled INT DEFAULT 0 NOT NULL,
          config TEXT,
          sortOrder INT DEFAULT 0 NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      console.log("[Auto-Migration] Inserting default payment methods...");
      
      // Insertar métodos por defecto
      await db.execute(sql`
        INSERT INTO payment_methods (name, displayName, description, enabled, config, sortOrder) VALUES
        ('whatsapp', 'WhatsApp', 'Contacta por WhatsApp para completar tu compra', 1, '{"phone": ""}', 1),
        ('hoodpay', 'Hoodpay (Crypto)', 'Paga con criptomonedas de forma segura', 0, '{"apiKey": "", "webhookSecret": ""}', 2)
      `);
      
      console.log("[Auto-Migration] payment_methods table created successfully!");
    } else {
      console.log("[Auto-Migration] payment_methods table already exists");
      
      // Verificar y agregar columnas faltantes si es necesario
      try {
        // Verificar si existe la columna description
        const [descColumn] = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() 
          AND table_name = 'payment_methods'
          AND column_name = 'description'
        `);
        
        if ((descColumn as any).count === 0) {
          console.log("[Auto-Migration] Adding description column...");
          await db.execute(sql`
            ALTER TABLE payment_methods 
            ADD COLUMN description TEXT AFTER displayName
          `);
        }
        
        // Verificar si existe la columna sortOrder
        const [sortColumn] = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() 
          AND table_name = 'payment_methods'
          AND column_name = 'sortOrder'
        `);
        
        if ((sortColumn as any).count === 0) {
          console.log("[Auto-Migration] Adding sortOrder column...");
          await db.execute(sql`
            ALTER TABLE payment_methods 
            ADD COLUMN sortOrder INT DEFAULT 0 NOT NULL AFTER config
          `);
        }
        
        console.log("[Auto-Migration] Table structure verified");
      } catch (error) {
        console.error("[Auto-Migration] Error updating table structure:", error);
      }
    }
  } catch (error) {
    console.error("[Auto-Migration] Error:", error);
    // No lanzar el error para que el servidor pueda iniciar
  }
}
