/**
 * API route to get list of files in a thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { HeliumClient } from '@/lib/helium-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    // Try to get API key from header first, then fall back to environment variable
    const headerApiKey = request.headers.get('x-helium-api-key');
    const apiKey = headerApiKey || process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HELIUM_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const client = new HeliumClient(apiKey);
    const filesList = await client.getThreadFiles(threadId, projectId);

    return NextResponse.json(filesList);
  } catch (error) {
    console.error('Error fetching thread files:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch thread files',
      },
      { status: 500 }
    );
  }
}
