// lib/sqlGuard.js — read-only guardrails for LLM-generated SQL.
// Keeps the self-serve query feature safe: SELECT-only, single statement,
// capped row count. Pure functions, validated in lib/sqlGuard.test.js.

const FORBIDDEN = [
  'insert', 'update', 'delete', 'drop', 'alter', 'create', 'attach', 'detach',
  'copy', 'pragma', 'install', 'load', 'export', 'set', 'call', 'merge',
  'truncate', 'grant', 'revoke', 'vacuum', 'reset',
];

// Strip ```sql fences and surrounding prose the model may add.
export function extractSql(text) {
  if (!text) return '';
  const fence = text.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  let sql = (fence ? fence[1] : text).trim();
  // keep only the first statement
  sql = sql.split(';')[0].trim();
  return sql;
}

// Returns { ok, sql, error }. Enforces SELECT/WITH-only + a LIMIT.
export function sanitizeSql(raw, { maxRows = 500 } = {}) {
  const sql = extractSql(raw);
  if (!sql) return { ok: false, error: 'No SQL produced.' };

  const lower = sql.toLowerCase();
  if (!/^\s*(select|with)\b/.test(lower)) {
    return { ok: false, error: 'Only SELECT queries are allowed.' };
  }
  // reject forbidden keywords as whole words
  for (const kw of FORBIDDEN) {
    if (new RegExp(`\\b${kw}\\b`).test(lower)) {
      return { ok: false, error: `Disallowed keyword: ${kw.toUpperCase()}.` };
    }
  }
  // enforce a row cap
  let finalSql = sql;
  if (!/\blimit\b/.test(lower)) {
    finalSql = `SELECT * FROM (${sql}) AS _q LIMIT ${maxRows}`;
  }
  return { ok: true, sql: finalSql };
}

// JSON.stringify can't handle BigInt (DuckDB counts). Coerce recursively.
export function normalizeRows(rows) {
  return rows.map((row) => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === 'bigint') {
        out[k] = v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v.toString();
      } else if (v instanceof Date) {
        out[k] = v.toISOString();
      } else {
        out[k] = v;
      }
    }
    return out;
  });
}
