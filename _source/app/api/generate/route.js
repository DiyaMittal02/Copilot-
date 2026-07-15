import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { apiKey, prompt } = await request.json();

    if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 400 });

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
