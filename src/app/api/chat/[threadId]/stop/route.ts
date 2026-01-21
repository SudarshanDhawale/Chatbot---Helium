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
    const apiKey = process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HELIUM_API_KEY environment variable is not set' },
        { status: 500 }
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
