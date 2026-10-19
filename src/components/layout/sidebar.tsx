'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Cpu,
  Coins,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '@/lib/store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { polls, apiSettings, logout, currentUser } = useApp();

  const activePollsCount = polls.filter((p) => p.status === 'active').length;

  const navigationGroups = [
    {
      label: 'Core Management',
      items: [
        {
          name: 'Overview',
          href: '/',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: 'Fan Polls',
          href: '/polls',
          icon: BarChart3,
          badge: activePollsCount > 0 ? `${activePollsCount} Active` : null,
          badgeType: 'emerald',
        },
      ],
    },
    {
      label: 'Integrations & Revenue',
      items: [
        {
          name: 'Cricket API Gateway',
          href: '/cricket-api',
          icon: Cpu,
          badge: apiSettings.lastPingStatus === 'healthy' ? 'Online' : 'Degraded',
          badgeType: apiSettings.lastPingStatus === 'healthy' ? 'emerald' : 'amber',
        },
        {
          name: 'AdMob & Monetization',
          href: '/monetization',
          icon: Coins,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Docked Enterprise Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#070b14] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
              <div className="relative h-8 w-auto">
                <Image
                  src="/logo-cric.png"
                  alt="CricPulse Logo"
                  width={110}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 shrink-0 font-medium">
                Admin
              </span>
            </Link>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Structure */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {group.label}
                </h3>
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 font-semibold dark:bg-slate-800/80 dark:text-white border-l-2 border-emerald-600 dark:border-emerald-500 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              item.badgeType === 'emerald'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                : item.badgeType === 'amber'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Card & System Status Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#060a12]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-emerald-600/10 dark:bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                AD
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.name || 'Operations Lead'}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {currentUser?.email || 'admin@cricpulse.app'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              API Services Operational
            </span>
            <span className="font-mono">v1.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
