# Helium Chatbot

A modern, production-ready chatbot application that implements the Helium Public API. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🤖 **AI-Powered Chatbot** - Interact with Helium AI to build websites, apps, and more
- 💬 **Real-time Updates** - Poll for task results with live status updates
- 📁 **File Support** - Upload files to enhance your requests
- 💻 **Code Display** - View generated code blocks with syntax highlighting
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS
- 🔒 **Secure** - API keys stored server-side for security
- ⚡ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🏗️ **Production-Ready** - Industry-grade architecture and best practices

## Architecture

The project follows industry best practices with a clean, maintainable architecture:

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (server-side)
│   │   └── chat/          # Chat API endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/            # React components
│   └── chat/              # Chat-specific components
├── hooks/                 # Custom React hooks
│   └── use-chat.ts        # Chat state management
├── lib/                   # Core libraries
│   ├── helium-client.ts   # Helium API client
│   └── chat-service.ts    # Chat service layer
├── types/                 # TypeScript type definitions
│   ├── helium.ts          # Helium API types
│   └── chat.ts            # Chat UI types
└── utils/                 # Utility functions
    ├── errors.ts          # Error handling
    └── format.ts          # Formatting utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Helium API key from [https://app.he2.ai](https://app.he2.ai)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd "Chatbot - Helium"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Helium API key:
   ```
   HELIUM_API_KEY=he-your-api-key-here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

### API Routes

All API routes are located in `src/app/api/chat/` and handle server-side communication with the Helium API:

- `POST /api/chat` - Create a new task
- `GET /api/chat/[threadId]/response` - Get task results
- `POST /api/chat/[threadId]/continue` - Continue conversation
- `POST /api/chat/[threadId]/stop` - Stop a running task

### Components

- **ChatContainer** - Main chat interface container
- **ChatMessage** - Individual message display
- **ChatInput** - Message input with file upload support
- **CodeBlock** - Syntax-highlighted code display
- **FileList** - Generated files display

### Hooks

- **useChat** - Custom hook for managing chat state, messages, and interactions

### Services

- **HeliumClient** - Low-level API client for Helium API
- **ChatService** - High-level service for chat operations

## Usage

1. **Start a conversation:**
   - Type a message describing what you want to build
   - Optionally attach files (images, documents, etc.)
   - Click send or press Enter

2. **Wait for results:**
   - The chatbot will poll for results automatically
   - You'll see real-time status updates
   - Generated code and files will be displayed when ready

3. **Continue the conversation:**
   - Ask follow-up questions or request modifications
   - The conversation context is maintained

4. **Stop a task:**
   - Click the "Stop" button if a task is taking too long

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HELIUM_API_KEY` | Your Helium API key (starts with `he-`) | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Best Practices Implemented

✅ **Separation of Concerns** - Clear separation between UI, business logic, and API layers  
✅ **Type Safety** - Comprehensive TypeScript types for all API responses  
✅ **Error Handling** - Robust error handling with user-friendly messages  
✅ **Security** - API keys stored server-side, never exposed to client  
✅ **Performance** - Efficient polling with configurable intervals  
✅ **Accessibility** - ARIA labels and keyboard navigation support  
✅ **Code Quality** - ESLint configuration and clean code principles  
✅ **Scalability** - Modular architecture for easy extension  

## API Documentation

For detailed information about the Helium Public API, see `HELIUM_PUBLIC_API_DOCUMENTATION.md`.

## Troubleshooting

### "HELIUM_API_KEY environment variable is not set"

Make sure you've created a `.env.local` file with your API key.

### Tasks taking too long

- Some tasks naturally take longer (especially complex ones)
- The default timeout is 10 minutes
- You can stop a task using the "Stop" button

### Rate limit errors

- Check your API plan limits
- Implement exponential backoff if needed
- Consider upgrading your plan

## License

ISC

## Support

For issues with the Helium API, visit [https://app.he2.ai](https://app.he2.ai) or contact support@he2.ai
