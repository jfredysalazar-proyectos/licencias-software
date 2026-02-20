import { sql } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Inicializa la tabla sold_licenses si no existe
 * Este script se ejecuta al iniciar la aplicación
 */
export async function initSoldLicensesTable() {
  try {
    const db = await getDb();

    console.log("[initSoldLicensesTable] Verificando si la tabla sold_licenses existe...");

    // Intentar consultar la tabla
    try {
      const result = await db.execute(sql`SELECT COUNT(*) FROM sold_licenses LIMIT 1`);
      console.log("[initSoldLicensesTable] ✓ La tabla sold_licenses ya existe");
      return;
    } catch (error: any) {
      if (error.message && error.message.includes("doesn't exist")) {
        console.log("[initSoldLicensesTable] La tabla sold_licenses no existe, creándola...");
      } else {
        throw error;
      }
    }

    // Crear la tabla si no existe
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`sold_licenses\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`customerName\` varchar(200) NOT NULL,
        \`customerEmail\` varchar(320) NOT NULL,
        \`customerWhatsapp\` varchar(50) NOT NULL,
        \`productId\` int NOT NULL,
        \`productName\` varchar(200) NOT NULL,
        \`licenseCode\` varchar(500) NOT NULL,
        \`expirationDate\` date NOT NULL,
        \`notes\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    console.log("[initSoldLicensesTable] Ejecutando SQL para crear tabla...");
    await db.execute(sql.raw(createTableSQL));
    console.log("[initSoldLicensesTable] ✓ Tabla sold_licenses creada exitosamente");

  } catch (error: any) {
    console.error("[initSoldLicensesTable] Error al inicializar tabla:", error.message);
    console.error(error);
    // No lanzar el error para que la aplicación siga funcionando
  }
}
