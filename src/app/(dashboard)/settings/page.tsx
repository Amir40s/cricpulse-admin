'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import {
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { appSettings, updateAppSettings } = useApp();

  const [appName, setAppName] = useState(appSettings.appName);
  const [currentVersion, setCurrentVersion] = useState(appSettings.currentAppVersion);
  const [minVersion, setMinVersion] = useState(appSettings.minimumRequiredVersion);
  const [maintenance, setMaintenance] = useState(appSettings.maintenanceMode);
  const [maintenanceMsg, setMaintenanceMsg] = useState(appSettings.maintenanceMessage);
  const [shareTemplate, setShareTemplate] = useState(appSettings.shareMessageTemplate);
  const [supportEmail, setSupportEmail] = useState(appSettings.supportEmail);

  const [testersCount] = useState(14);
  const [daysElapsed] = useState(14);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings({
      appName: appName.trim(),
      currentAppVersion: currentVersion.trim(),
      minimumRequiredVersion: minVersion.trim(),
      maintenanceMode: maintenance,
      maintenanceMessage: maintenanceMsg.trim(),
      shareMessageTemplate: shareTemplate.trim(),
      supportEmail: supportEmail.trim(),
    });
  };

  return (
    <div className="min-h-full transition-colors duration-150">
      <Header
        onOpenMobileMenu={() => {}}
        title="Settings"
        breadcrumbs={['Settings']}
      />

      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Application Settings
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                v{currentVersion}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Remote application versioning, maintenance windows, and Play Store readiness.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Versioning */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Release Versioning
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  App Name
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Production Version
                </label>
                <input
                  type="text"
                  required
                  value={currentVersion}
                  onChange={(e) => setCurrentVersion(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Minimum Supported
                </label>
                <input
                  type="text"
                  required
                  value={minVersion}
                  onChange={(e) => setMinVersion(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Switch */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maintenance Window
              </h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  maintenance
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                }`}
              >
                {maintenance ? 'Maintenance Mode Active' : 'Normal Operations'}
              </span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                    Enable Maintenance Lock
                  </span>
                  <span className="text-xs text-slate-500">
                    Displays maintenance screen on mobile apps during server upgrades
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Maintenance Notice Message
                </label>
                <textarea
                  rows={2}
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Social Share Template */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Share Template
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Default WhatsApp & Social Share Caption
              </label>
              <textarea
                rows={2}
                value={shareTemplate}
                onChange={(e) => setShareTemplate(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Google Play Closed Testing Tracker */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Play Console Closed Testing
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Track Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Opted-in Testers</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    {testersCount} / 12
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Testing Duration</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {daysElapsed} / 14 Days
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
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
