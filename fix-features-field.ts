import mysql from 'mysql2/promise';

async function fixFeaturesField() {
  console.log('🔧 Corrección del campo features...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // Obtener el producto afectado
    const [rows]: any = await connection.execute(
      'SELECT id, name, slug, features FROM products WHERE slug = ?',
      ['windows-11-professional-retail']
    );
    
    if (rows.length === 0) {
      console.log('❌ Producto no encontrado');
      process.exit(1);
    }
    
    const product = rows[0];
    console.log('✅ Producto encontrado:', product.name);
    console.log('📊 Valor actual de features:', product.features);
    console.log('📊 Tipo de features:', typeof product.features);
    console.log('📊 Longitud:', product.features?.length);
    
    // Limpiar el campo features (establecerlo como NULL)
    await connection.execute(
      'UPDATE products SET features = NULL WHERE id = ?',
      [product.id]
    );
    
    console.log('✅ Campo features limpiado (establecido a NULL)');
    
    // Verificar
    const [updated]: any = await connection.execute(
      'SELECT id, name, features FROM products WHERE id = ?',
      [product.id]
    );
    
    console.log('📊 Nuevo valor de features:', updated[0].features);
    console.log('');
    console.log('🎉 Corrección completada exitosamente');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixFeaturesField();
