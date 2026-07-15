import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { apiKey, prompt } = await request.json();

    if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 400 });

    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0]?.message?.content || '';
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
