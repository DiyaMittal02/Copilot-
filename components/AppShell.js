'use client';
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * AppShell — wraps every page with the responsive Sidebar + TopBar.
 * Manages sidebar open/close state centrally so every page benefits
 * without any per-page boilerplate.
 *
 * Usage in a page:
 *   import AppShell from '@/components/AppShell';
 *   export default function MyPage() {
 *     return <AppShell><main className="page-body">...</main></AppShell>;
 *   }
 */
export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="main-content">
        <TopBar pathname={pathname} onMenuClick={openSidebar} />
        {children}
      </div>
    </div>
  );
}
