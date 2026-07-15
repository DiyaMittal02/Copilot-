// lib/gemini.js — Gemini API client

const GEMINI_MODEL = "gemini-1.5-flash";

export async function streamGeminiResponse(apiKey, systemPrompt, userMessage, onChunk) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const result = await model.generateContentStream([
    { role: "user", parts: [{ text: systemPrompt + "\n\n---\n\nUser Question: " + userMessage }] }
  ]);

  let fullText = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    if (onChunk) onChunk(chunkText, fullText);
  }
  return fullText;
}

export async function getGeminiResponse(apiKey, prompt) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
