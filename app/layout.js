import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Cadence — Streaming Analytics Copilot',
  description: 'Self-serve product analytics for a music/audio streaming service. Computed metrics, a grounded AI copilot, and live text-to-SQL over the public Sparkify event dataset.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
