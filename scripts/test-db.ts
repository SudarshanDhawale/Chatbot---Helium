/**
 * Test database connection and basic operations
 */

// IMPORTANT: Load environment variables FIRST before any imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Now import database modules
import { query } from '../src/lib/db';
import { DatabaseService } from '../src/lib/db-service';

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');
  console.log('📝 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET');
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...');
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Connected to database');
    console.log(`   Current time: ${result.rows[0].current_time}\n`);

    // Test 2: Check tables exist
    console.log('Test 2: Checking if tables exist...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('✅ Found tables:');
    tables.rows.forEach((row) => console.log(`   - ${row.table_name}`));
    console.log('');

    // Test 3: Create/get user
    console.log('Test 3: Creating/getting test user...');
    const user = await DatabaseService.getOrCreateUser('test@example.com', {
      username: 'testuser',
      full_name: 'Test User',
    });
    console.log('✅ User created/retrieved:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}\n`);

    // Test 4: Create thread
    console.log('Test 4: Creating test thread...');
    const thread = await DatabaseService.createThread(
      user.id,
      'test_thread_' + Date.now(),
      'test_project_' + Date.now(),
      'Test Conversation'
    );
    console.log('✅ Thread created:');
    console.log(`   ID: ${thread.id}`);
    console.log(`   Thread ID: ${thread.thread_id}`);
    console.log(`   Title: ${thread.title}\n`);

    // Test 5: Save message
    console.log('Test 5: Saving test message...');
    const message = await DatabaseService.saveMessage(thread.thread_id, {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: 'Hello, this is a test message!',
      timestamp: new Date(),
      status: 'completed',
    });
    console.log('✅ Message saved:');
    console.log(`   ID: ${message.id}`);
    console.log(`   Content: ${message.content}\n`);

    // Test 6: Get messages
    console.log('Test 6: Retrieving messages...');
    const messages = await DatabaseService.getThreadMessages(thread.thread_id);
    console.log(`✅ Retrieved ${messages.length} message(s)\n`);

    // Test 7: Get user threads
    console.log('Test 7: Getting user threads...');
    const userThreads = await DatabaseService.getUserThreads(user.id);
    console.log(`✅ User has ${userThreads.length} thread(s)\n`);

    console.log('🎉 All tests passed!');
    console.log('\n✨ Database is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDatabase();
