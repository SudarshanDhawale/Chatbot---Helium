# Storage Migration: PostgreSQL → Browser localStorage

## Overview
The application has been migrated from PostgreSQL database storage to browser localStorage for temporary data storage. This is ideal for testing and demo purposes.

## What Changed

### Removed
- PostgreSQL database connection (`src/lib/db.ts`)
- Database service (`src/lib/db-service.ts`)
- Database API routes (`src/app/api/db/**`)
- Database schema and migrations (`database/**`)

### Added
- **`src/lib/storage-client.ts`**: New localStorage-based storage service
  - Stores users, threads, and messages in browser localStorage
  - Provides the same API as the previous DBClient
  - Data persists across browser sessions
  - Automatic cleanup when browser storage is cleared

## Storage Structure

Data is stored in localStorage under the key `helium_app_data` with the following structure:

```json
{
  "users": {
    "user_id": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "optional",
      "full_name": "optional"
    }
  },
  "threads": {
    "thread_internal_id": {
      "id": "thread_internal_id",
      "user_id": "user_id",
      "thread_id": "helium_thread_id",
      "project_id": "helium_project_id",
      "title": "Thread title",
      "created_at": "ISO date",
      "updated_at": "ISO date",
      "last_message_at": "ISO date",
      "message_count": 0,
      "is_archived": false
    }
  },
  "messages": {
    "helium_thread_id": [
      {
        "id": "message_id",
        "role": "user|assistant",
        "content": "message content",
        "timestamp": "ISO date",
        "status": "completed|running|error",
        "files": [],
        "codeBlocks": [],
        "toolExecutions": []
      }
    ]
  }
}
```

## API Changes

All components now use `StorageService` instead of `DBClient`:

```typescript
// Before
import { DBClient } from '@/lib/db-client';
await DBClient.getUserThreads(userId);

// After
import { StorageService } from '@/lib/storage-client';
await StorageService.getUserThreads(userId);
```

## Benefits

1. **No Database Setup**: No need to configure PostgreSQL
2. **Zero Infrastructure**: Works entirely in the browser
3. **Fast Development**: Instant setup for testing
4. **Privacy**: Data stays in the user's browser
5. **Easy Deployment**: Deploy anywhere without database concerns

## Limitations

1. **Browser-Specific**: Data doesn't sync across browsers/devices
2. **Storage Limits**: Browser localStorage typically has 5-10MB limit
3. **No Server Backup**: Data is lost if browser storage is cleared
4. **Single User**: Each browser session is isolated

## Data Management

### Clear All Data
```typescript
import { StorageService } from '@/lib/storage-client';
await StorageService.clearAll();
```

### Export Data (for backup)
```typescript
const data = localStorage.getItem('helium_app_data');
console.log(JSON.parse(data));
```

### Import Data (restore from backup)
```typescript
const backupData = '{"users":{},"threads":{},"messages":{}}';
localStorage.setItem('helium_app_data', backupData);
```

## Migration Path (if needed later)

To migrate back to a database:

1. Keep the `StorageService` interface
2. Implement a new backend service with the same methods
3. Add API routes to handle server-side storage
4. Update imports to use the new service

The interface remains the same, making future migrations straightforward.

## Testing

The app now works completely offline (except for Helium API calls):
- Create threads
- Send messages
- View history
- Delete threads
- Update user profile

All data persists in the browser until manually cleared.
