import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function runMigration() {
  const db = drizzle(DATABASE_URL);

  console.log("=== EJECUTANDO MIGRACIÓN PARA sold_licenses ===\n");

  try {
    // Leer el archivo SQL de migración
    const migrationPath = path.join(__dirname, "drizzle", "0008_create_sold_licenses_table.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("SQL a ejecutar:");
    console.log(migrationSQL);
    console.log("\n");

    // Ejecutar cada sentencia SQL
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (const statement of statements) {
      console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
      try {
        await db.execute(sql.raw(statement));
        console.log("✓ Éxito\n");
      } catch (error: any) {
        console.error("✗ Error:", error.message, "\n");
      }
    }

    // Verificar la estructura de la tabla
    console.log("Estructura de la tabla sold_licenses:");
    const structure = await db.execute(sql`DESCRIBE sold_licenses`);
    console.log(structure);

  } catch (error: any) {
    console.error("Error durante migración:", error.message);
    console.error(error);
  }

  process.exit(0);
}

runMigration();
