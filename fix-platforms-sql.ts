import mysql from 'mysql2/promise';

async function fixPlatformsSQL() {
  console.log('🔧 Corrección SQL directa del campo platforms...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // Obtener el producto afectado
    const [rows]: any = await connection.execute(
      'SELECT id, name, slug, platforms FROM products WHERE slug = ?',
      ['windows-11-professional-retail']
    );
    
    if (rows.length === 0) {
      console.log('❌ Producto no encontrado');
      process.exit(1);
    }
    
    const product = rows[0];
    console.log('✅ Producto encontrado:', product.name);
    console.log('📊 Valor actual de platforms:', product.platforms);
    console.log('📊 Tipo de platforms:', typeof product.platforms);
    
    // Actualizar el campo platforms a JSON válido
    // Si es "windows", convertir a ["windows"]
    let newValue = '["windows"]';
    
    await connection.execute(
      'UPDATE products SET platforms = ? WHERE id = ?',
      [newValue, product.id]
    );
    
    console.log('✅ Campo platforms actualizado a:', newValue);
    
    // Verificar todos los productos
    console.log('');
    console.log('🔍 Verificando todos los productos...');
    const [allProducts]: any = await connection.execute(
      'SELECT id, name, platforms FROM products WHERE platforms IS NOT NULL'
    );
    
    for (const prod of allProducts) {
      console.log(`- ${prod.name}: ${prod.platforms} (tipo: ${typeof prod.platforms})`);
      
      // Si platforms no es un JSON válido, corregirlo
      if (prod.platforms && typeof prod.platforms === 'string') {
        try {
          JSON.parse(prod.platforms);
          console.log('  ✅ JSON válido');
        } catch (e) {
          console.log('  ⚠️  JSON inválido, corrigiendo...');
          const corrected = JSON.stringify([prod.platforms]);
          await connection.execute(
            'UPDATE products SET platforms = ? WHERE id = ?',
            [corrected, prod.id]
          );
          console.log(`  ✅ Corregido a: ${corrected}`);
        }
      }
    }
    
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

fixPlatformsSQL();
