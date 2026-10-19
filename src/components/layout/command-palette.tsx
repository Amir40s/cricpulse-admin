'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Search,
  BarChart3,
  Cpu,
  Coins,
  LayoutDashboard,
  Plus,
  Sun,
  Moon,
  LogOut,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { polls, theme, toggleTheme, logout, testApiConnection, addToast } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query and selected index on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search items list
  const results = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();

    const navigationItems = [
      {
        id: 'nav-overview',
        type: 'Navigation',
        title: 'Operations Overview',
        subtitle: 'Dashboard home, live stats & activity',
        icon: LayoutDashboard,
        action: () => router.push('/'),
      },
      {
        id: 'nav-polls',
        type: 'Navigation',
        title: 'Fan Polls Management',
        subtitle: 'Manage live voting, schedules & analytics',
        icon: BarChart3,
        action: () => router.push('/polls'),
      },
      {
        id: 'nav-cricket-api',
        type: 'Navigation',
        title: 'Cricket API Gateway',
        subtitle: 'API rate limits, tokens & cache TTL',
        icon: Cpu,
        action: () => router.push('/cricket-api'),
      },
      {
        id: 'nav-monetization',
        type: 'Navigation',
        title: 'AdMob & Monetization',
        subtitle: 'Ad unit identifiers & serving mode',
        icon: Coins,
        action: () => router.push('/monetization'),
      },
    ];

    const actionItems = [
      {
        id: 'act-new-poll',
        type: 'Quick Action',
        title: 'Create New Poll',
        subtitle: 'Launch a new mobile fan engagement poll',
        icon: Plus,
        action: () => {
          router.push('/polls');
          addToast('Opening poll creation...', 'info');
        },
      },
      {
        id: 'act-ping-api',
        type: 'Quick Action',
        title: 'Ping Cricket Match Engine',
        subtitle: 'Test API latency and health status',
        icon: Cpu,
        action: async () => {
          addToast('Pinging match gateway...', 'info');
          await testApiConnection();
        },
      },
      {
        id: 'act-toggle-theme',
        type: 'Quick Action',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle theme display appearance',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => toggleTheme(),
      },
      {
        id: 'act-logout',
        type: 'Quick Action',
        title: 'Sign Out Administrator',
        subtitle: 'End secure session and exit to login',
        icon: LogOut,
        action: () => logout(),
      },
    ];

    const pollItems = polls.map((p) => ({
      id: `poll-${p.id}`,
      type: 'Poll',
      title: p.question,
      subtitle: `${p.category} • ${p.totalVotes.toLocaleString()} votes • ${p.status.toUpperCase()}`,
      icon: BarChart3,
      action: () => router.push('/polls'),
    }));

    const all = [...navigationItems, ...actionItems, ...pollItems];

    if (!cleanQ) return all.slice(0, 8);

    return all
      .filter(
        (item) =>
          item.title.toLowerCase().includes(cleanQ) ||
          item.subtitle.toLowerCase().includes(cleanQ) ||
          item.type.toLowerCase().includes(cleanQ)
      )
      .slice(0, 8);
  }, [query, polls, theme, router, toggleTheme, logout, testApiConnection, addToast]);

  const handleSelect = (item: (typeof results)[0]) => {
    item.action();
    onClose();
  };

  // Keyboard navigation inside list
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white/95 dark:bg-[#090e1a]/95 border border-slate-200 dark:border-slate-700/80 shadow-2xl backdrop-blur-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search polls, users, or matches..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p>No results found for "{query}"</p>
              <p className="text-[11px] text-slate-500">Try searching for polls, settings, or actions</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 dark:text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5' : 'text-slate-400 dark:text-slate-600'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]">
              esc
            </kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
