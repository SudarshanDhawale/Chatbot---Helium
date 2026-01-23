/**
 * API Route for stopping a task
 */

import { NextRequest, NextResponse } from 'next/server';
import { HeliumClient } from '@/lib/helium-client';
import { getErrorMessage } from '@/utils/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  try {
    // Try to get API key from header first, fallback to environment variable
    const apiKey = request.headers.get('x-helium-api-key') || process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please provide your Helium API key.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const client = new HeliumClient(apiKey);

    const response = await client.stopTask(threadId, projectId);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error stopping task:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
}
