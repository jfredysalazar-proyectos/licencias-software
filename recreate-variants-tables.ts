import mysql from 'mysql2/promise';

async function recreateVariantsTables() {
  console.log('🔧 Recreando tablas de variantes con esquema correcto...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // Drop existing tables (in correct order due to foreign key constraints)
    console.log('🗑️  Eliminando tablas existentes...');
    await connection.query('DROP TABLE IF EXISTS `variant_options`');
    await connection.query('DROP TABLE IF EXISTS `product_skus`');
    await connection.query('DROP TABLE IF EXISTS `product_variants`');
    console.log('✅ Tablas eliminadas');
    
    // Create tables with correct schema
    console.log('📦 Creando tablas con esquema correcto...');
    
    await connection.query(`
      CREATE TABLE \`product_variants\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`productId\` int NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`position\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla product_variants creada');
    
    await connection.query(`
      CREATE TABLE \`variant_options\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`variantId\` int NOT NULL,
        \`value\` varchar(100) NOT NULL,
        \`position\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla variant_options creada');
    
    await connection.query(`
      CREATE TABLE \`product_skus\` (
        \`id\` int AUTO_INCREMENT PRIMARY KEY,
        \`productId\` int NOT NULL,
        \`sku\` varchar(100) NOT NULL UNIQUE,
        \`variantCombination\` text NOT NULL,
        \`price\` int NOT NULL,
        \`inStock\` int NOT NULL DEFAULT 1,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla product_skus creada');
    
    // Verify tables exist
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('product_variants', 'variant_options', 'product_skus')
    `);
    
    console.log('📋 Tablas verificadas:', tables);
    console.log('✅ Tablas de variantes recreadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error recreando tablas:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

recreateVariantsTables().catch(console.error);
