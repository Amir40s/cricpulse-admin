'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Poll, PollCategory, PollStatus } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Header } from '@/components/layout/header';
import {
  Plus,
  Search,
  Clock,
  Trash2,
  BarChart3,
  LayoutGrid,
  List,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function PollsPage() {
  const {
    polls,
    isLoadingPolls,
    refreshPolls,
    getPollById,
    addPoll,
    deletePoll,
    togglePollStatus,
    votePoll,
    addToast,
  } = useApp();

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & submission
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnalyticsPoll, setSelectedAnalyticsPoll] = useState<Poll | null>(null);
  const [deleteTargetPoll, setDeleteTargetPoll] = useState<Poll | null>(null);

  // Form State
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '']);
  const [newStartDate, setNewStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );


  // Available unique categories
  const availableCategories = useMemo(() => {
    const defaults = ['Match Prediction', 'Player of the Match', 'Tournament Winner', 'Opinion'];
    const fromPolls = polls.map((p) => p.category);
    return Array.from(new Set([...defaults, ...fromPolls])).filter(Boolean);
  }, [polls]);

  // Status counts
  const activeCount = polls.filter((p) => p.status === 'active' && !p.isManuallyDeactivated).length;
  const scheduledCount = polls.filter((p) => p.status === 'scheduled').length;
  const endedCount = polls.filter((p) => p.status === 'ended').length;
  const deactivatedCount = polls.filter((p) => p.status === 'deactivated' || p.isManuallyDeactivated).length;
  const totalVotesCount = polls.reduce((sum, p) => sum + p.totalVotes, 0);

  // Filtered polls
  const filteredPolls = polls.filter((poll) => {
    const matchesSearch =
      poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.options.some((o) => o.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'deactivated'
        ? poll.status === 'deactivated' || poll.isManuallyDeactivated
        : selectedStatus === 'active'
        ? poll.status === 'active' && !poll.isManuallyDeactivated
        : poll.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'all' || poll.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddOptionField = () => {
    if (newOptions.length >= 6) {
      addToast('Maximum 6 choices allowed per cricket poll.', 'info');
      return;
    }
    setNewOptions([...newOptions, '']);
  };

  const handleRemoveOptionField = (index: number) => {
    if (newOptions.length <= 2) {
      addToast('A cricket poll requires at least 2 choices.', 'error');
      return;
    }
    setNewOptions(newOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (text: string, index: number) => {
    const updated = [...newOptions];
    updated[index] = text;
    setNewOptions(updated);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();

    const validOptions = newOptions.map((opt) => opt.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      addToast('Please provide at least 2 valid choices.', 'error');
      return;
    }

    if (!newQuestion.trim()) {
      addToast('Please enter a poll question.', 'error');
      return;
    }

    const start = new Date(newStartDate);
    const end = new Date(newEndDate);

    if (end <= start) {
      addToast('End date must be later than the start date.', 'error');
      return;
    }

    const status: PollStatus =
      start > new Date() ? 'scheduled' : end < new Date() ? 'ended' : 'active';

    setIsSubmitting(true);
    const ok = await addPoll({
      question: newQuestion.trim(),
      category: 'General',
      options: validOptions.map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text,
        votes: 0,
      })),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status,
      allowMultipleVotes: false,
    });
    setIsSubmitting(false);

    if (ok) {
      setNewQuestion('');
      setNewOptions(['', '']);
      setIsCreateOpen(false);
    }
  };

  const handleOpenAnalytics = async (poll: Poll) => {
    setSelectedAnalyticsPoll(poll);
    const fresh = await getPollById(poll.id);
    if (fresh) {
      setSelectedAnalyticsPoll(fresh);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetPoll) {
      await deletePoll(deleteTargetPoll.id);
      setDeleteTargetPoll(null);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 antialiased transition-colors">
      <Header
        onOpenMobileMenu={() => {}}
        title="Fan Engagement Polls"
        breadcrumbs={['Polls Management']}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/90 p-5 sm:p-7 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Polls Management
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Fan engagement polls, real-time voting, and automated lifecycle management synced with live backend.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 pr-3 sm:border-r border-slate-200 dark:border-slate-800">
                <span>
                  Total Votes: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{totalVotesCount.toLocaleString()}</strong>
                </span>
                <span>
                  Serving: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeCount} live</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => refreshPolls()}
                disabled={isLoadingPolls}
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-all disabled:opacity-50"
                title="Sync with Backend"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoadingPolls ? 'animate-spin' : ''}`} />
                <span>{isLoadingPolls ? 'Syncing...' : 'Sync API'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Poll</span>
              </button>
            </div>
          </div>
        </section>


        {/* Filter & View Toolbar */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-2xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by question, option keywords..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Status Pills */}
            <div className="flex items-center rounded-lg bg-slate-100/80 dark:bg-slate-950/70 p-1 border border-slate-200/70 dark:border-slate-800/80 text-xs shrink-0">
              {[
                { id: 'all', label: 'All', count: polls.length },
                { id: 'active', label: 'Active', count: activeCount },
                { id: 'scheduled', label: 'Scheduled', count: scheduledCount },
                { id: 'ended', label: 'Ended', count: endedCount },
                { id: 'deactivated', label: 'Deactivated', count: deactivatedCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`h-7 px-2.5 rounded-md font-medium transition-all text-xs flex items-center gap-1.5 ${
                    selectedStatus === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    selectedStatus === tab.id
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center rounded-lg bg-slate-100/80 dark:bg-slate-950/70 p-1 border border-slate-200/70 dark:border-slate-800/80 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Empty State */}
        {filteredPolls.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 shadow-2xs space-y-3">
            <BarChart3 className="w-10 h-10 text-slate-400 mx-auto stroke-[1.5]" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No matching polls found
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No entries matched your current search and filter combination.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* GRID CARDS VIEW */}
        {viewMode === 'grid' && filteredPolls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPolls.map((poll) => {
              const topOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];

              return (
                <div
                  key={poll.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Top Meta Line */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60">
                          {poll.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          #{poll.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {poll.status === 'active' && !poll.isManuallyDeactivated && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-medium font-mono uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        )}
                        {(poll.status === 'deactivated' || poll.isManuallyDeactivated) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-medium font-mono uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Deactivated
                          </span>
                        )}
                        {poll.status === 'scheduled' && !poll.isManuallyDeactivated && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 text-[10px] font-medium font-mono uppercase">
                            Scheduled
                          </span>
                        )}
                        {poll.status === 'ended' && !poll.isManuallyDeactivated && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium font-mono uppercase">
                            Ended
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Header */}
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {poll.question}
                    </h3>

                    {/* Option Choices */}
                    <div className="space-y-1.5 pt-1">
                      {poll.options.map((opt) => {
                        const pct =
                          poll.totalVotes > 0
                            ? Math.round((opt.votes / poll.totalVotes) * 100)
                            : 0;
                        const isLeading = opt.id === topOption?.id && poll.totalVotes > 0;

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border transition-all ${
                              isLeading
                                ? 'bg-slate-50/90 dark:bg-slate-950/70 border-emerald-500/30'
                                : 'bg-slate-50/40 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-800/70'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                                {isLeading && (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                                )}
                                <span className="truncate">{opt.text}</span>
                              </span>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums text-[11px]">
                                  {pct}% <span className="text-slate-400">({opt.votes.toLocaleString()})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => votePoll(poll.id, opt.id)}
                                  title="Add test vote (+1)"
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-medium transition-colors"
                                >
                                  +1
                                </button>
                              </div>
                            </div>

                            <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                              <div
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  isLeading ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Operational Footbar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(poll.startDate).toLocaleDateString()} – {new Date(poll.endDate).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {poll.totalVotes.toLocaleString()} votes
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenAnalytics(poll)}
                        className="h-7.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Insights</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePollStatus(poll.id)}
                        className="h-7.5 px-3 rounded-lg border border-slate-300/80 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all active:scale-[0.98]"
                      >
                        {poll.status === 'active' && !poll.isManuallyDeactivated ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetPoll(poll)}
                        className="h-7.5 w-7.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        title="Delete Poll"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && filteredPolls.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    <th className="px-5 py-3.5">Poll Question</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Top Choice</th>
                    <th className="px-4 py-3.5 text-right">Votes</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredPolls.map((poll) => {
                    const topOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
                    const topPercentage =
                      poll.totalVotes > 0
                        ? Math.round((topOption.votes / poll.totalVotes) * 100)
                        : 0;

                    return (
                      <tr
                        key={poll.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100 max-w-md">
                          <div className="truncate font-semibold">{poll.question}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(poll.startDate).toLocaleDateString()} – {new Date(poll.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            {poll.category}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {poll.status === 'active' && !poll.isManuallyDeactivated && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-medium font-mono uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Live
                            </span>
                          )}
                          {(poll.status === 'deactivated' || poll.isManuallyDeactivated) && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-medium font-mono uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Deactivated
                            </span>
                          )}
                          {poll.status === 'scheduled' && !poll.isManuallyDeactivated && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium font-mono uppercase">
                              Scheduled
                            </span>
                          )}
                          {poll.status === 'ended' && !poll.isManuallyDeactivated && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium font-mono uppercase">
                              Ended
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[130px] text-slate-800 dark:text-slate-200 font-medium">
                              {topOption?.text}
                            </span>
                            <span className="font-mono text-slate-400 dark:text-slate-500 tabular-nums text-[11px]">
                              ({topPercentage}%)
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                          {poll.totalVotes.toLocaleString()}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAnalytics(poll)}
                              className="h-7 px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-semibold transition-all active:scale-[0.98]"
                            >
                              Insights
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePollStatus(poll.id)}
                              className="h-7 px-2 rounded-md border border-slate-300/80 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                            >
                              {poll.status === 'active' && !poll.isManuallyDeactivated ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetPoll(poll)}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                              title="Delete Poll"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CREATE POLL MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Fan Engagement Poll"
        description="Fans can vote in real-time inside the CricPulse Android mobile app."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePoll} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Poll Question
            </label>
            <textarea
              required
              rows={2}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. Which team will score the highest powerplay total today?"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>



          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Poll Choices ({newOptions.length})
              </label>
              <button
                type="button"
                onClick={handleAddOptionField}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Choice</span>
              </button>
            </div>

            <div className="space-y-2">
              {newOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-slate-400 font-mono text-[11px]">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                    placeholder={`Choice ${idx + 1}`}
                    className="flex-1 h-9 px-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {newOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionField(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Expiration (Auto-deactivate)
              </label>
              <input
                type="datetime-local"
                required
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="h-8 px-3 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>{isSubmitting ? 'Publishing...' : 'Publish Poll'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ANALYTICS MODAL */}
      {selectedAnalyticsPoll && (
        <Modal
          isOpen={Boolean(selectedAnalyticsPoll)}
          onClose={() => setSelectedAnalyticsPoll(null)}
          title="Poll Analytics & Breakdown"
          description={selectedAnalyticsPoll.question}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Total Votes</span>
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {selectedAnalyticsPoll.totalVotes.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                  {selectedAnalyticsPoll.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Est. Reach</span>
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {Math.round(selectedAnalyticsPoll.totalVotes * 1.8).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs">Choice Breakdown</h4>
              {selectedAnalyticsPoll.options.map((option) => {
                const pct =
                  selectedAnalyticsPoll.totalVotes > 0
                    ? Math.round((option.votes / selectedAnalyticsPoll.totalVotes) * 100)
                    : 0;
                return (
                  <div
                    key={option.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80"
                  >
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{option.text}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums text-[11px]">
                        {pct}% ({option.votes.toLocaleString()} votes)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTargetPoll && (
        <Modal
          isOpen={Boolean(deleteTargetPoll)}
          onClose={() => setDeleteTargetPoll(null)}
          title="Confirm Deletion"
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to delete this poll? This action cannot be undone and will immediately drop it from user feeds.
            </p>
            <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080c14] text-slate-600 dark:text-slate-400 font-mono text-[11px] border border-slate-200 dark:border-slate-800">
              "{deleteTargetPoll.question}"
            </p>
            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetPoll(null)}
                className="h-8 px-3 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-8 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}