'use client';

const typeConfig = {
  warning: { icon: '⚠️', label: 'Watch' },
  positive: { icon: '✅', label: 'Win' },
  info: { icon: '💡', label: 'Insight' },
};

export default function InsightBadge({ type, metric, message, date }) {
  const cfg = typeConfig[type] || typeConfig.info;
  return (
    <div className={`insight-badge ${type}`}>
      <span className="insight-icon">{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>{metric}</span>
          <span style={{
            fontSize: '10px', padding: '1px 6px', borderRadius: '20px',
            background: type === 'warning' ? 'rgba(245,158,11,0.15)' : type === 'positive' ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.15)',
            color: type === 'warning' ? '#fcd34d' : type === 'positive' ? '#34d399' : '#22d3ee',
            fontWeight: 600
          }}>{cfg.label}</span>
          {date && <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>{date}</span>}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</div>
      </div>
    </div>
  );
}
