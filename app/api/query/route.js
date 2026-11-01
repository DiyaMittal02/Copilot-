import { NextResponse } from 'next/server';
import path from 'node:path';
import { sanitizeSql, normalizeRows } from '@/lib/sqlGuard';
import { complete } from '@/lib/llm';

// The one table the copilot may query. Kept in sync with data/derived/events.parquet.
const SCHEMA = `TABLE events (
  userId       VARCHAR,     -- distinct user (non-empty)
  ts           BIGINT,      -- event time, epoch milliseconds
  event_time   TIMESTAMP,   -- same as ts, as a timestamp (UTC)
  sessionId    BIGINT,      -- listening session id
  page         VARCHAR,     -- event type (see values below)
  level        VARCHAR,     -- 'free' or 'paid'
  artist       VARCHAR,
  song         VARCHAR,
  length       DOUBLE,      -- song length in seconds
  gender       VARCHAR,     -- 'M' or 'F'
  location     VARCHAR,     -- US metro area
  itemInSession BIGINT
)
Key 'page' values: 'NextSong' (a song play), 'Thumbs Up', 'Thumbs Down',
'Add Friend', 'Roll Advert' (an ad), 'Submit Upgrade', 'Submit Downgrade',
'Cancellation Confirmation' (the user churned).
Definitions: churn = a user with a 'Cancellation Confirmation' event.
A song play = page='NextSong'. DAU = distinct userId per day of event_time.`;

async function runSql(sql) {
  const { DuckDBInstance } = await import('@duckdb/node-api');
  const parquet = path.join(process.cwd(), 'data', 'derived', 'events.parquet').replace(/\\/g, '/');
  const instance = await DuckDBInstance.create(':memory:');
  const con = await instance.connect();
  await con.run(`CREATE VIEW events AS SELECT * FROM read_parquet('${parquet}')`);
  const reader = await con.runAndReadAll(sql);
  return normalizeRows(reader.getRowObjects());
}

export async function POST(request) {
  try {
    const { question, sql: editedSql } = await request.json();

    // Path B: user edited the SQL and wants to re-run it directly (no LLM).
    if (editedSql) {
      const guard = sanitizeSql(editedSql, { maxRows: 100 });
      if (!guard.ok) return NextResponse.json({ error: guard.error, sql: editedSql }, { status: 400 });
      try {
        const rows = await runSql(guard.sql);
        const columns = rows.length ? Object.keys(rows[0]) : [];
        return NextResponse.json({ sql: guard.sql, columns, rows });
      } catch (e) {
        return NextResponse.json({ error: `Query failed: ${e.message}`, sql: guard.sql }, { status: 400 });
      }
    }

    // Path A: natural-language question -> SQL -> run -> summarize.
    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Ask a question.' }, { status: 400 });
    }

    // 1. Natural language -> SQL
    const sqlPrompt = `You are a DuckDB SQL expert. Translate the question into ONE read-only SQL query over this schema. Return ONLY the SQL, no prose, no explanation.

${SCHEMA}

Rules: SELECT only. Always include a LIMIT (<=100) for row-level output. Use DuckDB syntax. The only table is "events".

Question: ${question}`;
    const rawSql = await complete({ prompt: sqlPrompt });

    const guard = sanitizeSql(rawSql, { maxRows: 100 });
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error, sql: rawSql }, { status: 400 });
    }

    // 2. Execute
    let rows;
    try {
      rows = await runSql(guard.sql);
    } catch (e) {
      return NextResponse.json({ error: `Query failed: ${e.message}`, sql: guard.sql }, { status: 400 });
    }

    // 3. Summarize the result in plain English
    const answerPrompt = `A user asked: "${question}"
This SQL was run:
${guard.sql}
It returned these rows (JSON):
${JSON.stringify(rows).slice(0, 4000)}

In 2-3 sentences, answer the user's question using these numbers. Be specific and concise. If the result is empty, say so.`;
    const answer = await complete({ prompt: answerPrompt });

    const columns = rows.length ? Object.keys(rows[0]) : [];
    return NextResponse.json({ sql: guard.sql, columns, rows, answer });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
