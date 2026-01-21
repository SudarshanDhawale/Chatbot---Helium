/**
 * API route for message operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db-service';

// Get messages for a thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('thread_id');

    if (!threadId) {
      return NextResponse.json(
        { error: 'thread_id is required' },
        { status: 400 }
      );
    }

    const messages = await DatabaseService.getThreadMessages(threadId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get messages' },
      { status: 500 }
    );
  }
}

// Save a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { thread_id, message } = body;

    if (!thread_id || !message) {
      return NextResponse.json(
        { error: 'thread_id and message are required' },
        { status: 400 }
      );
    }

    const savedMessage = await DatabaseService.saveMessage(thread_id, message);

    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save message' },
      { status: 500 }
    );
  }
}
