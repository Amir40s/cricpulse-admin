import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { ToastContainer } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'CricPulse Admin | Operations & Control Center',
  description: 'Enterprise control panel for CricPulse Android App. Manage live polls, automated RSS feeds, Cricket APIs, and AdMob monetization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-500">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
