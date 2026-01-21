/**
 * API route to download files
 */

import { NextRequest, NextResponse } from 'next/server';
import { HeliumClient } from '@/lib/helium-client';

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
    let threadId = searchParams.get('thread_id');
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const { fileId: fileIdParam } = await params;
    const fileId = decodeURIComponent(fileIdParam);
    
    // Extract thread_id from file_id if it's in the format "thread_id:/workspace/filename"
    // Helium file IDs can be in format: "thread_id:/workspace/filename" or just "filename"
    let finalThreadId = threadId;
    let finalFileId = fileId;
    
    if (fileId.includes(':/')) {
      const parts = fileId.split(':/');
      const extractedThreadId = parts[0];
      const filePath = parts.slice(1).join(':/'); // Handle cases where path contains ':'
      
      // When file_id contains thread_id prefix, always use that thread_id
      // The Helium API requires the thread_id query param to match the one in file_id
      finalThreadId = extractedThreadId;
      
      // Reconstruct file_id with just the path part (Helium might expect just the path)
      // Or keep the full file_id - let's try keeping the full file_id first
      finalFileId = fileId;
      
      // If a thread_id was provided in query params, verify it matches
      if (threadId && threadId !== extractedThreadId) {
        return NextResponse.json(
          { error: `file_id does not match thread_id: file_id contains ${extractedThreadId}, query param is ${threadId}` },
          { status: 400 }
        );
      }
    } else if (!threadId) {
      // If file_id doesn't contain thread_id and no thread_id is provided, error
      return NextResponse.json(
        { error: 'thread_id is required when file_id does not contain thread_id prefix' },
        { status: 400 }
      );
    }

    if (!finalThreadId) {
      return NextResponse.json(
        { error: 'thread_id is required' },
        { status: 400 }
      );
    }

    console.log('File download request:', {
      originalFileId: fileId,
      finalFileId,
      finalThreadId,
      projectId,
    });

    const client = new HeliumClient(apiKey);
    const blob = await client.getFile(finalFileId, finalThreadId, projectId, true);

    // Get filename from Content-Disposition header or use fileId
    const filename = fileId.split('/').pop() || 'download';

    // Return the blob with appropriate headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to download file',
      },
      { status: 500 }
    );
  }
}
