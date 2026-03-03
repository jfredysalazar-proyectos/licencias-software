/**
 * fix-orders-columns.ts
 * Agrega las columnas customerId y expiresAt a la tabla orders si no existen.
 * Se ejecuta durante el build de Railway antes de iniciar el servidor.
 */
import mysql from "mysql2/promise";

async function fixOrdersColumns() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[fix-orders] DATABASE_URL no definida, omitiendo.");
    process.exit(0);
  }

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(url);
    console.log("[fix-orders] Conectado a la base de datos.");

    // Verificar columnas existentes en la tabla orders
    const [cols] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'`
    ) as any[];

    const existingCols = cols.map((c: any) => c.COLUMN_NAME);
    console.log("[fix-orders] Columnas actuales en orders:", existingCols.join(", "));

    // Agregar customerId si no existe
    if (!existingCols.includes("customerId")) {
      await connection.execute(
        `ALTER TABLE \`orders\` ADD COLUMN \`customerId\` int NULL AFTER \`id\``
      );
      console.log("[fix-orders] ✅ Columna customerId agregada a orders.");
    } else {
      console.log("[fix-orders] ✓ customerId ya existe en orders.");
    }

    // Agregar expiresAt si no existe
    if (!existingCols.includes("expiresAt")) {
      await connection.execute(
        `ALTER TABLE \`orders\` ADD COLUMN \`expiresAt\` timestamp NULL AFTER \`status\``
      );
      console.log("[fix-orders] ✅ Columna expiresAt agregada a orders.");
    } else {
      console.log("[fix-orders] ✓ expiresAt ya existe en orders.");
    }

    console.log("[fix-orders] Completado exitosamente.");
  } catch (err: any) {
    console.error("[fix-orders] Error (no crítico):", err.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

fixOrdersColumns();
