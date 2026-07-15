'use client';
import { useState, useRef, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import AppShell from '@/components/AppShell';
import { archetypes, discoveryNodes, discoveryLinks, gatewayInsights } from '@/lib/audienceData';

/* ══════════════════════════════════════════════════════════════════
   SHARED UTILITIES
══════════════════════════════════════════════════════════════════ */
function toRad(deg) { return (deg * Math.PI) / 180; }

/* ══════════════════════════════════════════════════════════════════
   CLOCK HEATMAP — 24-hour radial listening pattern
══════════════════════════════════════════════════════════════════ */
function ClockHeatmap({ data, color, size = 180 }) {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.44, innerR = size * 0.24;
  const totalDeg = 360 / 24;

  const segments = data.map((intensity, hour) => {
    const startDeg = hour * totalDeg - 90;
    const endDeg = (hour + 1) * totalDeg - 90;
    const sa = toRad(startDeg), ea = toRad(endDeg);
    const x1 = cx + outerR * Math.cos(sa), y1 = cy + outerR * Math.sin(sa);
    const x2 = cx + outerR * Math.cos(ea), y2 = cy + outerR * Math.sin(ea);
    const ix1 = cx + innerR * Math.cos(sa), iy1 = cy + innerR * Math.sin(sa);
    const ix2 = cx + innerR * Math.cos(ea), iy2 = cy + innerR * Math.sin(ea);
    const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 0 0 ${ix1} ${iy1} Z`;
    return { d, opacity: 0.08 + (intensity / 100) * 0.92, hour };
  });

  const peakHour = data.indexOf(Math.max(...data));
  const peakLabel = peakHour === 0 ? '12AM' : peakHour < 12 ? `${peakHour}AM` : peakHour === 12 ? '12PM' : `${peakHour - 12}PM`;

  // Cardinal hour labels (0=midnight top, 6=right, 12=bottom, 18=left)
  const cardinals = [
    { h: 0, label: '12AM', x: cx, y: 10 },
    { h: 6, label: '6AM', x: size - 10, y: cy },
    { h: 12, label: '12PM', x: cx, y: size - 6 },
    { h: 18, label: '6PM', x: 10, y: cy },
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Glow ring */}
        <circle cx={cx} cy={cy} r={outerR + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.15} />
        {/* Segments */}
        {segments.map((seg, i) => (
          <path key={i} d={seg.d} fill={color} opacity={seg.opacity} />
        ))}
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="#080d1a" />
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize={9} fontWeight={700} opacity={0.8}>PEAK</text>
        <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize={13} fontWeight={800}>{peakLabel}</text>
        {/* Cardinal labels */}
        {cardinals.map((c, i) => (
          <text key={i} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize={8}>{c.label}</text>
        ))}
        {/* Peak indicator dot */}
        {(() => {
          const peakDeg = peakHour * totalDeg - 90 + totalDeg / 2;
          const pr = (outerR + innerR) / 2;
          const px = cx + pr * Math.cos(toRad(peakDeg));
          const py = cy + pr * Math.sin(toRad(peakDeg));
          return <circle cx={px} cy={py} r={4} fill={color} opacity={0.9} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />;
        })()}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SANKEY FLOW DIAGRAM — Custom SVG
══════════════════════════════════════════════════════════════════ */
function SankeyFlow({ nodes, links, highlightFrom }) {
  const [hovered, setHovered] = useState(null);
  const W = 820, H = 540;
  const NODE_W = 168, GAP = 14;
  const LEFT_X = 0, RIGHT_X = W - NODE_W;

  const sources = nodes.sources;
  const dests = nodes.destinations;

  // ── compute destination values from links
  const destValues = {};
  dests.forEach(d => { destValues[d.id] = 0; });
  links.forEach(l => { destValues[l.to] += l.value; });

  const leftTotal = sources.reduce((s, n) => s + n.value, 0);
  const rightTotal = Object.values(destValues).reduce((s, v) => s + v, 0);

  // ── left positions
  const leftAvail = H - GAP * (sources.length - 1);
  let lY = 0;
  const lPos = {};
  const lH = {};
  sources.forEach(n => {
    const h = Math.max(32, (n.value / leftTotal) * leftAvail);
    lPos[n.id] = lY; lH[n.id] = h; lY += h + GAP;
  });

  // ── right positions  
  const rightAvail = H - GAP * (dests.length - 1);
  let rY = 0;
  const rPos = {};
  const rH = {};
  dests.forEach(n => {
    const h = Math.max(20, (destValues[n.id] / rightTotal) * rightAvail);
    rPos[n.id] = rY; rH[n.id] = h; rY += h + GAP;
  });

  // ── compute link ribbons
  const lOffset = {};
  sources.forEach(n => { lOffset[n.id] = 0; });
  const rOffset = {};
  dests.forEach(n => { rOffset[n.id] = 0; });

  const ribbons = links.filter(l => !highlightFrom || l.from === highlightFrom).map(link => {
    const srcH = lH[link.from];
    const linkH = Math.max(2, (link.value / leftTotal) * leftAvail);

    const sx = LEFT_X + NODE_W;
    const sy = lPos[link.from] + lOffset[link.from];
    const dx = RIGHT_X;
    const dy = rPos[link.to] + rOffset[link.to];

    lOffset[link.from] += linkH;
    rOffset[link.to] += linkH;

    const mx = (sx + dx) / 2;
    const path = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${dy}, ${dx} ${dy} L ${dx} ${dy + linkH} C ${mx} ${dy + linkH}, ${mx} ${sy + linkH}, ${sx} ${sy + linkH} Z`;

    const srcNode = sources.find(n => n.id === link.from);
    const isHighlighted = hovered === link.from || hovered === null;
    const isPremium = link.to === 'premium';

    return { path, color: srcNode?.color || '#6366f1', link, linkH, sx, sy, dx, dy, isHighlighted, isPremium };
  });

  // ── also compute non-highlighted ribbons for context (dimmed)
  const allRibbons = links.map(link => {
    const srcH = lH[link.from];
    const linkH = Math.max(2, (link.value / leftTotal) * leftAvail);
    const sx = LEFT_X + NODE_W, sy = lPos[link.from] + (lOffset[link.from] || 0);
    const dx = RIGHT_X, dy = rPos[link.to] + (rOffset[link.to] || 0);
    const mx = (sx + dx) / 2;
    const path = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${dy}, ${dx} ${dy} L ${dx} ${dy + linkH} C ${mx} ${dy + linkH}, ${mx} ${sy + linkH}, ${sx} ${sy + linkH} Z`;
    const srcNode = sources.find(n => n.id === link.from);
    return { path, color: srcNode?.color, link, linkH };
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 600 }}>
        {/* Ribbons */}
        {ribbons.map((r, i) => (
          <path
            key={i}
            d={r.path}
            fill={r.color}
            opacity={hovered === null ? (r.isPremium ? 0.55 : 0.32) : (hovered === r.link.from ? (r.isPremium ? 0.75 : 0.55) : 0.08)}
            style={{ cursor: 'pointer', transition: 'opacity 0.25s' }}
            onMouseEnter={() => setHovered(r.link.from)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* % labels on ribbons */}
        {ribbons.map((r, i) => {
          if (r.linkH < 18) return null;
          const mx = (r.sx + r.dx) / 2;
          const my = r.sy + r.linkH / 2;
          return (
            <text key={`lbl-${i}`} x={mx} y={my} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize={10} fontWeight={700} opacity={hovered === r.link.from || hovered === null ? 0.9 : 0.2}
              pointerEvents="none">
              {r.link.pct}%
            </text>
          );
        })}

        {/* Left nodes (source shows) */}
        {sources.map(n => (
          <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <rect x={LEFT_X} y={lPos[n.id]} width={NODE_W} height={lH[n.id]} rx={8}
              fill={n.color} opacity={hovered === n.id || hovered === null ? 1 : 0.3}
              style={{ transition: 'opacity 0.25s' }} />
            {lH[n.id] > 28 && (
              <>
                <text x={LEFT_X + 10} y={lPos[n.id] + Math.min(lH[n.id] / 2, 24)} fill="white"
                  fontSize={11} fontWeight={700} dominantBaseline="middle">
                  {n.emoji} {n.shortLabel}
                </text>
                {lH[n.id] > 44 && (
                  <text x={LEFT_X + 10} y={lPos[n.id] + Math.min(lH[n.id] / 2, 24) + 15}
                    fill="rgba(255,255,255,0.65)" fontSize={9} dominantBaseline="middle">
                    {(n.value / 1000).toFixed(0)}K listeners
                  </text>
                )}
              </>
            )}
          </g>
        ))}

        {/* Right nodes (destinations) */}
        {dests.map(n => (
          <g key={n.id}>
            <rect x={RIGHT_X} y={rPos[n.id]} width={NODE_W} height={rH[n.id]} rx={8}
              fill={n.color}
              opacity={n.id === 'premium' ? 1 : n.id === 'churned' ? 0.5 : 0.85}
              style={{ filter: n.id === 'premium' ? 'drop-shadow(0 0 10px rgba(16,185,129,0.6))' : 'none' }} />
            {rH[n.id] > 20 && (
              <text x={RIGHT_X + 10} y={rPos[n.id] + Math.min(rH[n.id] / 2, 20)}
                fill="white" fontSize={11} fontWeight={700} dominantBaseline="middle">
                {n.shortLabel}
              </text>
            )}
            {rH[n.id] > 38 && (
              <text x={RIGHT_X + 10} y={rPos[n.id] + Math.min(rH[n.id] / 2, 20) + 14}
                fill="rgba(255,255,255,0.65)" fontSize={9} dominantBaseline="middle">
                {(destValues[n.id] / 1000).toFixed(0)}K users
              </text>
            )}
          </g>
        ))}

        {/* Column labels */}
        <text x={LEFT_X + NODE_W / 2} y={H + 20} textAnchor="middle" fill="#475569" fontSize={11} fontWeight={600}>Started With</text>
        <text x={RIGHT_X + NODE_W / 2} y={H + 20} textAnchor="middle" fill="#475569" fontSize={11} fontWeight={600}>Moved To</text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LISTENING DNA TAB
══════════════════════════════════════════════════════════════════ */
function ListeningDNATab() {
  const [selected, setSelected] = useState('binger');
  const arch = archetypes.find(a => a.id === selected);

  return (
    <>
      {/* Archetype selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {archetypes.map(a => (
          <button key={a.id} onClick={() => setSelected(a.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '12px 16px', borderRadius: 14,
            border: `2px solid ${selected === a.id ? a.color : 'transparent'}`,
            background: selected === a.id ? a.color + '18' : 'var(--bg-card)',
            cursor: 'pointer', transition: 'all 0.2s', minWidth: 90,
            boxShadow: selected === a.id ? `0 0 20px ${a.color}30` : 'none',
          }}>
            <span style={{ fontSize: 28 }}>{a.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: selected === a.id ? a.color : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
              {a.name.split(' ').slice(1).join(' ')}
            </span>
          </button>
        ))}
      </div>

      {arch && (
        <>
          {/* Hero bar */}
          <div style={{
            background: `linear-gradient(135deg, ${arch.color}18, ${arch.color}06)`,
            border: `1px solid ${arch.color}40`, borderRadius: 18, padding: '22px 26px',
            marginBottom: 22, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: 52 }}>{arch.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{arch.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>"{arch.tagline}"</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Population', value: (arch.population / 1000000).toFixed(1) + 'M', sub: arch.populationPct + '% of users' },
                  { label: 'D30 Retention', value: arch.d30Retention + '%', sub: 'vs 14.2% avg' },
                  { label: 'Session Length', value: arch.avgSessionMin + ' min', sub: 'avg per session' },
                  { label: 'Conversion', value: arch.conversionRate + '%', sub: 'to premium' },
                  { label: 'ARPU', value: '₹' + arch.arpu, sub: 'per month' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: arch.color + '12', border: `1px solid ${arch.color}25`,
                    borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 90
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: arch.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main 3-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>

            {/* ── Genre Radar ── */}
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${arch.color}25`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🎭 Genre DNA</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Affinity score per genre</div>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={arch.genreAffinity} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="genre" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Affinity" dataKey="score" stroke={arch.color} fill={arch.color} fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: arch.color }} />
                  <Tooltip formatter={(v) => [v + '%', 'Affinity']}
                    contentStyle={{ background: '#0d1526', border: `1px solid ${arch.color}40`, borderRadius: 8, fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Clock Heatmap ── */}
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${arch.color}25`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>⏰ Listening Clock</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>24-hour activity pattern</div>
              </div>
              <ClockHeatmap data={arch.hourlyIntensity} color={arch.color} size={170} />
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Peak days:</div>
                {arch.peakDays.map(d => (
                  <span key={d} style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: arch.color + '20', color: arch.color
                  }}>{d}</span>
                ))}
              </div>
            </div>

            {/* ── Binge Pattern ── */}
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${arch.color}25`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>📻 Binge Pattern</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18 }}>How they consume content</div>

              {/* Episodes per session */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Episodes per session</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: arch.color }}>{arch.episodesPerSession}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${(arch.episodesPerSession / 8) * 100}%`, background: arch.color, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>1 ep</span><span>8 eps (max)</span>
                </div>
              </div>

              {/* Days active per week */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Days active / week</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: arch.color }}>{arch.daysActivePerWeek}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${(arch.daysActivePerWeek / 7) * 100}%`, background: arch.color, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>1 day</span><span>7 days</span>
                </div>
              </div>

              {/* Session length */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Avg session length</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: arch.color }}>{arch.avgSessionMin} min</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${Math.min((arch.avgSessionMin / 120) * 100, 100)}%`, background: arch.color, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>0</span><span>120 min</span>
                </div>
              </div>

              {/* Shows per week */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Shows explored / week</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: arch.color }}>{arch.avgShowsPerWeek}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${(arch.avgShowsPerWeek / 7) * 100}%`, background: arch.color, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row — conversion drivers + insights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

            {/* Conversion drivers */}
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${arch.color}25`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>💎 What Converts Them</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Most effective premium triggers for this segment</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {arch.conversionDrivers.map((d, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{d.trigger}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: d.color }}>{d.effectiveness}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${d.effectiveness}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}88)`, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${arch.color}25`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>💡 Behavioral Insights</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Key patterns that define this archetype</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {arch.insights.map((ins, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, padding: '10px 12px',
                    background: arch.color + '0e', border: `1px solid ${arch.color}20`,
                    borderRadius: 10, alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>◆</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins}</span>
                  </div>
                ))}
              </div>
              {/* Top shows */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>FAVOURITE SHOWS</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {arch.topShows.map(s => (
                    <span key={s} style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-secondary)'
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DISCOVERY FLOW TAB
══════════════════════════════════════════════════════════════════ */
function DiscoveryFlowTab() {
  const [highlight, setHighlight] = useState(null);

  return (
    <>
      {/* Intro */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(16,185,129,0.06))',
        border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '18px 22px', marginBottom: 22
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🌊 Cross-Show Discovery Flow</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 700, lineHeight: 1.7 }}>
          After listeners complete or drop a show — where do they go next? The width of each flow ribbon represents how many users took that path.
          <strong style={{ color: '#a5b4fc' }}> Hover on a source show</strong> to isolate its flows.
          <strong style={{ color: '#34d399' }}> Green = premium conversion </strong> — your highest-value path.
        </div>
      </div>

      {/* Show filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Filter by show:</span>
        <button onClick={() => setHighlight(null)} style={{
          padding: '5px 14px', borderRadius: 20, border: `1px solid ${highlight === null ? '#6366f1' : 'var(--border-subtle)'}`,
          background: highlight === null ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
          color: highlight === null ? '#818cf8' : 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontWeight: 600
        }}>All Shows</button>
        {discoveryNodes.sources.map(s => (
          <button key={s.id} onClick={() => setHighlight(highlight === s.id ? null : s.id)} style={{
            padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${highlight === s.id ? s.color : 'var(--border-subtle)'}`,
            background: highlight === s.id ? s.color + '20' : 'var(--bg-card)',
            color: highlight === s.id ? s.color : 'var(--text-muted)', cursor: 'pointer', fontSize: 11, fontWeight: 600
          }}>
            {s.emoji} {s.shortLabel}
          </button>
        ))}
      </div>

      {/* Sankey */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '24px 20px', marginBottom: 20 }}>
        <SankeyFlow nodes={discoveryNodes} links={discoveryLinks} highlightFrom={highlight} />
        <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Hover over source shows to isolate flow paths. Width = number of users taking that path.
        </div>
      </div>

      {/* Gateway to Premium ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>🏆 Gateway to Premium Ranking</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18 }}>Which show converts the most listeners to paid subscribers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {gatewayInsights.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: i === 0 ? 'linear-gradient(135deg,#fcd34d,#f59e0b)' : i === 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: i === 0 ? '#78350f' : 'var(--text-muted)', flexShrink: 0
                }}>#{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{g.emoji} {g.show}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: g.color }}>{g.premiumRate}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 4 }}>
                    <div style={{ height: '100%', width: `${(g.premiumRate / 50) * 100}%`, background: g.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{g.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key insights */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>💡 Discovery Insights</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18 }}>What the flow tells us about content strategy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { type: 'positive', icon: '✅', text: 'Mahabharata Retold is the single best premium converter at 41% — expand mythology content to capture more of this audience' },
              { type: 'positive', icon: '🔁', text: 'Ishq → Crime is the largest cross-show flow (24%) — these genres are complements, not competitors. Program them together.' },
              { type: 'warning', icon: '⚠️', text: 'Kahaani has 36% direct churn — highest on platform. Users leaving Kahaani rarely find another show. Urgent: improve show quality or recommendation engine.' },
              { type: 'info', icon: '💡', text: 'Crime Patrol acts as a "hub" — it receives inflows from multiple shows. Position it as the gateway series for new users.' },
              { type: 'positive', icon: '🎯', text: 'Horror fans (Raat Ka Safar) convert at 22% — above-average. Ad-free listening resonates strongly with this genre\'s atmosphere.' },
            ].map((ins, i) => {
              const colors = { positive: '#10b981', warning: '#f59e0b', info: '#06b6d4' };
              const c = colors[ins.type];
              return (
                <div key={i} style={{
                  background: c + '0a', border: `1px solid ${c}25`,
                  borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{ins.icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function AudiencePage() {
  const [activeTab, setActiveTab] = useState('dna');
  const tabs = [
    { id: 'dna',       label: '🧬 Listening DNA' },
    { id: 'discovery', label: '🌊 Discovery Flow' },
  ];

  return (
    <AppShell>
      <main className="page-body">

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  🧬 Audience Intelligence
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Who your listeners really are — and how they move through your content universe
                </p>
              </div>
              <span style={{
                fontSize: 11, color: '#a5b4fc', background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '5px 14px', fontWeight: 600
              }}>
                18.3M users · May 2026
              </span>
            </div>
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  color: activeTab === t.id ? '#818cf8' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.15s', marginBottom: -1
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {activeTab === 'dna' && <ListeningDNATab />}
          {activeTab === 'discovery' && <DiscoveryFlowTab />}

        </main>
    </AppShell>
  );
}
