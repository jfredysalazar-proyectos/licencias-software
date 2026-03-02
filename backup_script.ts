import * as db from "./server/db";
import fs from "fs";

async function runBackup() {
  try {
    const products = await db.getAllProducts();
    const licensesData = await db.getAllSoldLicenses(1, 10000);
    
    fs.writeFileSync("/home/ubuntu/backup_products.json", JSON.stringify(products, null, 2));
    fs.writeFileSync("/home/ubuntu/backup_licenses.json", JSON.stringify(licensesData.items, null, 2));
    
    console.log("Backup completado exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error en el backup:", error);
    process.exit(1);
  }
}

runBackup();
