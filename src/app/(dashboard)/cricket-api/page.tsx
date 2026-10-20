'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Header } from '@/components/layout/header';
import { Modal } from '@/components/ui/modal';
import {
  KeyRound,
  Plus,
  RefreshCw,
  RotateCcw,
  Zap,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  Radio,
} from 'lucide-react';

interface KeyItem {
  id: string;
  label: string;
  maskedKey: string;
  fullKey?: string;
  addedAt: string;
}

export default function CricketAPISettingsPage() {
  const {
    rapidApiKeysStatus,
    isLoadingKeys,
    fetchRapidApiKeys,
    addRapidApiKey,
    updateRapidApiKeysList,
    resetRapidApiKeys,
    addToast,
  } = useApp();

  const [isResetting, setIsResetting] = useState(false);

  // Add Key Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [keyLabel, setKeyLabel] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<KeyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keys list
  const [keys, setKeys] = useState<KeyItem[]>([]);

  const totalKeys = rapidApiKeysStatus?.totalKeys ?? 2;
  const activeKeys = rapidApiKeysStatus?.activeKeys ?? 2;
  const exhaustedKeys = rapidApiKeysStatus?.exhaustedKeys ?? 0;
  const currentKeyIndex = rapidApiKeysStatus?.currentKeyIndex ?? 0;
  const currentKeyMasked = rapidApiKeysStatus?.currentKeyMasked || '697a...48c3';

  // Synchronize keys with backend
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cricpulse_key_pool');
      let items: KeyItem[] = saved ? JSON.parse(saved) : [];

      if (items.length === 0) {
        items = [
          {
            id: 'key-0',
            label: 'Primary RapidAPI Key',
            maskedKey: currentKeyMasked,
            addedAt: 'Active Dispatcher',
          },
        ];
        if (totalKeys > 1) {
          for (let i = 1; i < totalKeys; i++) {
            items.push({
              id: `key-${i}`,
              label: `Backup RapidAPI Key #${i + 1}`,
              maskedKey: '••••...••••',
              addedAt: 'Standby Failover',
            });
          }
        }
      } else {
        if (items[0] && currentKeyMasked) {
          items[0].maskedKey = currentKeyMasked;
        }
        while (items.length < totalKeys) {
          const idx = items.length;
          items.push({
            id: `key-${idx}-${Date.now()}`,
            label: `Backup RapidAPI Key #${idx + 1}`,
            maskedKey: '••••...••••',
            addedAt: 'Standby Failover',
          });
        }
      }

      setKeys(items);
      localStorage.setItem('cricpulse_key_pool', JSON.stringify(items));
    } catch {}
  }, [totalKeys, currentKeyMasked]);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyValue.trim();
    if (!clean) {
      addToast('Please enter an API key.', 'error');
      return;
    }

    setIsSubmitting(true);
    const ok = await addRapidApiKey(clean);
    setIsSubmitting(false);

    if (ok) {
      const masked = clean.length > 8 ? `${clean.slice(0, 4)}...${clean.slice(-4)}` : '••••••••';
      const newItem: KeyItem = {
        id: `key-${Date.now()}`,
        label: keyLabel.trim() || `Backup RapidAPI Key #${keys.length + 1}`,
        maskedKey: masked,
        fullKey: clean,
        addedAt: 'Standby Failover',
      };

      const updated = [...keys, newItem];
      setKeys(updated);
      try {
        localStorage.setItem('cricpulse_key_pool', JSON.stringify(updated));
      } catch {}

      setKeyLabel('');
      setKeyValue('');
      setIsAddOpen(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    await resetRapidApiKeys();
    setIsResetting(false);
  };

  const handleDeleteKey = async () => {
    if (!deleteTarget) return;

    if (keys.length <= 1) {
      addToast('Cannot delete the last remaining key in pool.', 'error');
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    const remaining = keys.filter((k) => k.id !== deleteTarget.id);
    const remainingValues = remaining.map((k) => k.fullKey || k.maskedKey);

    const ok = await updateRapidApiKeysList(remainingValues);
    setIsDeleting(false);

    if (ok) {
      setKeys(remaining);
      try {
        localStorage.setItem('cricpulse_key_pool', JSON.stringify(remaining));
      } catch {}
      addToast(`Removed ${deleteTarget.label} from pool.`, 'info');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/70 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 antialiased transition-colors">
      <Header
        onOpenMobileMenu={() => {}}
        title="Cricket API Gateway"
        breadcrumbs={['Cricket API', 'Keys & Quota']}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Banner Matching the Demo Style */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/90 p-5 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="space-y-1.5 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:whitespace-nowrap">
                RapidAPI Gateway
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                RapidAPI multi-key quota rotation and failover management synced with live backend.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pr-3 sm:border-r border-slate-200 dark:border-slate-800">
                <span>
                  Total Pool: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{totalKeys} Keys</strong>
                </span>
                <span>
                  Serving: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeKeys} live</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Reset Quota Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting || isLoadingKeys}
                  className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/70 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 shrink-0"
                  title="Reset exhausted keys to active status"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  <span>Reset Quota</span>
                </button>

                {/* Sync API Button */}
                <button
                  type="button"
                  onClick={() => fetchRapidApiKeys()}
                  disabled={isLoadingKeys}
                  className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-all disabled:opacity-50 shrink-0"
                  title="Sync with Backend"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoadingKeys ? 'animate-spin' : ''}`} />
                  <span>{isLoadingKeys ? 'Syncing...' : 'Sync API'}</span>
                </button>

                {/* + New Key Button (Matches + New Poll style) */}
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Key</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Real KPI Cards Underneath Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Pool */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                Total Pool
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {totalKeys}
              </span>
              <span className="text-xs text-slate-500 font-medium">Keys Configured</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Keys available in the auto-failover queue.
            </p>
          </div>

          {/* Card 2: Active */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                Active
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeKeys}
              </span>
              <span className="text-xs text-slate-500 font-medium">Active Keys</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Currently operational to serve match queries.
            </p>
          </div>

          {/* Card 3: Exhausted */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                Exhausted
              </span>
              <div className={`p-2 rounded-xl ${exhaustedKeys > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${exhaustedKeys > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {exhaustedKeys}
              </span>
              <span className="text-xs text-slate-500 font-medium">Limit Reached</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {exhaustedKeys > 0 ? 'Reached daily 429 quota.' : 'No rate limit errors detected.'}
            </p>
          </div>
        </div>

        {/* All Keys Cards Section (With Active Indicator and Delete Option) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Configured API Keys</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {keys.length}
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Auto-rotated on HTTP 429 quota exhaustion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keys.map((item, index) => {
              const isCurrentActive = index === currentKeyIndex;
              const isExhausted = index < currentKeyIndex;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all shadow-2xs relative flex flex-col justify-between gap-4 ${
                    isCurrentActive
                      ? 'bg-gradient-to-b from-white to-emerald-50/30 dark:from-slate-900/90 dark:to-[#081318] border-emerald-500/30 ring-1 ring-emerald-500/10'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Header: Priority, Title, Active Badge, and Delete Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isCurrentActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          #{index}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.label}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            Priority Index #{index}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Active / Status Badge */}
                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : isExhausted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Exhausted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Standby
                          </span>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete key"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Masked Secret Key Display */}
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-[#060a12] border border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Secret Key</span>
                      <code className="text-xs font-mono font-medium text-slate-900 dark:text-slate-100 tracking-wider">
                        {item.maskedKey}
                      </code>
                    </div>
                  </div>

                  {/* Card Bottom Traffic Role */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <span>
                      {isCurrentActive ? 'Primary Live Dispatcher' : 'Automatic Failover Queue'}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {isCurrentActive ? 'Serving Live Feeds' : 'Ready'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* NEW KEY MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add RapidAPI Key"
        description="Add a new key to the backend rotation pool."
        maxWidth="md"
      >
        <form onSubmit={handleAddKey} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Key Name / Label
            </label>
            <input
              type="text"
              value={keyLabel}
              onChange={(e) => setKeyLabel(e.target.value)}
              placeholder={`e.g. RapidAPI Account #${keys.length + 1}`}
              className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              RapidAPI Key String
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                autoFocus
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="Paste RapidAPI key string"
                className="w-full h-10 pl-3 pr-10 text-xs font-mono bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              Key will be saved to backend rotation pool at <code className="text-emerald-600 dark:text-emerald-400 font-mono">/api/settings/keys</code>.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !keyValue.trim()}
              className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Key'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove API Key"
        description="Are you sure you want to remove this key from the rotation pool?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300">
            <span className="font-semibold block mb-0.5">{deleteTarget?.label}</span>
            <code className="font-mono text-[11px] block">{deleteTarget?.maskedKey}</code>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteKey}
              disabled={isDeleting}
              className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Removing...' : 'Remove Key'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
