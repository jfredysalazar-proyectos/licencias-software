import { createConnection } from "mysql2/promise";

async function runMigration() {
  console.log("🔄 Ejecutando migración de payment_methods...");

  const connection = await createConnection(process.env.DATABASE_URL!);

  try {
    // Crear tabla payment_methods
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Identificador interno (whatsapp, hoodpay)',
        displayName VARCHAR(100) NOT NULL COMMENT 'Nombre para mostrar al cliente',
        description TEXT COMMENT 'Descripción del método de pago',
        enabled TINYINT(1) DEFAULT 0 COMMENT 'Si está habilitado para los clientes',
        config TEXT COMMENT 'Configuración específica del método (JSON)',
        sortOrder INT DEFAULT 0 COMMENT 'Orden de visualización',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_enabled (enabled),
        INDEX idx_sort_order (sortOrder)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Tabla payment_methods creada");

    // Verificar si ya existen registros
    const [existing] = await connection.execute(
      "SELECT COUNT(*) as count FROM payment_methods"
    );
    const count = (existing as any)[0].count;

    if (count === 0) {
      // Insertar métodos de pago por defecto
      await connection.execute(`
        INSERT INTO payment_methods (name, displayName, description, enabled, config, sortOrder) VALUES
        (
          'whatsapp',
          'Comprar por WhatsApp',
          'Contacta con nosotros por WhatsApp para completar tu compra',
          1,
          '{"phone":"+573001234567","message_template":"Hola, estoy interesado en comprar las siguientes licencias:"}',
          1
        ),
        (
          'hoodpay',
          'Pago con Criptomonedas',
          'Paga de forma segura con Bitcoin, Ethereum y otras criptomonedas',
          0,
          '{"business_id":"","api_key":"","webhook_secret":"","currency":"USD","test_mode":false}',
          2
        )
      `);
      console.log("✅ Métodos de pago por defecto insertados");
    } else {
      console.log("ℹ️  Ya existen métodos de pago, omitiendo inserción");
    }

    console.log("✅ Migración completada exitosamente");
  } catch (error) {
    console.error("❌ Error en migración:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch((error) => {
  console.error("❌ Migración falló:", error);
  process.exit(1);
});
