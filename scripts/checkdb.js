import pool from '../lib/db.js';

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection: OK\n');

    // Check tables
    const tables = ['User', 'Deck', 'Flashcard'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.query(`SHOW TABLES LIKE '${table}'`);
        if (result.length > 0) {
          console.log(`✅ Table '${table}': EXISTS`);
          
          // Get table structure
          const [columns] = await connection.query(`DESCRIBE ${table}`);
          console.log(`   Columns: ${columns.map(c => c.Field).join(', ')}\n`);
        } else {
          console.log(`❌ Table '${table}': NOT FOUND\n`);
        }
      } catch (err) {
        console.log(`❌ Error checking '${table}': ${err.message}\n`);
      }
    }

    connection.release();
    console.log('✅ Check complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Host: ${process.env.DB_HOST}`);
    console.error(`   User: ${process.env.DB_USER}`);
    console.error(`   Database: ${process.env.DB_NAME}`);
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

checkDatabase();
