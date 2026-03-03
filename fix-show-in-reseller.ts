import mysql from "mysql2/promise";

/**
 * Script para garantizar que la columna `showInReseller` existe en la tabla `products`.
 * - Si la columna no existe, la agrega con valor por defecto 0 (no mostrar).
 * - Nunca falla con exit code 1 para no bloquear el build.
 */
async function fixShowInReseller() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[fix-show-in-reseller] No DATABASE_URL, skipping.");
    process.exit(0);
  }

  console.log("[fix-show-in-reseller] Connecting to database...");
  const connection = await mysql.createConnection(url);

  try {
    // Verificar si la columna showInReseller existe en products
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'showInReseller'`
    );

    const columnExists = (columns as any[]).length > 0;

    if (!columnExists) {
      console.log("[fix-show-in-reseller] Column 'showInReseller' not found in 'products'. Adding it...");
      await connection.query(
        `ALTER TABLE \`products\` ADD COLUMN \`showInReseller\` int NOT NULL DEFAULT 0 AFTER \`orderType\``
      );
      console.log("[fix-show-in-reseller] ✅ Column 'showInReseller' added successfully.");
    } else {
      console.log("[fix-show-in-reseller] ℹ Column 'showInReseller' already exists. Nothing to do.");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("[fix-show-in-reseller] Error:", error.message);
    // Exit 0 para no bloquear el build
    process.exit(0);
  } finally {
    await connection.end();
  }
}

fixShowInReseller();
