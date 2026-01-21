/**
 * Simple database connection test
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  console.log('📝 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');
  console.log('');

  // Create pool after environment variables are loaded
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });

  try {
    // Test connection
    console.log('Test 1: Testing basic connection...');
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ Connected to database');
    console.log(`   Database: ${result.rows[0].db_name}`);
    console.log(`   Current time: ${result.rows[0].current_time}\n`);

    // Check tables
    console.log('Test 2: Checking if tables exist...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach((row) => console.log(`   - ${row.table_name}`));
    console.log('');

    console.log('🎉 Database connection successful!');
    console.log('✨ You can now run: npm run db:test');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
