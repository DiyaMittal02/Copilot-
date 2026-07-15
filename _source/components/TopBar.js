'use client';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Real-time product metrics overview · PocketFM Audio Platform' },
  '/copilot': { title: 'AI Copilot', subtitle: 'Ask anything about your product metrics — powered by Gemini AI' },
  '/metrics': { title: 'Metric Library', subtitle: '50+ product metrics with definitions, formulas & benchmarks' },
  '/experiments': { title: 'Experiment Planner', subtitle: 'Design A/B tests with AI-generated hypotheses & success criteria' },
  '/upload': { title: 'Data Upload', subtitle: 'Upload CSV data for instant AI-powered analysis' },
  '/reports': { title: 'Report Generator', subtitle: 'One-click AI-generated weekly & monthly product reports' },
};

export default function TopBar({ pathname }) {
  const page = pageTitles[pathname] || { title: 'Product Insights', subtitle: 'PocketFM Copilot' };
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{page.title}</h1>
        <p className="topbar-subtitle">{page.subtitle}</p>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">🗓 {dateStr}</span>
      </div>
    </header>
  );
}
