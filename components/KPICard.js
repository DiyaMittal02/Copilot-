'use client';

export default function KPICard({ label, value, change, unit, trend, color }) {
  const isUp = trend === 'up';
  // For metrics where "up" is bad (e.g. churn), invert color
  const isPositive = (label?.toLowerCase().includes('churn') || label?.toLowerCase().includes('crash'))
    ? !isUp : isUp;

  const glowColor = color || (isPositive ? '#10b981' : '#ef4444');

  const formatValue = (val) => {
    if (typeof val !== 'number') return val;
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
    return val.toString();
  };

  return (
    <div className="kpi-card">
      <div className="kpi-card-glow" style={{ background: glowColor }} />
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{formatValue(value)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className={`kpi-change ${isPositive ? 'up' : 'down'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span className="kpi-unit">{unit}</span>
      </div>
    </div>
  );
}
