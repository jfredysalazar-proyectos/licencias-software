import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as schema from "./drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function diagnose() {
  const db = drizzle(DATABASE_URL);

  console.log("=== DIAGNÓSTICO DE TABLA sold_licenses ===\n");

  try {
    // 1. Verificar la estructura de la tabla
    console.log("1. Estructura de la tabla sold_licenses:");
    const tableStructure = await db.execute(
      sql`DESCRIBE sold_licenses`
    );
    console.log(tableStructure);
    console.log("\n");

    // 2. Intentar una inserción simple con valores mínimos
    console.log("2. Intentando inserción con valores mínimos:");
    try {
      const result = await db.insert(schema.soldLicenses).values({
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerWhatsapp: "+1234567890",
        productId: 1,
        productName: "Test Product",
        licenseCode: "TEST-CODE-001",
        expirationDate: "2027-12-31",
        notes: "Test note",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✓ Inserción exitosa:", result);
    } catch (error: any) {
      console.error("✗ Error en inserción:", error.message);
    }
    console.log("\n");

    // 3. Verificar registros existentes
    console.log("3. Registros existentes en sold_licenses:");
    const records = await db.select().from(schema.soldLicenses).limit(5);
    console.log(`Total de registros: ${records.length}`);
    if (records.length > 0) {
      console.log("Primer registro:", records[0]);
    }
    console.log("\n");

    // 4. Verificar restricciones de la tabla
    console.log("4. Restricciones y índices:");
    const constraints = await db.execute(
      sql`SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'sold_licenses' AND TABLE_SCHEMA = DATABASE()`
    );
    console.log(constraints);

  } catch (error: any) {
    console.error("Error durante diagnóstico:", error.message);
    console.error(error);
  }

  process.exit(0);
}

diagnose();
