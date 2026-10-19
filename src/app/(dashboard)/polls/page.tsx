'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Poll, PollCategory, PollStatus } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Header } from '@/components/layout/header';
import {
  Plus,
  Search,
  Clock,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export default function PollsPage() {
  const { polls, addPoll, deletePoll, togglePollStatus, addToast } = useApp();

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAnalyticsPoll, setSelectedAnalyticsPoll] = useState<Poll | null>(null);
  const [deleteTargetPoll, setDeleteTargetPoll] = useState<Poll | null>(null);

  // Form State
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState<PollCategory>('Match Prediction');
  const [newOptions, setNewOptions] = useState<string[]>(['', '']);
  const [newStartDate, setNewStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [newFeatured, setNewFeatured] = useState(true);

  // Filtered polls
  const filteredPolls = polls.filter((poll) => {
    const matchesSearch =
      poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.options.some((o) => o.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all' || poll.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'all' || poll.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddOptionField = () => {
    if (newOptions.length >= 6) {
      addToast('Maximum 6 options allowed per cricket poll.', 'info');
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

  const handleCreatePoll = (e: React.FormEvent) => {
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

    addPoll({
      question: newQuestion.trim(),
      category: newCategory,
      options: validOptions.map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text,
        votes: 0,
      })),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status,
      allowMultipleVotes: false,
      featured: newFeatured,
    });

    setNewQuestion('');
    setNewOptions(['', '']);
    setIsCreateOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTargetPoll) {
      deletePoll(deleteTargetPoll.id);
      setDeleteTargetPoll(null);
    }
  };

  return (
    <div className="min-h-full transition-colors duration-150">
      <Header
        onOpenMobileMenu={() => {}}
        title="Fan Polls"
        breadcrumbs={['Fan Polls']}
      />

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
        {/* Page Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <span>Fan Engagement Polls</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                {polls.length} Total
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create, schedule, view vote analytics, and manage mobile app polls.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Poll</span>
          </button>
        </div>

        {/* Clean Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls by question..."
              className="w-full h-8 pl-9 pr-3 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#080c14] p-1 border border-slate-200 dark:border-slate-800 text-xs shrink-0">
              {['all', 'active', 'scheduled', 'ended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`h-6 px-3 rounded-md capitalize font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 px-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 shrink-0"
            >
              <option value="all">All Categories</option>
              <option value="Match Prediction">Match Prediction</option>
              <option value="Player of the Match">Player of the Match</option>
              <option value="Tournament Winner">Tournament Winner</option>
              <option value="Opinion">Opinion</option>
            </select>
          </div>
        </div>

        {/* Spacious, Clean Enterprise Data Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Poll Question</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Leading Choice</th>
                  <th className="px-4 py-3.5 text-right">Votes</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
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
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 max-w-md">
                        <div className="truncate font-semibold">{poll.question}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(poll.startDate).toLocaleDateString()} – {new Date(poll.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {poll.category}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {poll.status === 'active' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        )}
                        {poll.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[11px] font-medium">
                            Scheduled
                          </span>
                        )}
                        {poll.status === 'ended' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                            Closed
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[140px] text-slate-800 dark:text-slate-200 font-medium">{topOption?.text}</span>
                          <span className="font-mono text-slate-400 dark:text-slate-500 tabular-nums">({topPercentage}%)</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {poll.totalVotes.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedAnalyticsPoll(poll)}
                            className="h-7 px-2.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                          >
                            Insights
                          </button>
                          <button
                            onClick={() => togglePollStatus(poll.id)}
                            className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                          >
                            {poll.status === 'active' ? 'Close' : 'Activate'}
                          </button>
                          <button
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
      </div>

      {/* CREATE POLL MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Cricket Poll"
        description="Fans vote inside the mobile app home feed."
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
              placeholder="e.g. Which bowler will claim the most wickets in today's match?"
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full h-9 px-2.5 text-xs bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Match Prediction">Match Prediction</option>
                <option value="Player of the Match">Player of the Match</option>
                <option value="Tournament Winner">Tournament Winner</option>
                <option value="Opinion">Opinion</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={newFeatured}
                onChange={(e) => setNewFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-[#080c14] text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="featuredCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Feature on Mobile Home Screen
              </label>
            </div>
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
                <Plus className="w-3 h-3" />
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
                    placeholder={`Option ${idx + 1}`}
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
              className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-xs transition-colors"
            >
              Publish Poll
            </button>
          </div>
        </form>
      </Modal>

      {/* ANALYTICS MODAL */}
      {selectedAnalyticsPoll && (
        <Modal
          isOpen={Boolean(selectedAnalyticsPoll)}
          onClose={() => setSelectedAnalyticsPoll(null)}
          title="Poll Voter Analytics"
          description={selectedAnalyticsPoll.question}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Votes</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {selectedAnalyticsPoll.totalVotes.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Status</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                  {selectedAnalyticsPoll.status}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Unique Devices</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {Math.round(selectedAnalyticsPoll.totalVotes * 0.98).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-semibold text-slate-900 dark:text-slate-200">Option Distribution</h4>
              {selectedAnalyticsPoll.options.map((option) => {
                const pct =
                  selectedAnalyticsPoll.totalVotes > 0
                    ? Math.round((option.votes / selectedAnalyticsPoll.totalVotes) * 100)
                    : 0;
                return (
                  <div key={option.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#080c14] border border-slate-200 dark:border-slate-800/80">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{option.text}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">{pct}% ({option.votes} votes)</span>
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
          title="Delete Poll"
          maxWidth="sm"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to permanently delete this poll?
            </p>
            <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080c14] text-slate-600 dark:text-slate-400 font-mono text-[11px] border border-slate-200 dark:border-slate-800">
              "{deleteTargetPoll.question}"
            </p>
            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTargetPoll(null)}
                className="h-8 px-3 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
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
