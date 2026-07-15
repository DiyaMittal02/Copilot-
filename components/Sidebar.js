'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/retention', icon: '📈', label: 'Retention' },
  { href: '/audience', icon: '🧬', label: 'Audience Intel' },
  { href: '/alerts', icon: '🚨', label: 'Churn Alerts' },
  { href: '/optimization', icon: '🎚️', label: 'Decision Tools' },
  { href: '/diagnostics', icon: '🛠️', label: 'Diagnostics' },
  { href: '/copilot', icon: '🤖', label: 'AI Copilot' },
  { href: '/metrics', icon: '📚', label: 'Metric Library' },
  { href: '/experiments', icon: '🧪', label: 'Experiment Planner' },
  { href: '/upload', icon: '📁', label: 'Data Upload' },
  { href: '/reports', icon: '📝', label: 'Report Generator' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => { onClose?.(); }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Dark backdrop — mobile only */}
      <div
        className={`sidebar-backdrop${isOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎯</div>
          <div style={{ flex: 1 }}>
            <div className="sidebar-logo-text">PocketFM</div>
            <div className="sidebar-logo-sub">Product Insights Copilot</div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid var(--border-subtle)', background: 'var(--bg-card)',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16,
              flexShrink: 0,
            }}
            className="hamburger-btn"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
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

        <div className="sidebar-footer" />
      </aside>
    </>
  );
}
