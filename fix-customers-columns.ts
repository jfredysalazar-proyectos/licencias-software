import mysql from "mysql2/promise";

/**
 * Script para garantizar que la tabla customers existe con todas las columnas correctas.
 * - Si la tabla no existe, la crea completa.
 * - Si la tabla existe pero le faltan columnas (role, balance), las agrega.
 * - Nunca falla con exit code 1 por errores no críticos.
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
    // Verificar si la tabla customers existe
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers'`
    );

    const tableExists = (tables as any[]).length > 0;

    if (!tableExists) {
      console.log("[fix-customers] Table 'customers' does not exist. Creating it...");
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`customers\` (
          \`id\` int AUTO_INCREMENT PRIMARY KEY,
          \`email\` varchar(320) NOT NULL UNIQUE,
          \`passwordHash\` varchar(255) NOT NULL,
          \`name\` varchar(200),
          \`phone\` varchar(50),
          \`active\` int NOT NULL DEFAULT 1,
          \`role\` enum('customer','reseller') NOT NULL DEFAULT 'customer',
          \`balance\` int NOT NULL DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`lastLogin\` timestamp NULL
        )
      `);
      console.log("[fix-customers] ✅ Table 'customers' created successfully.");
      process.exit(0);
    }

    // La tabla existe — verificar columnas
    console.log("[fix-customers] Table exists. Checking columns...");
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
    console.error("[fix-customers] Fatal error:", error.message);
    // Exit 0 para no bloquear el build — el servidor tiene syncDbColumns como fallback
    process.exit(0);
  } finally {
    await connection.end();
  }
}

fixCustomersColumns();
