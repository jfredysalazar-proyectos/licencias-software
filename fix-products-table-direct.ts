import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

async function fixProductsTable() {
  console.log('🔧 Conectando a la base de datos...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    console.log('✅ Conexión establecida');
    console.log('');
    console.log('📋 Ejecutando comandos SQL para arreglar la tabla products...');
    console.log('');
    
    // Comando 1: Modificar columna features para eliminar DEFAULT
    console.log('1️⃣ Modificando columna features...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN features TEXT NULL
    `);
    console.log('   ✅ Columna features modificada');
    
    // Comando 2: Modificar columna platforms para eliminar DEFAULT
    console.log('2️⃣ Modificando columna platforms...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN platforms JSON NULL
    `);
    console.log('   ✅ Columna platforms modificada');
    
    // Comando 3: Modificar columna featured para eliminar DEFAULT
    console.log('3️⃣ Modificando columna featured...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN featured TINYINT NOT NULL
    `);
    console.log('   ✅ Columna featured modificada');
    
    // Comando 4: Modificar columna inStock para eliminar DEFAULT
    console.log('4️⃣ Modificando columna inStock...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN inStock TINYINT NOT NULL
    `);
    console.log('   ✅ Columna inStock modificada');
    
    // Comando 5: Modificar columna createdAt para eliminar DEFAULT
    console.log('5️⃣ Modificando columna createdAt...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN createdAt TIMESTAMP NOT NULL
    `);
    console.log('   ✅ Columna createdAt modificada');
    
    // Comando 6: Modificar columna updatedAt para eliminar DEFAULT
    console.log('6️⃣ Modificando columna updatedAt...');
    await connection.execute(`
      ALTER TABLE products 
      MODIFY COLUMN updatedAt TIMESTAMP NOT NULL
    `);
    console.log('   ✅ Columna updatedAt modificada');
    
    console.log('');
    console.log('🎉 ¡Tabla products arreglada exitosamente!');
    console.log('');
    console.log('✅ Todos los DEFAULT constraints han sido eliminados');
    console.log('✅ Ahora puedes crear productos sin errores');
    
  } catch (error) {
    console.error('❌ Error al ejecutar comandos SQL:');
    console.error(error);
    throw error;
  } finally {
    await connection.end();
    console.log('');
    console.log('🔌 Conexión cerrada');
  }
}

fixProductsTable()
  .then(() => {
    console.log('');
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Script falló con error:');
    console.error(error);
    process.exit(1);
  });
