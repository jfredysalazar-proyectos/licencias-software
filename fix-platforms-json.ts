import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function fixPlatformsJSON() {
  console.log('🔧 Iniciando corrección del campo platforms...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: 'default' });
  
  try {
    // 1. Obtener el producto afectado
    console.log('📋 Buscando producto: windows-11-professional-retail');
    const products = await db.select().from(schema.products).where(eq(schema.products.slug, 'windows-11-professional-retail'));
    
    if (products.length === 0) {
      console.log('❌ Producto no encontrado');
      process.exit(1);
    }
    
    const product = products[0];
    console.log('✅ Producto encontrado:', product.name);
    console.log('📊 Valor actual de platforms:', product.platforms);
    
    // 2. Verificar si platforms necesita corrección
    let needsFix = false;
    let newPlatformsValue: string | null = null;
    
    if (product.platforms) {
      // Verificar si platforms es un array (ya parseado por Drizzle) o un string
      if (Array.isArray(product.platforms)) {
        console.log('✅ El campo platforms ya es un array válido:', product.platforms);
        // Convertir el array a JSON string para guardarlo correctamente
        newPlatformsValue = JSON.stringify(product.platforms);
        needsFix = true;
        console.log('🔄 Convirtiendo array a JSON string:', newPlatformsValue);
      } else if (typeof product.platforms === 'string') {
        try {
          // Intentar parsear como JSON
          JSON.parse(product.platforms);
          console.log('✅ El campo platforms ya es JSON string válido');
        } catch (e) {
          console.log('⚠️  El campo platforms NO es JSON válido, necesita corrección');
          needsFix = true;
          
          // Convertir el texto plano a JSON array
          // Si es "windows", convertir a ["windows"]
          // Si es "windows,mac", convertir a ["windows","mac"]
          const platformsArray = product.platforms.split(',').map(p => p.trim()).filter(p => p.length > 0);
          newPlatformsValue = JSON.stringify(platformsArray);
          console.log('🔄 Nuevo valor de platforms:', newPlatformsValue);
        }
      }
    } else {
      console.log('ℹ️  El campo platforms es NULL, no necesita corrección');
    }
    
    // 3. Aplicar corrección si es necesario
    if (needsFix && newPlatformsValue) {
      console.log('🔧 Aplicando corrección...');
      await db.update(schema.products)
        .set({ platforms: newPlatformsValue })
        .where(eq(schema.products.id, product.id));
      
      console.log('✅ Campo platforms corregido exitosamente');
    }
    
    // 4. Verificar otros productos
    console.log('');
    console.log('🔍 Verificando todos los productos...');
    const allProducts = await db.select().from(schema.products);
    let fixedCount = 0;
    
    for (const prod of allProducts) {
      if (prod.platforms) {
        let needsProductFix = false;
        let correctedValue: string | null = null;
        
        if (Array.isArray(prod.platforms)) {
          // Es un array, convertir a JSON string
          correctedValue = JSON.stringify(prod.platforms);
          needsProductFix = true;
          console.log(`🔄 Producto "${prod.name}" - Convirtiendo array a JSON: ${correctedValue}`);
        } else if (typeof prod.platforms === 'string') {
          try {
            JSON.parse(prod.platforms);
          } catch (e) {
            console.log(`⚠️  Producto "${prod.name}" tiene platforms inválido: ${prod.platforms}`);
            const platformsArray = prod.platforms.split(',').map(p => p.trim()).filter(p => p.length > 0);
            correctedValue = JSON.stringify(platformsArray);
            needsProductFix = true;
            console.log(`✅ Corregido a: ${correctedValue}`);
          }
        }
        
        if (needsProductFix && correctedValue) {
          await db.update(schema.products)
            .set({ platforms: correctedValue })
            .where(eq(schema.products.id, prod.id));
          fixedCount++;
        }
      }
    }
    
    console.log('');
    console.log('🎉 Corrección completada');
    console.log(`📊 Total de productos corregidos: ${fixedCount}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixPlatformsJSON();
