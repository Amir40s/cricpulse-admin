'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function CricketAPISettingsPage() {
  const { apiSettings, updateApiSettings, testApiConnection } = useApp();

  const [provider, setProvider] = useState(apiSettings.provider);
  const [apiKey, setApiKey] = useState(apiSettings.apiKey);
  const [baseUrl, setBaseUrl] = useState(apiSettings.baseUrl);
  const [rateLimitPerDay, setRateLimitPerDay] = useState(apiSettings.rateLimitPerDay);
  const [cacheTtl, setCacheTtl] = useState(apiSettings.cacheTtlMinutes);

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiSettings({
      provider,
      apiKey,
      baseUrl,
      rateLimitPerDay: Number(rateLimitPerDay),
      cacheTtlMinutes: Number(cacheTtl),
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await testApiConnection();
    setIsTesting(false);
  };

  const quotaPercent = Math.min(
    100,
    Math.round((apiSettings.requestsUsedToday / apiSettings.rateLimitPerDay) * 100)
  );

  return (
    <div className="min-h-full bg-slate-50/60 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 antialiased transition-colors">
      <Header
        onOpenMobileMenu={() => {}}
        title="Cricket API Gateway"
        breadcrumbs={['Cricket API']}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Banner Card Style matching Overview and Polls */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/90 p-5 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Match Engine & API Gateway
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Configure third-party cricket data credentials, cache TTL, and real-time engine telemetry.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pr-3 sm:border-r border-slate-200 dark:border-slate-800">
                <span>
                  Quota:{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                    {apiSettings.requestsUsedToday.toLocaleString()} / {apiSettings.rateLimitPerDay.toLocaleString()}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      apiSettings.lastPingStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <strong
                    className={`font-semibold ${
                      apiSettings.lastPingStatus === 'healthy'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {apiSettings.lastPingStatus === 'healthy' ? 'Operational' : 'Check Key'}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all shrink-0 disabled:opacity-60"
              >
                <Zap className={`w-4 h-4 ${isTesting ? 'animate-bounce' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2 Clean Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px] font-mono">Daily Quota</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                {apiSettings.requestsUsedToday.toLocaleString()} / {apiSettings.rateLimitPerDay.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {100 - quotaPercent}% calls remaining today
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
              Response Cache
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono block">
              {apiSettings.cacheTtlMinutes}m TTL
            </span>
            <p className="text-xs text-slate-500">
              Prevents duplicate outbound calls to protect limits and enhance latency.
            </p>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Gateway Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full h-9 px-2.5 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="cricapi">CricAPI</option>
                  <option value="sportmonks">Sportmonks Cricket API</option>
                  <option value="rapidapi_cricket">RapidAPI Cricket Live Data</option>
                  <option value="custom">Custom REST Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Base URL
                </label>
                <input
                  type="text"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.cricapi.com/v1"
                  className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="w-full h-9 pl-3 pr-10 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Daily Quota Limit
                </label>
                <input
                  type="number"
                  min={100}
                  max={500000}
                  value={rateLimitPerDay}
                  onChange={(e) => setRateLimitPerDay(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Cache TTL (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={cacheTtl}
                  onChange={(e) => setCacheTtl(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
