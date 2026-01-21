/**
 * API Route for creating chat tasks
 * Keeps API key secure on the server side
 */

import { NextRequest, NextResponse } from 'next/server';
import { HeliumClient } from '@/lib/helium-client';
import { getErrorMessage } from '@/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HELIUM_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const prompt = formData.get('prompt') as string | null;
    const files = formData.getAll('files') as File[];

    if (!prompt && files.length === 0) {
      return NextResponse.json(
        { error: 'Prompt or files are required' },
        { status: 400 }
      );
    }

    const client = new HeliumClient(apiKey);

    const taskResponse = await client.createTask({
      prompt: prompt || undefined,
      files: files.length > 0 ? files : undefined,
      source: 'web',
    });

    // Transform snake_case to camelCase for frontend
    return NextResponse.json({
      success: taskResponse.success,
      threadId: taskResponse.thread_id,
      projectId: taskResponse.project_id,
      agentRunId: taskResponse.agent_run_id,
      message: taskResponse.message,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
}
