'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import {
  BarChart3,
  Cpu,
  Coins,
  ArrowRight,
  TrendingUp,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const {
    polls,
    apiSettings,
    adMobSettings,
    testApiConnection,
    togglePollStatus,
  } = useApp();

  const [isTestingApi, setIsTestingApi] = useState(false);

  // Key metrics
  const activePolls = polls.filter((p) => p.status === 'active');
  const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);

  const handleTestApi = async () => {
    setIsTestingApi(true);
    await testApiConnection();
    setIsTestingApi(false);
  };

  const quotaPercent = Math.min(
    100,
    Math.round((apiSettings.requestsUsedToday / apiSettings.rateLimitPerDay) * 100)
  );

  // Activity events
  const recentActivities = [
    {
      title: 'ICC Champions Trophy Poll Published',
      category: 'POLL',
      time: '12m ago',
      icon: BarChart3,
    },
    {
      title: 'Match Engine Gateway Latency Verified (142ms)',
      category: 'GATEWAY',
      time: '45m ago',
      icon: Cpu,
    },
    {
      title: 'AdMob Frequency Cap Synced to Mobile App',
      category: 'ADS',
      time: '2h ago',
      icon: Coins,
    },
    {
      title: 'Shaheen vs Kohli Fan Poll reached 1,250 votes milestone',
      category: 'ENGAGEMENT',
      time: '3h ago',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-full transition-colors duration-150">
      <Header
        onOpenMobileMenu={() => {}}
        title="Operations Overview"
        breadcrumbs={['Overview']}
      />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Operations Center
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live cricket fan polls, API gateway quotas, and mobile monetization status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestApi}
              disabled={isTestingApi}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shadow-2xs disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-pulse text-emerald-500' : 'text-slate-400'}`} />
              <span>{isTestingApi ? 'Pinging Gateway...' : 'Ping Match Engine'}</span>
            </button>

            <Link
              href="/polls"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Poll</span>
            </Link>
          </div>
        </div>

        {/* 3 Sports-Tech KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Active Polls */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold tracking-wider uppercase">Active Fan Polls</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {activePolls.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">live in app</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{totalVotes.toLocaleString()} total votes cast</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">{polls.length} total</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (activePolls.length / Math.max(1, polls.length)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Match API Gateway */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold tracking-wider uppercase">API Quota Balance</span>
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {(apiSettings.rateLimitPerDay - apiSettings.requestsUsedToday).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">calls left today</span>
            </div>

            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium">{apiSettings.provider.toUpperCase()}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {apiSettings.cacheTtlMinutes}m Cache TTL
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-1.5 rounded-full"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: AdMob Monetization */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold tracking-wider uppercase">AdMob Monetization</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {adMobSettings.adsEnabledGlobally ? 'Active' : 'Paused'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                adMobSettings.testMode
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              }`}>
                {adMobSettings.testMode ? 'QA Test Mode' : 'Production Live'}
              </span>
            </div>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>3 Units: Banner, Interstitial, Native</span>
              <span className="font-mono text-[11px]">Cap: 1/{adMobSettings.interstitialFrequencyClicks} clicks</span>
            </div>
          </div>
        </div>

        {/* Active Fan Polls Data Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Active Mobile Polls</span>
                <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-mono font-medium">
                  {activePolls.length} Live
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time voting currently running inside the Android home feed.
              </p>
            </div>
            <Link
              href="/polls"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>Manage all polls</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {polls.slice(0, 3).map((poll) => {
              const topOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
              const topPercentage =
                poll.totalVotes > 0
                  ? Math.round((topOption.votes / poll.totalVotes) * 100)
                  : 0;

              return (
                <div
                  key={poll.id}
                  className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {poll.category}
                      </span>
                      {poll.featured && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          Featured
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {poll.question}
                    </h4>

                    {/* Inline Vote Breakdown Bar */}
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Leading: <strong className="text-slate-800 dark:text-slate-200">{topOption?.text}</strong></span>
                        <span className="font-mono tabular-nums">{topPercentage}% ({poll.totalVotes.toLocaleString()} votes)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${topPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => togglePollStatus(poll.id)}
                      className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      {poll.status === 'active' ? 'Close Poll' : 'Activate'}
                    </button>
                    <Link
                      href="/polls"
                      className="h-8 px-3.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold flex items-center transition-colors"
                    >
                      Insights
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Stream */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Audit & Activity Stream
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live feed</span>
          </div>

          <div className="space-y-1.5">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-100 dark:border-slate-800/40 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono tracking-wide shrink-0">
                    {act.category}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                    {act.title}
                  </span>
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] shrink-0 ml-4">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
