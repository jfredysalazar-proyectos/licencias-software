import mysql from "mysql2/promise";

/**
 * Script para garantizar que la columna `orderType` existe en la tabla `products`.
 * - Si la columna no existe, la agrega con valor por defecto 'instant'.
 * - Nunca falla con exit code 1 para no bloquear el build.
 */
async function fixOrderType() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[fix-order-type] No DATABASE_URL, skipping.");
    process.exit(0);
  }

  console.log("[fix-order-type] Connecting to database...");
  const connection = await mysql.createConnection(url);

  try {
    // Verificar si la columna orderType existe en products
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'orderType'`
    );

    const columnExists = (columns as any[]).length > 0;

    if (!columnExists) {
      console.log("[fix-order-type] Column 'orderType' not found in 'products'. Adding it...");
      await connection.query(
        `ALTER TABLE \`products\` ADD COLUMN \`orderType\` varchar(20) NOT NULL DEFAULT 'instant' AFTER \`inStock\``
      );
      console.log("[fix-order-type] ✅ Column 'orderType' added successfully.");
    } else {
      console.log("[fix-order-type] ℹ Column 'orderType' already exists. Nothing to do.");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("[fix-order-type] Error:", error.message);
    // Exit 0 para no bloquear el build
    process.exit(0);
  } finally {
    await connection.end();
  }
}

fixOrderType();
