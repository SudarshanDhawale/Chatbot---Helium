# API Key Setup

This application now requires users to provide their own Helium API key instead of using a server-side environment variable.

## How It Works

1. **First Visit**: When a user visits the application for the first time, they will see a modal prompting them to enter their Helium API key.

2. **API Key Storage**: The application stores the API key in the browser's localStorage without validation. The key will be validated when the user sends their first message.

3. **Local Storage**: Once entered, the API key is stored in the browser's localStorage and automatically included in all API requests.

4. **Invalid Key Handling**: If an API request fails due to an invalid or expired API key (401 error), the modal will automatically reappear, prompting the user to enter a valid key.

## Getting Your API Key

Users can obtain their Helium API key from [app.he2.ai](https://app.he2.ai).

## Security

- The API key is stored locally in the user's browser (localStorage)
- The key is never sent to any server except the Helium API
- The key is included in API requests via the `x-helium-api-key` header
- The server-side environment variable (`HELIUM_API_KEY`) still works as a fallback for development

## Components Added

- `src/components/auth/ApiKeyModal.tsx` - Modal component for API key input
- `src/hooks/use-api-key.ts` - Hook for managing API key state

## Modified Files

- All API routes now accept API key from request headers
- Chat and stream services include API key in requests
- Main pages show the modal when no API key is present
- File download components include API key in requests
