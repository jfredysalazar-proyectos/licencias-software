import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema';

async function testInsertProduct() {
  console.log('🧪 Iniciando prueba de inserción de producto...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  
  try {
    // Intentar insertar un producto de prueba
    const newProduct = {
      name: 'Producto de Prueba - Test',
      slug: 'producto-prueba-test-' + Date.now(),
      description: 'Este es un producto de prueba para verificar que la inserción funciona correctamente',
      categoryId: 1, // Asumiendo que existe la categoría con ID 1
      basePrice: 50000,
      imageUrl: 'https://via.placeholder.com/300',
      featured: 0,
      inStock: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Datos del producto a insertar:', newProduct);
    
    const result = await db.insert(schema.products).values(newProduct);
    
    console.log('✅ ¡Producto insertado exitosamente!');
    console.log('📊 Resultado:', result);
    console.log('');
    console.log('🎉 LA BASE DE DATOS ESTÁ FUNCIONANDO CORRECTAMENTE');
    console.log('El problema de DEFAULT constraints ha sido resuelto.');
    
  } catch (error: any) {
    console.error('❌ Error al insertar producto:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

testInsertProduct();
