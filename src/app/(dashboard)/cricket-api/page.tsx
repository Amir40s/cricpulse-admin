'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import {
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function CricketApiPage() {
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
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
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
    <div className="min-h-full transition-colors duration-150">
      <Header
        onOpenMobileMenu={() => {}}
        title="Cricket API Gateway"
        breadcrumbs={['Cricket API']}
      />

      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Match Engine & API Gateway
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  apiSettings.lastPingStatus === 'healthy'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                }`}
              >
                {apiSettings.lastPingStatus === 'healthy' ? 'Operational' : 'Check Key'}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure third-party cricket data credentials, cache TTL, and feature flags.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce text-emerald-500' : 'text-emerald-500'}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* 2 Clean Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Daily Quota</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                {apiSettings.requestsUsedToday} / {apiSettings.rateLimitPerDay}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {100 - quotaPercent}% calls remaining today
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Response Cache
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono block">
              {apiSettings.cacheTtlMinutes}m TTL
            </span>
            <p className="text-xs text-slate-500">
              Prevents duplicate outbound calls to protect limits
            </p>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gateway Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
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
                    className="w-full h-9 pl-3 pr-10 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
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
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
