import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixVariantsSchema() {
  console.log('🔧 Fixing product variants schema...');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    // Read SQL file
    const sqlPath = join(__dirname, 'fix-variants-tables.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
    }
    
    console.log('✅ Product variants schema fixed successfully!');
    
    // Verify tables exist
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('product_variants', 'variant_options', 'product_skus')
    `);
    
    console.log('📋 Verified tables:', tables);
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

fixVariantsSchema().catch(console.error);
