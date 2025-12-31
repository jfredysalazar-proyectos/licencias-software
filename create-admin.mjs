import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcryptjs";
import { admins, settings } from "./drizzle/schema.ts";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function createInitialAdmin() {
  try {
    // Create default admin user
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await db.insert(admins).values({
      username: "admin",
      passwordHash,
      email: "admin@licenciasdesoftware.org",
      name: "Administrador",
      active: 1,
    });

    console.log("✅ Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("⚠️  Please change the password after first login!");

    // Create default settings
    await db.insert(settings).values([
      {
        key: "whatsapp_number",
        value: "573001234567",
        description: "Número de WhatsApp para checkout",
      },
      {
        key: "site_name",
        value: "LicenciasdeSoftware.org",
        description: "Nombre del sitio web",
      },
      {
        key: "site_email",
        value: "contacto@licenciasdesoftware.org",
        description: "Email de contacto del sitio",
      },
    ]);

    console.log("✅ Default settings created successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createInitialAdmin();
