import mysql from 'mysql2/promise';

async function fixDatabaseStructure() {
  console.log('🔧 SCRIPT DE REPARACIÓN DE BASE DE DATOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔌 Conectando a MySQL...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    console.log('✅ Conexión establecida');
    console.log('');
    
    // PASO 1: Verificar estructura actual de la tabla products
    console.log('📋 PASO 1: Verificando estructura de la tabla products...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products'
      ORDER BY ORDINAL_POSITION
    `) as any;
    
    console.log(`   Encontradas ${columns.length} columnas en la tabla products`);
    console.log('');
    
    // Verificar si platforms existe
    const platformsExists = columns.some((col: any) => col.COLUMN_NAME === 'platforms');
    
    // PASO 2: Agregar columna platforms si no existe
    if (!platformsExists) {
      console.log('📦 PASO 2: La columna platforms NO EXISTE. Agregándola...');
      await connection.execute(`
        ALTER TABLE products 
        ADD COLUMN platforms JSON NULL
      `);
      console.log('   ✅ Columna platforms agregada exitosamente');
    } else {
      console.log('✅ PASO 2: La columna platforms ya existe. Continuando...');
    }
    console.log('');
    
    // PASO 3: Modificar columnas para eliminar DEFAULT constraints
    console.log('🔧 PASO 3: Eliminando DEFAULT constraints de las columnas...');
    console.log('');
    
    // 3.1: features
    console.log('   3.1 - Modificando columna features...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN features TEXT NULL
    `);
    console.log('       ✅ features modificada');
    
    // 3.2: platforms
    console.log('   3.2 - Modificando columna platforms...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN platforms JSON NULL
    `);
    console.log('       ✅ platforms modificada');
    
    // 3.3: featured
    console.log('   3.3 - Modificando columna featured...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN featured TINYINT NOT NULL
    `);
    console.log('       ✅ featured modificada');
    
    // 3.4: inStock
    console.log('   3.4 - Modificando columna inStock...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN inStock TINYINT NOT NULL
    `);
    console.log('       ✅ inStock modificada');
    
    // 3.5: createdAt
    console.log('   3.5 - Modificando columna createdAt...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN createdAt TIMESTAMP NOT NULL
    `);
    console.log('       ✅ createdAt modificada');
    
    // 3.6: updatedAt
    console.log('   3.6 - Modificando columna updatedAt...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN updatedAt TIMESTAMP NOT NULL
    `);
    console.log('       ✅ updatedAt modificada');
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ¡REPARACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Todos los DEFAULT constraints han sido eliminados');
    console.log('✅ La columna platforms está disponible');
    console.log('✅ Ahora puedes crear productos sin errores');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR AL REPARAR LA BASE DE DATOS');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error(error);
    console.error('');
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Conexión cerrada');
    console.log('');
  }
}

fixDatabaseStructure()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló');
    process.exit(1);
  });
