import { NextResponse } from 'next/server';
import { streamCompletion } from '@/lib/llm';

export async function POST(request) {
  try {
    const { systemPrompt, message } = await request.json();
    const stream = await streamCompletion({ system: systemPrompt, prompt: message });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
