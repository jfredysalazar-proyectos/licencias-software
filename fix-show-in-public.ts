/**
 * Migration script: add showInPublic column to products table
 * Safe to run multiple times (checks if column exists first)
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[fix-show-in-public] No DATABASE_URL, skipping.");
    return;
  }

  const connection = await mysql.createConnection(url);

  try {
    // Check if column already exists
    const [rows] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'products'
         AND COLUMN_NAME = 'showInPublic'`
    ) as any;

    if ((rows as any[]).length > 0) {
      console.log("[fix-show-in-public] Column 'showInPublic' already exists, skipping.");
    } else {
      await connection.execute(
        `ALTER TABLE products ADD COLUMN showInPublic INT NOT NULL DEFAULT 1`
      );
      console.log("[fix-show-in-public] Column 'showInPublic' added successfully (default 1 = visible in public store).");
    }
  } catch (err) {
    console.error("[fix-show-in-public] Error:", err);
    // Do NOT exit with error code so the build doesn't fail
  } finally {
    await connection.end();
  }
}

main();
