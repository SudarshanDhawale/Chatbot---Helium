# 🗄️ Database Setup Guide

This guide will help you set up PostgreSQL database integration for storing conversation history.

## 📋 Prerequisites

- ✅ PostgreSQL installed locally
- ✅ pgAdmin4 (or any PostgreSQL client)
- ✅ Database created: `Chatbot-helium`
- ✅ Database credentials:
  - Host: `localhost`
  - Port: `5432`
  - Username: `sudarshan`
  - Password: `123456`

## 🚀 Quick Setup (5 Steps)

### Step 1: Run SQL Schema in pgAdmin4

1. Open **pgAdmin4**
2. Connect to your PostgreSQL server
3. Right-click on **Databases** → Select `Chatbot-helium`
4. Click **Tools** → **Query Tool**
5. Open the file `database/schema.sql` and copy all contents
6. Paste into Query Tool
7. Click **Execute** (F5) or the ▶️ button

You should see: `Query returned successfully`

### Step 2: Verify Tables Created

Run this query in pgAdmin4:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output (6 tables):
- ✅ code_blocks
- ✅ files
- ✅ messages
- ✅ threads
- ✅ tool_executions
- ✅ users

### Step 3: Environment Variables Already Configured

Your `.env.local` file already has:

```env
DATABASE_URL=postgresql://sudarshan:123456@localhost:5432/Chatbot-helium
```

✅ No action needed!

### Step 4: Test Database Connection

Run the test script:

```bash
npm run db:test
```

Expected output:
```
🔍 Testing database connection...

Test 1: Testing basic connection...
✅ Connected to database
   Current time: 2024-01-21 10:30:45

Test 2: Checking if tables exist...
✅ Found tables:
   - code_blocks
   - files
   - messages
   - threads
   - tool_executions
   - users

Test 3: Creating/getting test user...
✅ User created/retrieved:
   ID: abc-123-def
   Email: test@example.com
   Username: testuser

... (more tests)

🎉 All tests passed!
✨ Database is ready to use!
```

### Step 5: Start Using Database

The application is now configured to:
- ✅ Store all conversations in PostgreSQL
- ✅ Save user information
- ✅ Track message history
- ✅ Store files, code blocks, and tool executions

## 📊 Database Schema Overview

### Tables Structure

```
users (User accounts)
  ├── id (UUID, Primary Key)
  ├── email (Unique)
  ├── username
  ├── full_name
  ├── avatar_url
  └── timestamps

threads (Conversations)
  ├── id (UUID, Primary Key)
  ├── user_id (Foreign Key → users)
  ├── thread_id (Helium thread ID)
  ├── project_id (Helium project ID)
  ├── title
  ├── message_count
  └── timestamps

messages (Chat messages)
  ├── id (UUID, Primary Key)
  ├── thread_id (Foreign Key → threads)
  ├── role (user/assistant/system)
  ├── content
  ├── status
  └── timestamps

files (Uploaded & generated files)
  ├── id (UUID, Primary Key)
  ├── message_id (Foreign Key → messages)
  ├── file_id (Helium file ID)
  ├── file_name
  ├── file_size
  └── is_uploaded (true=user, false=AI)

code_blocks (Code in messages)
  ├── id (UUID, Primary Key)
  ├── message_id (Foreign Key → messages)
  ├── language
  └── code

tool_executions (AI tool usage)
  ├── id (UUID, Primary Key)
  ├── message_id (Foreign Key → messages)
  ├── function_name
  ├── description
  └── status
```

## 🔧 Troubleshooting

### ❌ Connection Refused

**Problem:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Start if not running
   brew services start postgresql
   ```

2. Verify port 5432 is correct:
   ```sql
   SHOW port;
   ```

### ❌ Authentication Failed

**Problem:** `password authentication failed for user "sudarshan"`

**Solutions:**
1. Reset password in pgAdmin4:
   - Right-click on user → Properties → Definition → Set password

2. Or update `.env.local` with correct password

### ❌ Database Does Not Exist

**Problem:** `database "Chatbot-helium" does not exist`

**Solution:**
```sql
CREATE DATABASE "Chatbot-helium";
```

### ❌ Permission Denied

**Problem:** `permission denied for schema public`

**Solution:**
```sql
GRANT ALL PRIVILEGES ON DATABASE "Chatbot-helium" TO sudarshan;
GRANT ALL PRIVILEGES ON SCHEMA public TO sudarshan;
```

### ❌ Tables Not Created

**Problem:** No error but tables don't appear

**Solutions:**
1. Make sure you're connected to `Chatbot-helium` database (not `postgres`)
2. Refresh the database tree in pgAdmin4 (right-click → Refresh)
3. Run schema.sql again

## 📝 Useful SQL Queries

### View all users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### View all conversations
```sql
SELECT 
  t.title,
  t.message_count,
  t.last_message_at,
  u.email as user_email
FROM threads t
JOIN users u ON t.user_id = u.id
ORDER BY t.last_message_at DESC;
```

### View conversation history
```sql
SELECT 
  m.role,
  m.content,
  m.created_at
FROM messages m
JOIN threads t ON m.thread_id = t.id
WHERE t.thread_id = 'YOUR_THREAD_ID'
ORDER BY m.created_at ASC;
```

### Count messages by user
```sql
SELECT 
  u.email,
  COUNT(m.id) as total_messages
FROM users u
JOIN threads t ON u.id = t.user_id
JOIN messages m ON t.id = m.thread_id
GROUP BY u.id, u.email
ORDER BY total_messages DESC;
```

### View files generated
```sql
SELECT 
  f.file_name,
  f.file_size,
  f.is_uploaded,
  m.role,
  t.title
FROM files f
JOIN messages m ON f.message_id = m.id
JOIN threads t ON m.thread_id = t.id
ORDER BY f.created_at DESC;
```

## 🎯 Next Steps

1. ✅ Run `npm run db:test` to verify setup
2. ✅ Start your dev server: `npm run dev`
3. ✅ Create a new conversation - it will be saved to database!
4. ✅ Check pgAdmin4 to see data being stored in real-time

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin4 Documentation](https://www.pgadmin.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify PostgreSQL is running
3. Check database credentials in `.env.local`
4. Review error messages carefully

---

**Ready to go!** 🚀 Your database is now configured to store all conversation history.
