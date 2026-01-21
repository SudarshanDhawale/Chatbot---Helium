# Database Setup Instructions

## Prerequisites

- PostgreSQL installed locally
- pgAdmin4 (or any PostgreSQL client)
- Database created: `Chatbot-helium`

## Setup Steps

### 1. Create Database

If you haven't created the database yet, run this in pgAdmin4 or psql:

```sql
CREATE DATABASE "Chatbot-helium";
```

### 2. Run Schema

1. Open pgAdmin4
2. Connect to your PostgreSQL server
3. Select the `Chatbot-helium` database
4. Open Query Tool (Tools → Query Tool)
5. Copy and paste the contents of `schema.sql`
6. Execute the query (F5 or click Execute button)

### 3. Verify Tables

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- users
- threads
- messages
- files
- code_blocks
- tool_executions

### 4. Configure Environment

Make sure your `.env.local` file has:

```env
DATABASE_URL=postgresql://sudarshan:123456@localhost:5432/Chatbot-helium
```

### 5. Test Connection

Run the test script:

```bash
npm run db:test
```

## Database Schema Overview

### Users Table
Stores user information and authentication data.

### Threads Table
Stores conversation threads with Helium thread_id and project_id.

### Messages Table
Stores individual messages in conversations.

### Files Table
Stores both uploaded files (from users) and generated files (from AI).

### Code Blocks Table
Stores code blocks extracted from AI responses.

### Tool Executions Table
Stores tool execution status (creating files, running commands, etc.).

## Useful Queries

### Get all threads for a user
```sql
SELECT * FROM threads 
WHERE user_id = 'USER_UUID' 
ORDER BY last_message_at DESC;
```

### Get conversation history
```sql
SELECT m.*, t.title 
FROM messages m
JOIN threads t ON m.thread_id = t.id
WHERE t.thread_id = 'HELIUM_THREAD_ID'
ORDER BY m.created_at ASC;
```

### Get message count by user
```sql
SELECT u.email, COUNT(m.id) as message_count
FROM users u
JOIN threads t ON u.id = t.user_id
JOIN messages m ON t.id = m.thread_id
GROUP BY u.id, u.email;
```

## Troubleshooting

### Connection refused
- Make sure PostgreSQL is running
- Check if the port 5432 is correct
- Verify username and password

### Permission denied
- Make sure the user has proper permissions
- Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE "Chatbot-helium" TO sudarshan;`

### Tables not created
- Check for SQL syntax errors in the output
- Make sure you're connected to the correct database
- Try running each CREATE TABLE statement individually
