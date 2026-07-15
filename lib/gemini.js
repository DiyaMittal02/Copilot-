// lib/groq.js — Groq API client (replaces Gemini)

const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function streamGeminiResponse(apiKey, systemPrompt, userMessage, onChunk) {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });

  let fullText = "";
  for await (const chunk of stream) {
    const chunkText = chunk.choices[0]?.delta?.content || "";
    if (chunkText) {
      fullText += chunkText;
      if (onChunk) onChunk(chunkText, fullText);
    }
  }
  return fullText;
}

export async function getGeminiResponse(apiKey, prompt) {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content || "";
}
