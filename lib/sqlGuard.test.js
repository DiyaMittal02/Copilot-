import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSql, sanitizeSql, normalizeRows } from './sqlGuard.js';

test('extractSql strips markdown fences and trailing prose', () => {
  assert.equal(extractSql('```sql\nSELECT 1\n```'), 'SELECT 1');
  assert.equal(extractSql('SELECT 1; SELECT 2'), 'SELECT 1');
});

test('sanitizeSql allows SELECT and adds a LIMIT', () => {
  const r = sanitizeSql('SELECT page FROM events');
  assert.ok(r.ok);
  assert.match(r.sql, /limit 500/i);
});

test('sanitizeSql keeps an existing LIMIT', () => {
  const r = sanitizeSql('SELECT page FROM events LIMIT 10');
  assert.ok(r.ok);
  assert.equal(r.sql, 'SELECT page FROM events LIMIT 10');
});

test('sanitizeSql allows CTE (WITH)', () => {
  const r = sanitizeSql('WITH x AS (SELECT 1 a) SELECT * FROM x');
  assert.ok(r.ok);
});

test('sanitizeSql blocks writes and DDL', () => {
  for (const bad of ['DROP TABLE events', 'DELETE FROM events', 'INSERT INTO events VALUES (1)',
                      'UPDATE events SET page=1', 'ATTACH \'x.db\'', 'COPY events TO \'x\'']) {
    assert.equal(sanitizeSql(bad).ok, false, `should block: ${bad}`);
  }
});

test('normalizeRows coerces BigInt and Date', () => {
  const out = normalizeRows([{ c: 5n, t: new Date('2020-01-01T00:00:00Z'), s: 'x' }]);
  assert.equal(out[0].c, 5);
  assert.equal(out[0].t, '2020-01-01T00:00:00.000Z');
  assert.equal(out[0].s, 'x');
});
