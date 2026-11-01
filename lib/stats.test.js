// Run with: npm test  (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normCdf, normInv, twoProportionZTest, sampleSizePerArm } from './stats.js';

test('normCdf matches known quantiles', () => {
  assert.ok(Math.abs(normCdf(0) - 0.5) < 1e-6);
  assert.ok(Math.abs(normCdf(1.96) - 0.975) < 1e-3);
  assert.ok(Math.abs(normCdf(-1.96) - 0.025) < 1e-3);
});

test('normInv is the inverse of normCdf', () => {
  assert.ok(Math.abs(normInv(0.975) - 1.959964) < 1e-3);
  for (const p of [0.1, 0.3, 0.5, 0.8, 0.95]) {
    assert.ok(Math.abs(normCdf(normInv(p)) - p) < 1e-4);
  }
});

test('twoProportionZTest flags a clear difference as significant', () => {
  const r = twoProportionZTest(200, 1000, 150, 1000); // 20% vs 15%
  assert.ok(r.pValue < 0.05);
  assert.ok(r.significant);
  assert.ok(Math.abs(r.absoluteDiff - 0.05) < 1e-9);
});

test('twoProportionZTest treats a tiny difference as not significant', () => {
  const r = twoProportionZTest(101, 1000, 100, 1000);
  assert.equal(r.significant, false);
});

test('sampleSizePerArm matches the memo (26.7% -> 21.7% ≈ 1,151/arm)', () => {
  const n = sampleSizePerArm(0.267, 0.217);
  assert.ok(Math.abs(n - 1151) <= 2, `expected ~1151, got ${n}`);
});

test('sampleSizePerArm grows as the effect shrinks', () => {
  assert.ok(sampleSizePerArm(0.267, 0.247) > sampleSizePerArm(0.267, 0.20));
});
