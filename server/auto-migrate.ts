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
      const errorCode = error.code || error.cause?.code;
      const errorNum = error.errno || error.cause?.errno;
      
      if (errorCode === 'ER_NO_SUCH_TABLE' || errorNum === 1146) {
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

  // ==================== RECHARGE REQUESTS TABLE ====================
  try {
    const db = await getDb();
    if (!db) return;
    await db.execute(sql`SELECT 1 FROM recharge_requests LIMIT 1`);
    console.log("[Auto-Migration] recharge_requests table exists");

    // Migrate voucherImageUrl from TEXT to MEDIUMTEXT to support base64 images
    try {
      await db.execute(sql`
        ALTER TABLE recharge_requests
        MODIFY COLUMN voucherImageUrl MEDIUMTEXT NOT NULL
      `);
      console.log("[Auto-Migration] voucherImageUrl migrated to MEDIUMTEXT");
    } catch (alterErr: any) {
      // Ignore if already MEDIUMTEXT or error is not critical
      console.log("[Auto-Migration] voucherImageUrl alter skipped:", alterErr?.message || alterErr);
    }
  } catch (error: any) {
    const errorCode = error.code || error.cause?.code;
    const errorNum = error.errno || error.cause?.errno;
    if (errorCode === 'ER_NO_SUCH_TABLE' || errorNum === 1146) {
      console.log("[Auto-Migration] Creating recharge_requests table...");
      const db = await getDb();
      if (!db) return;
      await db.execute(sql`
        CREATE TABLE recharge_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customerId INT NOT NULL,
          customerEmail VARCHAR(320) NOT NULL,
          customerName VARCHAR(200),
          declaredAmount INT NOT NULL,
          voucherImageUrl MEDIUMTEXT NOT NULL,
          paymentMethod VARCHAR(50),
          aiVerified INT DEFAULT 0 NOT NULL,
          aiExtractedAmount INT,
          aiTransactionId VARCHAR(200),
          aiConfidence VARCHAR(20),
          aiNotes TEXT,
          status ENUM('pending','approved','rejected') DEFAULT 'pending' NOT NULL,
          adminNotes TEXT,
          processedAt TIMESTAMP NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      console.log("[Auto-Migration] recharge_requests table created!");
    } else {
      console.error("[Auto-Migration] recharge_requests error:", error);
    }
  }
}
