import { NextResponse } from 'next/server';
import { complete } from '@/lib/llm';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    const text = await complete({ prompt });
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
