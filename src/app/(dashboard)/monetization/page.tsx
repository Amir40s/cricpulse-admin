'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import { ShieldCheck } from 'lucide-react';

export default function MonetizationPage() {
  const { adMobSettings, updateAdMobSettings, addToast } = useApp();

  const [appId, setAppId] = useState(adMobSettings.adMobAppId);
  const [bannerId, setBannerId] = useState(adMobSettings.bannerAdUnitId);
  const [interstitialId, setInterstitialId] = useState(adMobSettings.interstitialAdUnitId);
  const [nativeId, setNativeId] = useState(adMobSettings.nativeAdUnitId);
  const [rewardedId, setRewardedId] = useState(adMobSettings.rewardedAdUnitId);

  const [globalEnabled, setGlobalEnabled] = useState(adMobSettings.adsEnabledGlobally);
  const [testMode, setTestMode] = useState(adMobSettings.testMode);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdMobSettings({
      adMobAppId: appId.trim(),
      bannerAdUnitId: bannerId.trim(),
      interstitialAdUnitId: interstitialId.trim(),
      nativeAdUnitId: nativeId.trim(),
      rewardedAdUnitId: rewardedId.trim(),
      adsEnabledGlobally: globalEnabled,
      testMode,
    });
  };

  const handleLoadOfficialTestUnits = () => {
    setAppId('ca-app-pub-3940256099942544~3347511713');
    setBannerId('ca-app-pub-3940256099942544/6300978111');
    setInterstitialId('ca-app-pub-3940256099942544/1033173712');
    setNativeId('ca-app-pub-3940256099942544/2247696110');
    setRewardedId('ca-app-pub-3940256099942544/5224354917');
    setTestMode(true);
    addToast('Google AdMob test IDs loaded successfully.', 'info');
  };

  return (
    <div className="min-h-full bg-slate-50/60 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 antialiased transition-colors">
      <Header
        onOpenMobileMenu={() => {}}
        title="AdMob & Monetization"
        breadcrumbs={['Monetization']}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Banner Card Style matching Overview and Polls */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/90 p-5 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                AdMob & Monetization
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Configure Google AdMob app credentials, unit identifiers, and mobile placement frequencies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pr-3 sm:border-r border-slate-200 dark:border-slate-800">
                <span>
                  Status:{' '}
                  <strong
                    className={`font-semibold ${
                      globalEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {globalEnabled ? 'Serving Ads' : 'Paused'}
                  </strong>
                </span>
                <span>
                  Mode:{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                    {testMode ? 'QA Test' : 'Live Production'}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleLoadOfficialTestUnits}
                className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Load Test IDs</span>
              </button>
            </div>
          </div>
        </section>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Master Toggles */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Master Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Monetization Engine</span>
                  <span className="text-xs text-slate-500">Enable or disable all mobile ads remotely</span>
                </div>
                <input
                  type="checkbox"
                  checked={globalEnabled}
                  onChange={(e) => setGlobalEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Test Ad Mode</span>
                  <span className="text-xs text-slate-500">Serves Google test units for mobile QA</span>
                </div>
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Ad Unit IDs Card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              AdMob Unit Identifiers
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  AdMob App ID
                </label>
                <input
                  type="text"
                  required
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"
                  className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Banner Ad Unit ID
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerId}
                    onChange={(e) => setBannerId(e.target.value)}
                    placeholder="ca-app-pub-..."
                    className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Interstitial Ad Unit ID
                  </label>
                  <input
                    type="text"
                    required
                    value={interstitialId}
                    onChange={(e) => setInterstitialId(e.target.value)}
                    placeholder="ca-app-pub-..."
                    className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Native Advanced Unit ID
                  </label>
                  <input
                    type="text"
                    required
                    value={nativeId}
                    onChange={(e) => setNativeId(e.target.value)}
                    placeholder="ca-app-pub-..."
                    className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Rewarded Unit ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={rewardedId}
                    onChange={(e) => setRewardedId(e.target.value)}
                    placeholder="ca-app-pub-..."
                    className="w-full h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
