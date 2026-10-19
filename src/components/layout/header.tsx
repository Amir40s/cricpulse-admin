'use client';

import React from 'react';
import { Menu, RefreshCw, ExternalLink, Sun, Moon } from 'lucide-react';
import { useApp } from '@/lib/store';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
}

export function Header({ onOpenMobileMenu, title, subtitle, breadcrumbs = ['Dashboard'] }: HeaderProps) {
  const { apiSettings, addToast, theme, toggleTheme } = useApp();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    addToast('Match data cache and engine status refreshed.', 'info');
    setIsRefreshing(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-150">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 lg:hidden"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {/* Breadcrumb line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-0.5">
            <span>CricPulse</span>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{breadcrumbs[0]}</span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Operational Status, Theme Toggle & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Engine status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
            {apiSettings.lastPingStatus === 'healthy' ? 'API Online' : 'Check API'}
          </span>
        </div>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Sync Action */}
        <button
          onClick={handleGlobalRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          <span className="hidden sm:inline">Refresh Cache</span>
        </button>

        {/* External Link */}
        <a
          href="https://play.google.com/store/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
        >
          <span>Android App</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </header>
  );
}
