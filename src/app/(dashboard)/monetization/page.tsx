'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import {
  ShieldCheck,
} from 'lucide-react';

export default function MonetizationPage() {
  const { adMobSettings, updateAdMobSettings, addToast } = useApp();

  const [appId, setAppId] = useState(adMobSettings.adMobAppId);
  const [bannerId, setBannerId] = useState(adMobSettings.bannerAdUnitId);
  const [interstitialId, setInterstitialId] = useState(adMobSettings.interstitialAdUnitId);
  const [nativeId, setNativeId] = useState(adMobSettings.nativeAdUnitId);
  const [rewardedId, setRewardedId] = useState(adMobSettings.rewardedAdUnitId);

  const [globalEnabled, setGlobalEnabled] = useState(adMobSettings.adsEnabledGlobally);
  const [testMode, setTestMode] = useState(adMobSettings.testMode);
  const [bannerHome, setBannerHome] = useState(adMobSettings.bannerOnHomeScreen);
  const [interNews, setInterNews] = useState(adMobSettings.interstitialOnNewsDetail);
  const [nativeMatch, setNativeMatch] = useState(adMobSettings.nativeInMatchList);
  const [frequency, setFrequency] = useState(adMobSettings.interstitialFrequencyClicks);

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
      bannerOnHomeScreen: bannerHome,
      interstitialOnNewsDetail: interNews,
      nativeInMatchList: nativeMatch,
      interstitialFrequencyClicks: Number(frequency),
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
    <div className="min-h-full transition-colors duration-150">
      <Header
        onOpenMobileMenu={() => {}}
        title="AdMob & Monetization"
        breadcrumbs={['Monetization']}
      />

      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Monetization & AdMob
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  globalEnabled
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {globalEnabled ? 'Serving Ads' : 'Paused'}
              </span>
              {testMode && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium">
                  Test Mode
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure AdMob credentials, unit identifiers, and mobile placement frequencies.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadOfficialTestUnits}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shrink-0 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Load Test IDs</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Master Toggles */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Master Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Monetization Engine</span>
                  <span className="text-xs text-slate-500">Enable or disable all ads remotely</span>
                </div>
                <input
                  type="checkbox"
                  checked={globalEnabled}
                  onChange={(e) => setGlobalEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Test Ad Mode</span>
                  <span className="text-xs text-slate-500">Serves Google test ads for QA</span>
                </div>
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Ad Unit IDs Card */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AdMob Unit Identifiers
            </h3>

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
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
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
                    className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Placement & Frequency */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mobile Placements & Frequency
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Sticky Banner on Home Feed</span>
                <input
                  type="checkbox"
                  checked={bannerHome}
                  onChange={(e) => setBannerHome(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Interstitial on Article Detail</span>
                <input
                  type="checkbox"
                  checked={interNews}
                  onChange={(e) => setInterNews(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Native Sponsor Cards in Match List</span>
                <input
                  type="checkbox"
                  checked={nativeMatch}
                  onChange={(e) => setNativeMatch(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 space-y-2.5 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Interstitial Frequency Capping</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Every {frequency} clicks
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
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
