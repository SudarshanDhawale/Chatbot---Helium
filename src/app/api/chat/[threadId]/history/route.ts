/**
 * API Route for getting conversation history
 */

import { NextRequest, NextResponse } from 'next/server';
import { HeliumClient } from '@/lib/helium-client';
import { getErrorMessage } from '@/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    // Try to get API key from header first, fallback to environment variable
    const apiKey = request.headers.get('x-helium-api-key') || process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please provide your Helium API key.' },
        { status: 401 }
      );
    }

    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const page = searchParams.get('page');
    const pageSize = searchParams.get('page_size');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const client = new HeliumClient(apiKey);

    const response = await client.getConversationHistory(threadId, projectId, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
}
