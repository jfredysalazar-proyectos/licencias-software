import { sql } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Inicializa la tabla sold_licenses si no existe.
 * Este script se ejecuta al iniciar la aplicación como respaldo
 * en caso de que las migraciones de Drizzle no hayan creado la tabla.
 */
export async function initSoldLicensesTable() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[initSoldLicensesTable] Base de datos no disponible, omitiendo inicialización");
      return;
    }

    console.log("[initSoldLicensesTable] Verificando si la tabla sold_licenses existe...");

    // Intentar consultar la tabla
    try {
      await db.execute(sql`SELECT COUNT(*) FROM \`sold_licenses\` LIMIT 1`);
      console.log("[initSoldLicensesTable] ✓ La tabla sold_licenses ya existe");
      return;
    } catch (error: any) {
      // El error puede venir envuelto en DrizzleQueryError, verificar tanto el mensaje
      // directo como el de la causa (error original de MySQL)
      const errorMessage = error.message || "";
      const causeMessage = error.cause?.message || error.cause?.sqlMessage || "";
      const fullMessage = errorMessage + " " + causeMessage;

      const isTableNotFound =
        fullMessage.includes("doesn't exist") ||
        fullMessage.includes("ER_NO_SUCH_TABLE") ||
        error.code === "ER_NO_SUCH_TABLE" ||
        error.cause?.code === "ER_NO_SUCH_TABLE" ||
        error.errno === 1146 ||
        error.cause?.errno === 1146;

      if (isTableNotFound) {
        console.log("[initSoldLicensesTable] La tabla sold_licenses no existe, creándola...");
      } else {
        console.error("[initSoldLicensesTable] Error inesperado al verificar tabla:", fullMessage);
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
