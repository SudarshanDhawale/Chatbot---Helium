/**
 * API route for fetching files from Helium
 */

import { NextRequest, NextResponse } from 'next/server';
import { HeliumClient } from '@/lib/helium-client';
import { getErrorMessage } from '@/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const apiKey = process.env.HELIUM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HELIUM_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('thread_id');
    const projectId = searchParams.get('project_id');
    const { fileId: rawFileId } = await params;
    const fileId = decodeURIComponent(rawFileId);

    console.log('File API - Raw fileId:', rawFileId);
    console.log('File API - Decoded fileId:', fileId);
    console.log('File API - ThreadId:', threadId);
    console.log('File API - ProjectId:', projectId);

    if (!threadId || !projectId) {
      return NextResponse.json(
        { error: 'thread_id and project_id are required' },
        { status: 400 }
      );
    }

    const client = new HeliumClient(apiKey);
    
    console.log('Calling Helium API with fileId:', fileId);
    
    const fileBlob = await client.getFile(fileId, threadId, projectId, true);

    // Determine content type from file extension or default to octet-stream
    const fileName = fileId.split('/').pop() || 'file';
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const contentTypeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
    };

    const contentType = extension ? contentTypeMap[extension] || 'application/octet-stream' : 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
