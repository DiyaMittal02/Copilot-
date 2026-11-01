// lib/llm.js — provider-agnostic LLM adapter (server-side only).
//
// Groq, Gemini, OpenAI and Ollama all expose an OpenAI-compatible
// /chat/completions endpoint, so one fetch client covers them all.
//
// Configure via env (see .env.example):
//   LLM_PROVIDER = gemini | groq | openai | ollama   (default: gemini)
//   LLM_MODEL    = optional model override
//   GEMINI_API_KEY / GROQ_API_KEY / OPENAI_API_KEY   (ollama needs none)
//   OLLAMA_URL   = optional, default http://localhost:11434/v1

const PROVIDERS = {
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-flash',
    keyEnv: 'GEMINI_API_KEY',
  },
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    // llama-3.3-70b-versatile was retired by Groq (Aug 2026); this is the
    // recommended replacement. Override with LLM_MODEL if you prefer another.
    model: 'openai/gpt-oss-120b',
    keyEnv: 'GROQ_API_KEY',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    keyEnv: 'OPENAI_API_KEY',
  },
  ollama: {
    baseURL: process.env.OLLAMA_URL || 'http://localhost:11434/v1',
    model: 'llama3.1',
    keyEnv: null, // local, no key
  },
};

export function getLLMConfig() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  const p = PROVIDERS[provider];
  if (!p) {
    throw new Error(`Unknown LLM_PROVIDER "${provider}". Use one of: ${Object.keys(PROVIDERS).join(', ')}.`);
  }
  const apiKey = p.keyEnv ? process.env[p.keyEnv] : 'ollama';
  if (p.keyEnv && !apiKey) {
    throw new Error(`Missing ${p.keyEnv}. Copy .env.example to .env.local and set it (or change LLM_PROVIDER).`);
  }
  return { provider, baseURL: p.baseURL, model: process.env.LLM_MODEL || p.model, apiKey };
}

function buildMessages(system, prompt) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });
  return messages;
}

async function callChat({ messages, stream }) {
  const { baseURL, model, apiKey } = getLLMConfig();
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, stream, temperature: 0 }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LLM request failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res;
}

// Non-streaming completion → string.
export async function complete({ system, prompt }) {
  const res = await callChat({ messages: buildMessages(system, prompt), stream: false });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// Streaming completion → a ReadableStream emitting our own `data: {"text": "..."}`
// SSE frames, so the client stays provider-agnostic.
export async function streamCompletion({ system, prompt }) {
  const upstream = await callChat({ messages: buildMessages(system, prompt), stream: true });
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') { controller.close(); return; }
            try {
              const json = JSON.parse(payload);
              const text = json.choices?.[0]?.delta?.content || '';
              if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            } catch { /* ignore keep-alive / non-JSON frames */ }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}
