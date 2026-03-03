import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function sync() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL no definida");
    return;
  }

  console.log("Conectando a la base de datos para sincronizar columnas...");
  const connection = await mysql.createConnection(url);
  
  try {
    // Intentar añadir las columnas si no existen
    console.log("Verificando columnas en tabla 'customers'...");
    
    const queries = [
      "ALTER TABLE `customers` ADD COLUMN IF NOT EXISTS `role` enum('customer','reseller') DEFAULT 'customer' NOT NULL",
      "ALTER TABLE `customers` ADD COLUMN IF NOT EXISTS `balance` int DEFAULT 0 NOT NULL",
      "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `resellerPrice` int DEFAULT NULL"
    ];

    for (const query of queries) {
      try {
        await connection.query(query);
        console.log(`Ejecutada con éxito: ${query}`);
      } catch (err: any) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
          console.log(`La columna ya existe, saltando...`);
        } else {
          console.error(`Error ejecutando query: ${query}`, err.message);
        }
      }
    }

    console.log("Sincronización completada.");
  } finally {
    await connection.end();
  }
}

sync().catch(console.error);
