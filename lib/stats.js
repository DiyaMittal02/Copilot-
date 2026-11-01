// lib/stats.js — A/B testing statistics. No dependencies.
// Used by the Experiment Planner and validated in lib/stats.test.js.

// Standard normal CDF via the Abramowitz & Stegun 7.1.26 erf approximation.
export function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 +
    t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

// Inverse normal CDF (Beasley-Springer/Moro). Good to ~1e-9 in the body.
export function normInv(p) {
  if (p <= 0 || p >= 1) throw new Error('normInv: p must be in (0,1)');
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969,
             138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887,
             66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184,
             -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143,
             3.75440866190742];
  const pl = 0.02425, ph = 1 - pl;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= ph) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// Two-proportion z-test (pooled). Returns the z stat, two-sided p, and lift.
export function twoProportionZTest(conv1, n1, conv2, n2) {
  const p1 = conv1 / n1, p2 = conv2 / n2;
  const pPool = (conv1 + conv2) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
  const z = (p1 - p2) / se;
  const pValue = 2 * (1 - normCdf(Math.abs(z)));
  return {
    p1, p2,
    absoluteDiff: p1 - p2,
    relativeLift: p2 === 0 ? null : p1 / p2 - 1,
    z, pValue,
    significant: pValue < 0.05,
  };
}

// Required sample size PER ARM for a two-proportion test.
// baseline/target are rates in (0,1); alpha two-sided; power = 1 - beta.
export function sampleSizePerArm(baseline, target, alpha = 0.05, power = 0.8) {
  const za = normInv(1 - alpha / 2);
  const zb = normInv(power);
  const pBar = (baseline + target) / 2;
  const num = za * Math.sqrt(2 * pBar * (1 - pBar)) +
              zb * Math.sqrt(baseline * (1 - baseline) + target * (1 - target));
  return Math.ceil((num * num) / Math.pow(baseline - target, 2));
}
