'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { pricingPresets, optimizerShows } from '@/lib/optimizationData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function OptimizationPage() {
  // Simulator States
  const [coinCost, setCoinCost] = useState(10); // range 2 to 20
  const [freeKeys, setFreeKeys] = useState(2);   // range 0 to 8
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [presetName, setPresetName] = useState('Custom Model');

  // Optimizer States
  const [selectedShow, setSelectedShow] = useState('ishq');
  const currentShow = optimizerShows.find(s => s.id === selectedShow);

  // Math simulation logic mapping inputs to realistic estimated metrics
  const simulateMetrics = () => {
    // Baseline logic
    const coinFactor = (20 - coinCost) / 10; // high cost = lower retention
    const freeFactor = (freeKeys + 1) / 3;    // more free = higher retention
    const adBonus = adsEnabled ? 1.15 : 1.0;

    // D1
    let d1 = Math.min(Math.max(40 + (coinFactor * 10) + (freeFactor * 8) * adBonus, 30), 85);
    // D7
    let d7 = Math.min(Math.max(d1 * (0.4 + (freeFactor * 0.15)), 15), 55);
    // D30
    let d30 = Math.min(Math.max(d7 * (0.35 + (coinFactor * 0.1)), 5), 35);
    // Conversion
    let conversion = Math.min(Math.max(12 - (coinCost * 0.5) + (adsEnabled ? 2.5 : 0), 2), 25);
    // ARPU
    let arpu = Math.min(Math.max((coinCost * 10) * (conversion / 10) * (d7 / 30) * (adsEnabled ? 1.2 : 1.0), 30), 180);
    // LTV
    let ltv = arpu * (d30 / 10);

    return {
      d1: parseFloat(d1.toFixed(1)),
      d7: parseFloat(d7.toFixed(1)),
      d30: parseFloat(d30.toFixed(1)),
      conversion: parseFloat(conversion.toFixed(1)),
      arpu: parseFloat(arpu.toFixed(1)),
      ltv: parseFloat(ltv.toFixed(1))
    };
  };

  const simulated = simulateMetrics();

  const handleApplyPreset = (preset) => {
    setCoinCost(preset.coinCost);
    setFreeKeys(preset.dailyFreeKeys);
    setAdsEnabled(preset.adKeysEnabled);
    setPresetName(preset.name);
  };

  // Graph Data
  const chartData = [
    { name: 'D1 Retention', Current: 48.3, Simulated: simulated.d1 },
    { name: 'D7 Retention', Current: 26.1, Simulated: simulated.d7 },
    { name: 'D30 Retention', Current: 14.2, Simulated: simulated.d30 },
  ];

  return (
    <AppShell>
      <main className="page-body">
        
        {/* Intro */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(6,182,212,0.06))',
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '18px 22px', marginBottom: 24
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🎚️ Decision Support Tools</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 800, lineHeight: 1.7 }}>
            Optimize pricing frictions and release scheduling. Simulate how changing your coin requirements affects user retention, ARPU, and LTV, or map content releases to your target demographics listening routines.
          </div>
        </div>

        <div className="chart-grid-3">
          
          {/* SIMULATOR */}
          <div className="card">
            <div className="section-header" style={{ marginBottom: 20 }}>
              <div>
                <div className="section-title">💰 Coin Pricing & Friction Simulator</div>
                <div className="section-subtitle">Model coin thresholds, key gates, and ad bonuses</div>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {pricingPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${presetName === preset.name ? '#6366f1' : 'var(--border-subtle)'}`,
                    background: presetName === preset.name ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.01)',
                    color: presetName === preset.name ? '#818cf8' : 'var(--text-secondary)',
                    fontSize: 11, cursor: 'pointer', fontWeight: 600
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Coin Cost per Locked Episode</span>
                  <strong style={{ color: '#818cf8' }}>₹{coinCost} / ep</strong>
                </div>
                <input 
                  type="range" min="2" max="20" 
                  value={coinCost} 
                  onChange={e => { setCoinCost(parseInt(e.target.value)); setPresetName('Custom Model'); }}
                  style={{ width: '100%', accentColor: '#6366f1' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily Free Auto-Keys (Unlocked Chapters)</span>
                  <strong style={{ color: '#8b5cf6' }}>{freeKeys} Keys / day</strong>
                </div>
                <input 
                  type="range" min="0" max="8" 
                  value={freeKeys} 
                  onChange={e => { setFreeKeys(parseInt(e.target.value)); setPresetName('Custom Model'); }}
                  style={{ width: '100%', accentColor: '#8b5cf6' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Watch Ads for Extra Keys</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Allow users to unlock episodes by watching video ads</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={adsEnabled} 
                  onChange={e => { setAdsEnabled(e.target.checked); setPresetName('Custom Model'); }}
                  style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Conv. Rate</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#06b6d4' }}>{simulated.conversion}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Est. ARPU</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>₹{simulated.arpu}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Proj. LTV</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>₹{simulated.ltv}</div>
              </div>
            </div>

            {/* Chart */}
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Current" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RELEASE OPTIMIZER */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <div>
                <div className="section-title">⏱️ Show Release Timing Optimizer</div>
                <div className="section-subtitle">Match release schedules to listener routines</div>
              </div>
            </div>

            {/* Show selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {optimizerShows.map(show => (
                <div
                  key={show.id}
                  onClick={() => setSelectedShow(show.id)}
                  style={{
                    padding: 14, borderRadius: 12, cursor: 'pointer',
                    border: `1px solid ${selectedShow === show.id ? '#8b5cf6' : 'var(--border-subtle)'}`,
                    background: selectedShow === show.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.01)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{show.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                      {show.engagementBoost}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target: {show.targetAudience}</div>
                </div>
              ))}
            </div>

            {/* Show Insights details */}
            {currentShow && (
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: 12 }}>
                  📅 Release Optimization Strategy
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Release</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', marginTop: 2 }}>{currentShow.currentSchedule}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Optimal Strategy</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginTop: 2 }}>
                      {currentShow.optimalDays.join(' & ')} @ {currentShow.optimalHour}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong>Core Rationale:</strong> {currentShow.insights}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </AppShell>
  );
}
