import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runAutoMigrations } from "../auto-migrate";
import { generateSitemap } from "../sitemap";
import { initSoldLicensesTable } from "../init-sold-licenses-table";
import mysql from "mysql2/promise";

async function syncDbColumns() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[Database] No DATABASE_URL found, skipping column sync.");
    return;
  }

  console.log("[Database] Starting robust column synchronization...");
  let connection;
  try {
    connection = await mysql.createConnection(url);
    
    const columnsToAdd = [
      { table: 'customers', column: 'role', definition: "enum('customer','reseller') DEFAULT 'customer' NOT NULL" },
      { table: 'customers', column: 'balance', definition: "int DEFAULT 0 NOT NULL" },
      { table: 'products', column: 'resellerPrice', definition: "int DEFAULT NULL" }
    ];

    for (const item of columnsToAdd) {
      try {
        // Enfoque robusto: Primero verificamos si la columna existe consultando information_schema
        const [rows]: any = await connection.query(
          `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
           WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()`,
          [item.table, item.column]
        );

        if (rows.length === 0) {
          console.log(`[Database] Column '${item.column}' missing in '${item.table}'. Adding it...`);
          await connection.query(`ALTER TABLE \`${item.table}\` ADD COLUMN \`${item.column}\` ${item.definition}`);
          console.log(`[Database] Column '${item.column}' added successfully.`);
        } else {
          console.log(`[Database] Column '${item.column}' already exists in '${item.table}'.`);
        }
      } catch (err: any) {
        console.error(`[Database] Error processing column '${item.column}' in '${item.table}':`, err.message);
      }
    }
    console.log("[Database] Robust column sync completed.");
  } catch (error: any) {
    console.error("[Database] Column sync failed to connect or execute:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Sync missing columns before anything else
  await syncDbColumns();
  
  // Run auto-migrations
  await runAutoMigrations();
  
  // Initialize sold_licenses table
  await initSoldLicensesTable();
  
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Sitemap endpoint
  app.get("/sitemap.xml", generateSitemap);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
