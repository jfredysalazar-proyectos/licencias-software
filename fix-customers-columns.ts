import mysql from "mysql2/promise";

/**
 * Script para agregar las columnas faltantes (role, balance) a la tabla customers.
 * Se ejecuta durante el build en Railway para corregir la desincronización entre
 * el schema de Drizzle y la tabla existente en la base de datos.
 */
async function fixCustomersColumns() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[fix-customers] No DATABASE_URL, skipping.");
    process.exit(0);
  }

  console.log("[fix-customers] Connecting to database...");
  const connection = await mysql.createConnection(url);

  try {
    console.log("[fix-customers] Checking customers table columns...");

    // Verificar qué columnas existen actualmente
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers'`
    );
    const existingCols = (columns as any[]).map((c) => c.COLUMN_NAME);
    console.log("[fix-customers] Existing columns:", existingCols.join(", "));

    // Agregar columna 'role' si no existe
    if (!existingCols.includes("role")) {
      console.log("[fix-customers] Adding 'role' column...");
      await connection.query(
        `ALTER TABLE \`customers\` ADD COLUMN \`role\` enum('customer','reseller') NOT NULL DEFAULT 'customer' AFTER \`active\``
      );
      console.log("[fix-customers] ✅ 'role' column added.");
    } else {
      console.log("[fix-customers] ℹ 'role' column already exists.");
    }

    // Agregar columna 'balance' si no existe
    if (!existingCols.includes("balance")) {
      console.log("[fix-customers] Adding 'balance' column...");
      await connection.query(
        `ALTER TABLE \`customers\` ADD COLUMN \`balance\` int NOT NULL DEFAULT 0 AFTER \`role\``
      );
      console.log("[fix-customers] ✅ 'balance' column added.");
    } else {
      console.log("[fix-customers] ℹ 'balance' column already exists.");
    }

    console.log("[fix-customers] ✅ Done.");
    process.exit(0);
  } catch (error: any) {
    console.error("[fix-customers] Error:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixCustomersColumns();
