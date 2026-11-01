'use client';
import { useState, useRef, useEffect } from 'react';
import { buildCopilotSystemPrompt } from '@/lib/prompts';

const SUGGESTIONS = [
  "Why might D7 retention drop?",
  "What metrics should I track for subscription growth?",
  "Suggest an A/B test to improve listen time",
  "What is a good DAU/MAU ratio for audio apps?",
  "How do I calculate LTV for a streaming app?",
  "What are the top churn signals to watch?",
];

function MarkdownText({ text }) {
  // Simple markdown renderer
  const lines = text.split('\n');
  return (
    <div className="md-content">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} style={{ marginLeft: '16px' }} dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />;
        }
        if (/^\d+\.\s/.test(line)) {
          return <li key={i} style={{ marginLeft: '16px' }} dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s/, '')) }} />;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i}><strong>{line.slice(2, -2)}</strong></p>;
        }
        if (line.trim() === '') return <br key={i} />;
        if (line.startsWith('---') || line.startsWith('===')) return <hr key={i} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
    </div>
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

export default function CopilotChat({ kpiContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `👋 Hi! I'm your **AI Product Insights Copilot**. I answer using your live dashboard metrics and domain context for audio-streaming products.\n\nI can help you:\n- 📊 Diagnose metric movements (retention drops, conversion dips)\n- 🎯 Suggest the right KPIs to track\n- 🧪 Design A/B experiments with proper frameworks\n- 🔍 Run root cause analysis on product issues\n- 📝 Explain any product metric in depth\n\nWhat would you like to explore today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    // Add streaming placeholder
    setMessages(prev => [...prev, { role: 'ai', text: '', streaming: true }]);

    try {
      const systemPrompt = buildCopilotSystemPrompt(kpiContext);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, message: userText }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'API error');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'ai', text: fullText, streaming: true };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', text: fullText, streaming: false };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'ai',
          text: `⚠️ ${err.message || 'Error connecting to the AI service.'}`,
          streaming: false
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`}>
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>
            <div className={`chat-bubble ${msg.role}${msg.streaming ? ' stream-cursor' : ''}`}>
              {msg.role === 'ai' ? <MarkdownText text={msg.text} /> : msg.text}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.text === '' && (
          <div className="chat-message ai">
            <div className="chat-avatar ai">🤖</div>
            <div className="chat-bubble ai">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            id="chat-input-field"
            placeholder="Ask about metrics, retention, A/B tests, cohort analysis..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            className="chat-send-btn"
            id="chat-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            ➤
          </button>
        </div>
        {!loading && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="chat-suggestion-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
