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

  return (
    <div className="min-h-full bg-slate-50/60 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 antialiased transition-colors">
      <Header
        onOpenMobileMenu={() => {}}
        title="Operations Overview"
        breadcrumbs={['Overview']}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar with Enhanced Welcome Header */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/90 p-5 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>Hey, welcome back Admin!</span>
                  <span className="text-xl sm:text-3xl ">👋</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Operations Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Live cricket fan polls, API gateway quotas, and mobile monetization status.
              </p>
            </div>

            <div className="flex items-center gap-2.5 sm:self-auto self-start">
              <button
                type="button"
                onClick={handleTestApi}
                disabled={isTestingApi}
                className="group relative inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Cpu
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isTestingApi
                      ? 'animate-spin text-emerald-500'
                      : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                />
                <span>{isTestingApi ? 'Pinging Gateway...' : 'Ping Match Engine'}</span>
              </button>

              <Link
                href="/polls"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Poll</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Sports-Tech KPI Cards With Prominent Corner Icons */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {/* Card 1: Active Polls */}
          <div className="relative overflow-hidden group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
                  Active Fan Polls
                </span>
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
                      {activePolls.length}
                    </span>
                    
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 inline" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {totalVotes.toLocaleString()}
                    </span>{' '}
                    total votes cast
                  </p>
                </div>
              </div>

              {/* Big Corner Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shrink-0">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/60 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Distribution</span>
                <span>{activePolls.length} of {polls.length} total</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (activePolls.length / Math.max(1, polls.length)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Match API Gateway */}
          <div className="relative overflow-hidden group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
                  API Quota Balance
                </span>
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
                      {(apiSettings.rateLimitPerDay - apiSettings.requestsUsedToday).toLocaleString()}
                    </span>
                    
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-700 dark:text-slate-300 uppercase">
                      {apiSettings.provider}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{apiSettings.cacheTtlMinutes}m TTL</span>
                  </div>
                </div>
              </div>

              {/* Big Corner Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/20 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-xs group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shrink-0">
                <Cpu className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/60 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Usage Load</span>
                <span>{quotaPercent}% consumed</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: AdMob Monetization */}
          <div className="relative overflow-hidden group rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
                  AdMob Status
                </span>
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {adMobSettings.adsEnabledGlobally ? 'Active' : 'Paused'}
                    </span>
                  
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    3 Placements: Banner, Interstitial, Native
                  </p>
                </div>
              </div>

              {/* Big Corner Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shrink-0">
                <Coins className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 relative z-10">
              <span>Freq Capping</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                1 per {adMobSettings.interstitialFrequencyClicks} clicks
              </span>
            </div>
          </div>
        </section>

        {/* Active Fan Polls Terminal/Console Section */}
        <section className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Active Mobile Polls
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {activePolls.length} Serving
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live voting telemetry rendered directly inside the Android client feed.
              </p>
            </div>

            <Link
              href="/polls"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
            >
              <span>Manage all polls</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {polls.slice(0, 3).map((poll) => {
              const topOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
              const topPercentage =
                poll.totalVotes > 0
                  ? Math.round((topOption.votes / poll.totalVotes) * 100)
                  : 0;

              return (
                <div
                  key={poll.id}
                  className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-3 flex-1 min-w-0 pr-0 lg:pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700/60">
                        {poll.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        #{poll.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {poll.question}
                    </h3>

                    {/* Leading Vote Progress Bar */}
                    <div className="max-w-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 truncate">
                          Leading:{' '}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {topOption?.text}
                          </span>
                        </span>
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-medium tabular-nums shrink-0 ml-2">
                          {topPercentage}%{' '}
                          <span className="text-slate-400 dark:text-slate-500">
                            ({poll.totalVotes.toLocaleString()} votes)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${topPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/50">
                    <button
                      type="button"
                      onClick={() => togglePollStatus(poll.id)}
                      className="h-8 px-3 rounded-lg border border-slate-300/80 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98]"
                    >
                      {poll.status === 'active' ? 'Close Poll' : 'Activate'}
                    </button>
                    <Link
                      href="/polls"
                      className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-semibold flex items-center transition-all active:scale-[0.98]"
                    >
                      Insights
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}