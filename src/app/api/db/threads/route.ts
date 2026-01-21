/**
 * API route for thread operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db-service';

// Get all threads for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const threads = await DatabaseService.getUserThreads(userId);

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error getting threads:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get threads' },
      { status: 500 }
    );
  }
}

// Create a new thread
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, thread_id, project_id, title } = body;

    if (!user_id || !thread_id || !project_id || !title) {
      return NextResponse.json(
        { error: 'user_id, thread_id, project_id, and title are required' },
        { status: 400 }
      );
    }

    const thread = await DatabaseService.createThread(
      user_id,
      thread_id,
      project_id,
      title
    );

    return NextResponse.json({ thread });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create thread' },
      { status: 500 }
    );
  }
}
