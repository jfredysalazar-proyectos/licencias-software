import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { admins } from "./drizzle/schema";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin2026!";
const ADMIN_EMAIL = "admin@licencias-software.com";
const ADMIN_NAME = "Administrador";

async function runMigrationsAndSetup() {
  try {
    console.log("🔌 Conectando a la base de datos...");
    
    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error("DATABASE_URL no está configurada en las variables de entorno");
    }

    // Create Drizzle instance
    const db = drizzle(databaseUrl);
    console.log("✅ Conexión establecida");

    // Run migrations
    console.log("\n📦 Ejecutando migraciones...");
    const migrationsFolder = path.join(__dirname, "drizzle");
    console.log(`Carpeta de migraciones: ${migrationsFolder}`);
    
    try {
      await migrate(db, { migrationsFolder });
      console.log("✅ Migraciones ejecutadas exitosamente");
    } catch (error: any) {
      if (error.message?.includes("already exists") || error.message?.includes("Duplicate")) {
        console.log("⚠️  Las tablas ya existen, continuando...");
      } else {
        throw error;
      }
    }

    // Check if admin already exists
    console.log("\n🔍 Verificando si el usuario administrador ya existe...");
    const existingAdmins = await db
      .select()
      .from(admins)
      .where(eq(admins.username, ADMIN_USERNAME))
      .limit(1);

    if (existingAdmins.length > 0) {
      console.log("⚠️  El usuario 'admin' ya existe. Actualizando contraseña...");
      
      // Hash password
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      await db
        .update(admins)
        .set({
          passwordHash,
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          active: 1,
          lastLogin: null,
        })
        .where(eq(admins.username, ADMIN_USERNAME));
      
      console.log("✅ Contraseña actualizada exitosamente");
    } else {
      console.log("➕ Creando nuevo usuario administrador...");
      
      // Hash password
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      await db.insert(admins).values({
        username: ADMIN_USERNAME,
        passwordHash,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        active: 1,
      });
      
      console.log("✅ Usuario administrador creado exitosamente");
    }

    // Get the admin info
    const adminResult = await db
      .select({
        id: admins.id,
        username: admins.username,
        email: admins.email,
        name: admins.name,
        active: admins.active,
        createdAt: admins.createdAt,
      })
      .from(admins)
      .where(eq(admins.username, ADMIN_USERNAME))
      .limit(1);

    console.log("\n🎉 ¡ÉXITO! Usuario administrador configurado:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 Usuario:", ADMIN_USERNAME);
    console.log("🔑 Contraseña:", ADMIN_PASSWORD);
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("🔗 URL de login: https://licencias-software-production.up.railway.app/admin/login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📝 Detalles del registro:");
    console.log(JSON.stringify(adminResult[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  }
}

runMigrationsAndSetup();
