'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/copilot', icon: '🤖', label: 'AI Copilot' },
  { href: '/metrics', icon: '📚', label: 'Metric Library' },
  { href: '/experiments', icon: '🧪', label: 'Experiment Planner' },
  { href: '/upload', icon: '📁', label: 'Data Upload' },
  { href: '/reports', icon: '📝', label: 'Report Generator' },
];

export default function Sidebar({ apiKeySet }) {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎯</div>
        <div>
          <div className="sidebar-logo-text">PocketFM</div>
          <div className="sidebar-logo-sub">Product Insights Copilot</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Analytics</div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            id={`nav-${item.href.slice(1)}`}
            className={`nav-link${pathname === item.href || pathname.startsWith(item.href + '/') ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-api-badge">
          <div className={`api-dot${apiKeySet ? '' : ' inactive'}`} />
          {apiKeySet ? 'Gemini AI Connected' : 'API Key Required'}
        </div>
      </div>
    </aside>
  );
}
