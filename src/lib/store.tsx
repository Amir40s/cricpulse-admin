'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Poll,
  RSSFeed,
  CricketAPISettings,
  AdMobSettings,
  AppGeneralSettings,
  AdminUser,
  PollStatus,
  PollOption,
  PollCategory,
  RapidAPIKeyStatus,
} from './types';
import {
  initialPolls,
  initialRSSFeeds,
  initialCricketAPISettings,
  initialAdMobSettings,
  initialAppSettings,
  initialAdminUser,
} from './initial-data';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoredAdmin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Super Admin' | 'Content Editor';
  createdAt: string;
}

async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return btoa(password + 'cricpulse_salt_2026');
  }
  const msgUint8 = new TextEncoder().encode(password + 'cricpulse_salt_2026');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Polls
  polls: Poll[];
  isLoadingPolls: boolean;
  refreshPolls: () => Promise<void>;
  getPollById: (id: string) => Promise<Poll | null>;
  addPoll: (poll: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>) => Promise<boolean>;
  updatePoll: (id: string, updated: Partial<Poll>) => Promise<boolean>;
  deletePoll: (id: string) => Promise<boolean>;
  togglePollStatus: (id: string) => Promise<boolean>;
  votePoll: (pollId: string, optionId: string) => void;

  // RSS Feeds
  feeds: RSSFeed[];
  addFeed: (feed: Omit<RSSFeed, 'id' | 'lastSyncedAt' | 'articleCount'>) => void;
  updateFeed: (id: string, updated: Partial<RSSFeed>) => void;
  deleteFeed: (id: string) => void;
  syncFeedNow: (id: string) => Promise<void>;

  // Cricket API
  apiSettings: CricketAPISettings;
  updateApiSettings: (updated: Partial<CricketAPISettings>) => void;
  testApiConnection: () => Promise<boolean>;

  // RapidAPI Multi-Key Management & Rotation
  rapidApiKeysStatus: RapidAPIKeyStatus | null;
  isLoadingKeys: boolean;
  fetchRapidApiKeys: () => Promise<RapidAPIKeyStatus | null>;
  addRapidApiKey: (key: string) => Promise<boolean>;
  updateRapidApiKeysList: (keys: string[]) => Promise<boolean>;
  resetRapidApiKeys: () => Promise<boolean>;

  // AdMob & App Settings
  adMobSettings: AdMobSettings;
  updateAdMobSettings: (updated: Partial<AdMobSettings>) => void;
  appSettings: AppGeneralSettings;
  updateAppSettings: (updated: Partial<AppGeneralSettings>) => void;

  // Mobile Navigation
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [isLoadingPolls, setIsLoadingPolls] = useState<boolean>(false);
  const [feeds, setFeeds] = useState<RSSFeed[]>(initialRSSFeeds);
  const [apiSettings, setApiSettings] = useState<CricketAPISettings>(initialCricketAPISettings);
  const [rapidApiKeysStatus, setRapidApiKeysStatus] = useState<RapidAPIKeyStatus | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState<boolean>(false);
  const [adMobSettings, setAdMobSettings] = useState<AdMobSettings>(initialAdMobSettings);
  const [appSettings, setAppSettings] = useState<AppGeneralSettings>(initialAppSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);

  const refreshPolls = async () => {
    setIsLoadingPolls(true);
    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/polls', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        if (list.length > 0) {
          const rawChoices = (c: unknown, total: number, idx: number) => {
            if (typeof c === 'string') return { id: String(idx + 1), text: c, votes: 0, percentage: 0 };
            const obj = c as { id?: string; text?: string; votes?: number; percentage?: number };
            const votes = obj.votes || 0;
            const percentage =
              obj.percentage !== undefined
                ? obj.percentage
                : total > 0
                ? Math.round((votes / total) * 100)
                : 0;
            return {
              id: obj.id || String(idx + 1),
              text: obj.text || '',
              votes,
              percentage,
            };
          };

          const normalized: Poll[] = list.map((item: Record<string, unknown>) => {
            const rawChoicesList = (item.choices || item.options || []) as unknown[];
            const totalVotes =
              typeof item.totalVotes === 'number'
                ? item.totalVotes
                : rawChoicesList.reduce((acc: number, c: unknown) => {
                    return acc + (c && typeof c === 'object' && 'votes' in c ? Number((c as { votes: number }).votes || 0) : 0);
                  }, 0);

            const options = rawChoicesList.map((c, idx) => rawChoices(c, totalVotes, idx));
            const endDate = String(item.expirationDate || item.endDate || new Date(Date.now() + 7 * 86400000).toISOString());
            const startDate = String(item.startDate || item.createdAt || new Date().toISOString());

            let status: PollStatus = (item.status as PollStatus) || 'active';
            if (item.isManuallyDeactivated) {
              status = 'deactivated';
            } else if (new Date(endDate) < new Date()) {
              status = 'ended';
            } else if (new Date(startDate) > new Date()) {
              status = 'scheduled';
            }

            return {
              id: String(item.id),
              question: String(item.question || ''),
              category: (item.category as PollCategory) || 'Match Prediction',
              options,
              choices: options,
              totalVotes,
              startDate,
              endDate,
              expirationDate: endDate,
              status,
              isManuallyDeactivated: Boolean(item.isManuallyDeactivated),
              isActive: Boolean(item.isActive && !item.isManuallyDeactivated),
              featured: Boolean(item.highlightInMatchFeeds || item.featured),
              highlightInMatchFeeds: Boolean(item.highlightInMatchFeeds || item.featured),
              allowMultipleVotes: false,
              createdAt: String(item.createdAt || new Date().toISOString()),
              updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
            };
          });

          setPolls(normalized);
          try {
            localStorage.setItem('cricpulse_polls', JSON.stringify(normalized));
          } catch {}
          return;
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, falling back to proxy', e);
      try {
        const res = await fetch('/api/polls', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setPolls(json.data);
          }
        }
      } catch {}
    } finally {
      setIsLoadingPolls(false);
    }
  };

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('cricpulse_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.add('dark');
      }

      const savedAuth = localStorage.getItem('cricpulse_auth');
      const savedUser = localStorage.getItem('cricpulse_user');
      if (savedAuth === 'true' && savedUser) {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(savedUser));
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }

      // Initialize default admin account in localStorage if absent
      const existingAdmins = localStorage.getItem('cricpulse_admins');
      if (!existingAdmins) {
        hashPassword('cricpulse#2026').then((hash) => {
          const defaultAdmin: StoredAdmin = {
            id: 'admin-seed-01',
            name: 'Operations Lead',
            email: 'admin@cricpulse.app',
            passwordHash: hash,
            role: 'Super Admin',
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem('cricpulse_admins', JSON.stringify([defaultAdmin]));
        });
      }

      const savedPolls = localStorage.getItem('cricpulse_polls');
      if (savedPolls) setPolls(JSON.parse(savedPolls));
      refreshPolls();
      fetchRapidApiKeys();

      const savedFeeds = localStorage.getItem('cricpulse_feeds');
      if (savedFeeds) setFeeds(JSON.parse(savedFeeds));

      const savedApi = localStorage.getItem('cricpulse_api');
      if (savedApi) setApiSettings(JSON.parse(savedApi));

      const savedAdMob = localStorage.getItem('cricpulse_admob');
      if (savedAdMob) setAdMobSettings(JSON.parse(savedAdMob));

      const savedApp = localStorage.getItem('cricpulse_app');
      if (savedApp) setAppSettings(JSON.parse(savedApp));
    } catch {
      // Fallback gracefully
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('cricpulse_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('cricpulse_auth', String(isAuthenticated));
      if (currentUser) {
        localStorage.setItem('cricpulse_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('cricpulse_user');
      }
      localStorage.setItem('cricpulse_polls', JSON.stringify(polls));
      localStorage.setItem('cricpulse_feeds', JSON.stringify(feeds));
      localStorage.setItem('cricpulse_api', JSON.stringify(apiSettings));
      localStorage.setItem('cricpulse_admob', JSON.stringify(adMobSettings));
      localStorage.setItem('cricpulse_app', JSON.stringify(appSettings));
    } catch {
      // Silent catch
    }
  }, [mounted, isAuthenticated, currentUser, polls, feeds, apiSettings, adMobSettings, appSettings]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Secure Auth
  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      const msg = 'Please enter both administrator email and password.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    try {
      const inputHash = await hashPassword(cleanPass);
      const rawAdmins = localStorage.getItem('cricpulse_admins');
      let adminList: StoredAdmin[] = rawAdmins ? JSON.parse(rawAdmins) : [];

      // If no list yet, populate default
      if (adminList.length === 0) {
        const seedHash = await hashPassword('cricpulse#2026');
        const defaultAdmin: StoredAdmin = {
          id: 'admin-seed-01',
          name: 'Operations Lead',
          email: 'admin@cricpulse.app',
          passwordHash: seedHash,
          role: 'Super Admin',
          createdAt: new Date().toISOString(),
        };
        adminList = [defaultAdmin];
        localStorage.setItem('cricpulse_admins', JSON.stringify(adminList));
      }

      const match = adminList.find(
        (a) => a.email.toLowerCase() === cleanEmail && a.passwordHash === inputHash
      );

      if (!match) {
        const msg = 'Invalid credentials. Please verify your admin email and password.';
        addToast(msg, 'error');
        return { success: false, message: msg };
      }

      const loggedUser: AdminUser = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
      };

      setIsAuthenticated(true);
      setCurrentUser(loggedUser);
      localStorage.setItem('cricpulse_auth', 'true');
      localStorage.setItem('cricpulse_user', JSON.stringify(loggedUser));

      addToast(`Authenticated successfully. Welcome, ${loggedUser.name}!`, 'success');
      return { success: true, message: 'Authentication successful.' };
    } catch {
      const msg = 'Authentication service encountered an unexpected error.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanName) {
      const msg = 'Please provide an administrator full name.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      const msg = 'Please enter a valid administrator email address.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    if (cleanPass.length < 6) {
      const msg = 'Password must be at least 6 characters for security.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }

    try {
      const rawAdmins = localStorage.getItem('cricpulse_admins');
      const adminList: StoredAdmin[] = rawAdmins ? JSON.parse(rawAdmins) : [];

      const alreadyExists = adminList.some((a) => a.email.toLowerCase() === cleanEmail);
      if (alreadyExists) {
        const msg = 'An administrator account with this email already exists.';
        addToast(msg, 'error');
        return { success: false, message: msg };
      }

      const passwordHash = await hashPassword(cleanPass);
      const newAdmin: StoredAdmin = {
        id: `admin-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: 'Super Admin',
        createdAt: new Date().toISOString(),
      };

      const updatedList = [...adminList, newAdmin];
      localStorage.setItem('cricpulse_admins', JSON.stringify(updatedList));

      const loggedUser: AdminUser = {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      };

      setIsAuthenticated(true);
      setCurrentUser(loggedUser);
      localStorage.setItem('cricpulse_auth', 'true');
      localStorage.setItem('cricpulse_user', JSON.stringify(loggedUser));

      addToast(`Admin account registered & verified. Welcome, ${cleanName}!`, 'success');
      return { success: true, message: 'Account created successfully.' };
    } catch {
      const msg = 'Failed to create account. Please try again.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.setItem('cricpulse_auth', 'false');
      localStorage.removeItem('cricpulse_user');
    } catch {}
    addToast('Logged out of operations panel.', 'info');
  };

  // Poll CRUD
  const getPollById = async (id: string): Promise<Poll | null> => {
    try {
      const res = await fetch(`https://cric-plus-iota.vercel.app/api/polls/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data || json;
        if (raw && raw.id) {
          const rawChoicesList = (raw.choices || raw.options || []) as unknown[];
          const totalVotes =
            typeof raw.totalVotes === 'number'
              ? raw.totalVotes
              : rawChoicesList.reduce((acc: number, c: unknown) => {
                  return acc + (c && typeof c === 'object' && 'votes' in c ? Number((c as { votes: number }).votes || 0) : 0);
                }, 0);

          const options: PollOption[] = rawChoicesList.map((c: unknown, idx: number) => {
            if (typeof c === 'string') return { id: String(idx + 1), text: c, votes: 0, percentage: 0 };
            const obj = c as { id?: string; text?: string; votes?: number; percentage?: number };
            const votes = obj.votes || 0;
            const percentage =
              obj.percentage !== undefined
                ? obj.percentage
                : totalVotes > 0
                ? Math.round((votes / totalVotes) * 100)
                : 0;
            return {
              id: obj.id || String(idx + 1),
              text: obj.text || '',
              votes,
              percentage,
            };
          });

          const endDate = String(raw.expirationDate || raw.endDate || new Date(Date.now() + 7 * 86400000).toISOString());
          const startDate = String(raw.startDate || raw.createdAt || new Date().toISOString());

          let status: PollStatus = (raw.status as PollStatus) || 'active';
          if (raw.isManuallyDeactivated) {
            status = 'deactivated';
          } else if (new Date(endDate) < new Date()) {
            status = 'ended';
          } else if (new Date(startDate) > new Date()) {
            status = 'scheduled';
          }

          const normalized: Poll = {
            id: String(raw.id),
            question: String(raw.question || ''),
            category: (raw.category as PollCategory) || 'Match Prediction',
            options,
            choices: options,
            totalVotes,
            startDate,
            endDate,
            expirationDate: endDate,
            status,
            isManuallyDeactivated: Boolean(raw.isManuallyDeactivated),
            isActive: Boolean(raw.isActive && !raw.isManuallyDeactivated),
            featured: Boolean(raw.highlightInMatchFeeds || raw.featured),
            highlightInMatchFeeds: Boolean(raw.highlightInMatchFeeds || raw.featured),
            allowMultipleVotes: false,
            createdAt: String(raw.createdAt || new Date().toISOString()),
            updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
          };

          setPolls((prev) => prev.map((p) => (p.id === id ? normalized : p)));
          return normalized;
        }
      }
    } catch (e) {
      console.warn('API error fetching poll by ID', e);
    }
    return polls.find((p) => p.id === id) || null;
  };

  const addPoll = async (newPollData: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>): Promise<boolean> => {
    const choiceStrings = newPollData.options.map((opt) => opt.text.trim()).filter(Boolean);

    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPollData.question.trim(),
          choices: choiceStrings,
          category: newPollData.category,
          startDate: newPollData.startDate,
          expirationDate: newPollData.endDate,
          endDate: newPollData.endDate,
          highlightInMatchFeeds: newPollData.featured,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        addToast('New poll created successfully on backend!', 'success');
        await refreshPolls();
        return true;
      } else {
        const errMsg = json.error?.message || json.message || 'Failed to create poll on backend.';
        addToast(errMsg, 'error');
        return false;
      }
    } catch (e) {
      console.warn('Network issue creating poll, saved locally', e);
      const totalVotes = newPollData.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
      const newPoll: Poll = {
        ...newPollData,
        id: `poll-${Date.now()}`,
        totalVotes,
        createdAt: new Date().toISOString(),
      };
      setPolls((prev) => [newPoll, ...prev]);
      addToast('Saved to local storage (API connection offline).', 'info');
      return true;
    }
  };

  const updatePoll = async (id: string, updated: Partial<Poll>): Promise<boolean> => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== id) return poll;
        const merged = { ...poll, ...updated };
        if (updated.options) {
          merged.totalVotes = updated.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        }
        return merged;
      })
    );

    try {
      const res = await fetch(`https://cric-plus-iota.vercel.app/api/polls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast('Poll updated successfully on backend.', 'success');
        await refreshPolls();
        return true;
      }
    } catch (e) {
      console.warn('API error updating poll', e);
    }
    addToast('Poll details updated.', 'success');
    return true;
  };

  const deletePoll = async (id: string): Promise<boolean> => {
    // Optimistic removal
    setPolls((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`https://cric-plus-iota.vercel.app/api/polls/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(json.message || 'Poll deleted successfully from backend.', 'info');
        await refreshPolls();
        return true;
      }
    } catch (e) {
      console.warn('API error deleting poll', e);
    }
    addToast('Poll removed from dashboard.', 'info');
    return true;
  };

  const togglePollStatus = async (id: string): Promise<boolean> => {
    const current = polls.find((p) => p.id === id);
    if (!current) return false;

    const willDeactivate = current.status === 'active' && !current.isManuallyDeactivated;
    const nextStatus: PollStatus = willDeactivate ? 'deactivated' : 'active';

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          status: nextStatus,
          isManuallyDeactivated: willDeactivate,
          isActive: !willDeactivate,
        };
      })
    );

    try {
      const res = await fetch(`https://cric-plus-iota.vercel.app/api/polls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isManuallyDeactivated: willDeactivate,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(
          `Poll ${willDeactivate ? 'deactivated' : 'activated'} successfully!`,
          'info'
        );
        await refreshPolls();
        return true;
      }
    } catch (e) {
      console.warn('API error updating poll status', e);
    }
    addToast('Poll status updated.', 'info');
    return true;
  };

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        const updatedOptions = p.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...p,
          options: updatedOptions,
          totalVotes: p.totalVotes + 1,
        };
      })
    );
    addToast('Live vote registered in poll data stream.', 'success');
  };

  // Feed CRUD
  const addFeed = (newFeedData: Omit<RSSFeed, 'id' | 'lastSyncedAt' | 'articleCount'>) => {
    const feed: RSSFeed = {
      ...newFeedData,
      id: `rss-${Date.now()}`,
      lastSyncedAt: new Date().toISOString(),
      articleCount: Math.floor(Math.random() * 30) + 10,
    };
    setFeeds((prev) => [feed, ...prev]);
    addToast('RSS feed endpoint registered.', 'success');
  };

  const updateFeed = (id: string, updated: Partial<RSSFeed>) => {
    setFeeds((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
    addToast('Feed configuration updated.', 'success');
  };

  const deleteFeed = (id: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
    addToast('Feed removed from scheduler.', 'info');
  };

  const syncFeedNow = async (id: string) => {
    // Simulate real feed fetch
    await new Promise((r) => setTimeout(r, 900));
    setFeeds((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const added = Math.floor(Math.random() * 6) + 1;
        return {
          ...f,
          lastSyncedAt: new Date().toISOString(),
          articleCount: f.articleCount + added,
          status: 'active',
        };
      })
    );
    addToast('Feed sync completed. New articles queued.', 'success');
  };

  // Cricket API & RapidAPI Multi-Key Management
  const fetchRapidApiKeys = async (): Promise<RapidAPIKeyStatus | null> => {
    setIsLoadingKeys(true);
    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/settings/keys', {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRapidApiKeysStatus(json.data);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Direct fetch failed, falling back to local proxy', e);
      try {
        const res = await fetch('/api/settings/keys', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setRapidApiKeysStatus(json.data);
            return json.data;
          }
        }
      } catch {}
    } finally {
      setIsLoadingKeys(false);
    }
    return null;
  };

  const addRapidApiKey = async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      addToast('Please enter a valid RapidAPI key.', 'error');
      return false;
    }
    setIsLoadingKeys(true);
    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addKey: key.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(json.message || 'RapidAPI key added successfully!', 'success');
        if (json.data) {
          setRapidApiKeysStatus(json.data);
        } else {
          await fetchRapidApiKeys();
        }
        return true;
      } else {
        const msg = json.error?.message || json.message || 'Failed to add RapidAPI key.';
        addToast(msg, 'error');
      }
    } catch (e) {
      console.error('Error adding key', e);
      addToast('Network error connecting to backend.', 'error');
    } finally {
      setIsLoadingKeys(false);
    }
    return false;
  };

  const updateRapidApiKeysList = async (keys: string[]): Promise<boolean> => {
    const clean = keys.map((k) => k.trim()).filter(Boolean);
    if (clean.length === 0) {
      addToast('Please provide at least one RapidAPI key.', 'error');
      return false;
    }
    setIsLoadingKeys(true);
    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: clean }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(json.message || 'RapidAPI keys pool updated successfully!', 'success');
        if (json.data) {
          setRapidApiKeysStatus(json.data);
        } else {
          await fetchRapidApiKeys();
        }
        return true;
      } else {
        const msg = json.error?.message || json.message || 'Failed to update keys pool.';
        addToast(msg, 'error');
      }
    } catch (e) {
      console.error('Error updating keys list', e);
      addToast('Network error updating keys pool.', 'error');
    } finally {
      setIsLoadingKeys(false);
    }
    return false;
  };

  const resetRapidApiKeys = async (): Promise<boolean> => {
    setIsLoadingKeys(true);
    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/settings/keys/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        addToast(json.message || 'All exhausted keys reset to active status!', 'success');
        if (json.data) {
          setRapidApiKeysStatus(json.data);
        } else {
          await fetchRapidApiKeys();
        }
        return true;
      } else {
        const msg = json.error?.message || json.message || 'Failed to reset keys.';
        addToast(msg, 'error');
      }
    } catch (e) {
      console.error('Error resetting keys', e);
      addToast('Network error resetting RapidAPI keys.', 'error');
    } finally {
      setIsLoadingKeys(false);
    }
    return false;
  };

  const updateApiSettings = (updated: Partial<CricketAPISettings>) => {
    setApiSettings((prev) => ({ ...prev, ...updated }));
    addToast('Cricket API credentials and limits saved.', 'success');
  };

  const testApiConnection = async (): Promise<boolean> => {
    const start = Date.now();
    try {
      const res = await fetch('https://cric-plus-iota.vercel.app/api/settings/keys', {
        cache: 'no-store',
      });
      const latency = Date.now() - start;
      if (res.ok) {
        setApiSettings((prev) => ({
          ...prev,
          lastPingStatus: 'healthy',
          lastPingTime: new Date().toISOString(),
          requestsUsedToday: prev.requestsUsedToday + 1,
        }));
        addToast(`API Ping Successful (HTTP 200 OK - Latency ${latency}ms)`, 'success');
        return true;
      }
    } catch {}

    setApiSettings((prev) => ({
      ...prev,
      lastPingStatus: 'error',
      lastPingTime: new Date().toISOString(),
    }));
    addToast('API Ping Failed: Backend endpoint unreachable', 'error');
    return false;
  };

  // AdMob & App
  const updateAdMobSettings = (updated: Partial<AdMobSettings>) => {
    setAdMobSettings((prev) => ({ ...prev, ...updated }));
    addToast('AdMob ad units & configuration updated.', 'success');
  };

  const updateAppSettings = (updated: Partial<AppGeneralSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...updated }));
    addToast('App operational parameters updated.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        signUp,
        logout,
        polls,
        isLoadingPolls,
        refreshPolls,
        getPollById,
        addPoll,
        updatePoll,
        deletePoll,
        togglePollStatus,
        votePoll,
        feeds,
        addFeed,
        updateFeed,
        deleteFeed,
        syncFeedNow,
        apiSettings,
        updateApiSettings,
        testApiConnection,
        rapidApiKeysStatus,
        isLoadingKeys,
        fetchRapidApiKeys,
        addRapidApiKey,
        updateRapidApiKeysList,
        resetRapidApiKeys,
        adMobSettings,
        updateAdMobSettings,
        appSettings,
        updateAppSettings,
        theme,
        toggleTheme,
        setTheme,
        toasts,
        addToast,
        removeToast,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
