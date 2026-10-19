'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  Cpu,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { CommandPalette } from '@/components/layout/command-palette';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  title?: string;
  subtitle?: string;
  breadcrumbs?: string[];
}

export function Header({ onOpenMobileMenu, title, subtitle, breadcrumbs }: HeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme, openMobileSidebar, currentUser, logout, addToast } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Global shortcut to open/close CommandPalette with Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleOpenMobile = () => {
    if (onOpenMobileMenu) onOpenMobileMenu();
    openMobileSidebar();
  };

  const handleQuickRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    addToast('Engine cache & telemetry refreshed.', 'info');
    setIsRefreshing(false);
    setIsProfileOpen(false);
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Floating Header Container with Top & Side Padding */}
      <div className="sticky top-0 z-30 w-full px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1 pointer-events-none transition-all duration-200">
        <header className="pointer-events-auto max-w-7xl mx-auto h-14 sm:h-16 w-full rounded-full border border-slate-200/90 dark:border-slate-800/80 bg-white/85 dark:bg-[#060a12]/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/25 px-3 sm:px-5 lg:px-6 flex items-center justify-between ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05] transition-colors duration-200">
          
          {/* Left Section: Mobile Drawer Toggle + Search Pill */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2 sm:pr-4">
            {/* Mobile hamburger button */}
            <button
              onClick={handleOpenMobile}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 lg:hidden shrink-0 transition-colors"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search trigger with underline only (no box border), fully responsive across light & dark modes */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center justify-between gap-3 w-full max-w-[190px] sm:max-w-xs md:max-w-sm lg:max-w-md h-9 px-1.5 border-b border-slate-300 hover:border-slate-600 dark:border-slate-700/70 dark:hover:border-slate-300 bg-transparent text-left transition-colors duration-150 focus:outline-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300 shrink-0 transition-colors" />
                <span className="text-xs text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200 truncate font-normal">
                  Search polls, users, or matches...
                </span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-mono text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300 bg-slate-100 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 rounded-xs shrink-0">
                <span className="text-[11px] leading-none">⌘</span> K
              </kbd>
            </button>
          </div>

          {/* Right Section: Theme Toggle + Profile Pill (NO Bell Icon as requested) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle (Sun/Moon) supporting both Light and Dark themes */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0b1324] hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-amber-400 transition-colors shadow-2xs dark:shadow-inner"
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
              )}
            </button>

            {/* Profile Pill with Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0b1324] hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs dark:shadow-inner cursor-pointer select-none"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                {/* Blue circular avatar with 'A' */}
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0">
                  A
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden xs:inline">
                  Admin
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180 text-slate-800 dark:text-slate-200' : ''
                  }`}
                />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#090e1a]/95 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Admin info header */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shadow-xs shrink-0">
                        A
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                          <span>{currentUser?.name || 'Administrator'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser?.email || 'admin@cricpulse.app'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>{currentUser?.role || 'Super Admin'}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">Active</span>
                    </div>
                  </div>

                  {/* Fast Navigation Links */}
                  <div className="space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Operations Overview</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/polls');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Fan Polls Management</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/cricket-api');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cricket API Gateway</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/monetization');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                    >
                      <Coins className="w-3.5 h-3.5 text-slate-400" />
                      <span>AdMob & Monetization</span>
                    </button>

                    {/* Cache Refresh Action */}
                    <button
                      onClick={handleQuickRefresh}
                      disabled={isRefreshing}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
                      <span>Purge & Sync Cache</span>
                    </button>
                  </div>

                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800/80" />

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left text-xs font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out Administrator</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Global Command & Search Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
