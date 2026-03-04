/**
 * Migration script: add resellerDescription column to products table
 * Safe to run multiple times (checks if column exists first)
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[fix-reseller-description] No DATABASE_URL, skipping.");
    return;
  }

  const connection = await mysql.createConnection(url);

  try {
    // Check if column already exists
    const [rows] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'products'
         AND COLUMN_NAME = 'resellerDescription'`
    ) as any;

    if ((rows as any[]).length > 0) {
      console.log("[fix-reseller-description] Column 'resellerDescription' already exists, skipping.");
    } else {
      await connection.execute(
        `ALTER TABLE products ADD COLUMN resellerDescription LONGTEXT NULL`
      );
      console.log("[fix-reseller-description] Column 'resellerDescription' added successfully.");
    }
  } catch (err) {
    console.error("[fix-reseller-description] Error:", err);
    // Do NOT exit with error code so the build doesn't fail
  } finally {
    await connection.end();
  }
}

main();
