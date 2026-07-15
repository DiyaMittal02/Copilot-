'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import '@/app/globals.css';

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  // Read API key from localStorage
  const apiKeySet = typeof window !== 'undefined' && !!localStorage.getItem('gemini_api_key');
  return (
    <div className="app-layout">
      <Sidebar apiKeySet={apiKeySet} />
      <div className="main-content">
        <TopBar pathname={pathname} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
