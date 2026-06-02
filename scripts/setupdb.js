import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  console.log('🚀 Setting up database...\n');
  
  try {
    // Connect without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL server\n');

    const dbName = process.env.DB_NAME || 'hibahpkm';

    // Create database
    console.log(`📦 Creating database: ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready\n`);

    // Switch to database
    await connection.query(`USE \`${dbName}\``);
    console.log(`📍 Switched to database '${dbName}'\n`);

    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSql.split(';').filter(stmt => stmt.trim());
    
    console.log(`📋 Executing ${statements.length} SQL statements...\n`);
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          await connection.query(trimmed);
          console.log(`✅ ${trimmed.substring(0, 50).toUpperCase()}...`);
        } catch (err) {
          console.error(`❌ Error: ${err.message}`);
        }
      }
    }

    // Verify tables
    console.log('\n📋 Verifying tables...\n');
    const [tables] = await connection.query(`SHOW TABLES`);
    
    if (tables.length > 0) {
      tables.forEach((row, idx) => {
        const tableName = Object.values(row)[0];
        console.log(`✅ Table ${idx + 1}: ${tableName}`);
      });
    }

    await connection.end();
    console.log('\n✅ Database setup complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:');
    console.error(`   Error: ${error.message}\n`);
    console.error('📌 Make sure:');
    console.error('   - MySQL server is running');
    console.error('   - .env has correct DB_HOST, DB_USER, DB_PASSWORD');
    console.error('   - prisma/schema.sql exists\n');
    process.exit(1);
  }
}

setupDatabase();
