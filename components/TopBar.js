'use client';
import { useState, useEffect } from 'react';

const pageTitles = {
  '/dashboard':  { title: 'Dashboard',            subtitle: 'Real-time product metrics overview · PocketFM Audio Platform' },
  '/retention':  { title: 'Retention Analytics',  subtitle: 'Daily retention curves, cohort heatmaps, drop-off analysis & benchmarks' },
  '/audience':   { title: 'Audience Intelligence',subtitle: 'Listening DNA profiles, genre affinity, binge patterns & cross-show discovery flow' },
  '/alerts':     { title: 'Churn Alerts & Feedback', subtitle: 'Real-time anomaly monitoring alerts & user feedback analysis' },
  '/optimization': { title: 'Decision Support & Optimization', subtitle: 'Simulate coin pricing mechanics & optimize show release schedules' },
  '/diagnostics': { title: 'Playback Diagnostics', subtitle: 'Analyze latency, audio buffering, and technical churn' },
  '/copilot':    { title: 'AI Copilot',            subtitle: 'Ask anything about your product metrics — powered by Groq AI' },
  '/metrics':    { title: 'Metric Library',        subtitle: '50+ product metrics with definitions, formulas & benchmarks' },
  '/experiments':{ title: 'Experiment Planner',   subtitle: 'Design A/B tests with AI-generated hypotheses & success criteria' },
  '/upload':     { title: 'Data Upload',           subtitle: 'Upload CSV data for instant AI-powered analysis' },
  '/reports':    { title: 'Report Generator',      subtitle: 'One-click AI-generated weekly & monthly product reports' },
};

export default function TopBar({ pathname, onMenuClick }) {
  const page = pageTitles[pathname] || { title: 'Product Insights', subtitle: 'PocketFM Copilot' };
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  // Theme states
  const [theme, setTheme] = useState('dark');

  // Load initial theme from localStorage on client side
  useEffect(() => {
    const savedTheme = localStorage.getItem('pfmt_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('pfmt_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  return (
    <header className="topbar">
      {/* Hamburger — only visible on mobile via CSS */}
      <button
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      <div className="topbar-left" style={{ flex: 1, minWidth: 0 }}>
        <h1 className="topbar-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {page.title}
        </h1>
        <p className="topbar-subtitle">{page.subtitle}</p>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid var(--border-subtle)', background: 'var(--bg-card)',
            cursor: 'pointer', color: 'var(--text-primary)', fontSize: 16,
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <span className="topbar-date">🗓 {dateStr}</span>
      </div>
    </header>
  );
}
