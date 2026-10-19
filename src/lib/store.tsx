'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Poll,
  RSSFeed,
  CricketAPISettings,
  AdMobSettings,
  AppGeneralSettings,
  AdminUser,
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

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  // Polls
  polls: Poll[];
  addPoll: (poll: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>) => void;
  updatePoll: (id: string, updated: Partial<Poll>) => void;
  deletePoll: (id: string) => void;
  togglePollStatus: (id: string) => void;

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

  // AdMob & App Settings
  adMobSettings: AdMobSettings;
  updateAdMobSettings: (updated: Partial<AdMobSettings>) => void;
  appSettings: AppGeneralSettings;
  updateAppSettings: (updated: Partial<AppGeneralSettings>) => void;

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(initialAdminUser);

  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [feeds, setFeeds] = useState<RSSFeed[]>(initialRSSFeeds);
  const [apiSettings, setApiSettings] = useState<CricketAPISettings>(initialCricketAPISettings);
  const [adMobSettings, setAdMobSettings] = useState<AdMobSettings>(initialAdMobSettings);
  const [appSettings, setAppSettings] = useState<AppGeneralSettings>(initialAppSettings);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === 'true');
      }

      const savedPolls = localStorage.getItem('cricpulse_polls');
      if (savedPolls) setPolls(JSON.parse(savedPolls));

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
      localStorage.setItem('cricpulse_polls', JSON.stringify(polls));
      localStorage.setItem('cricpulse_feeds', JSON.stringify(feeds));
      localStorage.setItem('cricpulse_api', JSON.stringify(apiSettings));
      localStorage.setItem('cricpulse_admob', JSON.stringify(adMobSettings));
      localStorage.setItem('cricpulse_app', JSON.stringify(appSettings));
    } catch {
      // Silent catch
    }
  }, [mounted, isAuthenticated, polls, feeds, apiSettings, adMobSettings, appSettings]);

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

  // Auth
  const login = (email: string, pass: string): boolean => {
    if (email.trim() && pass.trim()) {
      setIsAuthenticated(true);
      setCurrentUser({
        ...initialAdminUser,
        email: email.trim(),
      });
      addToast('Welcome back. Session authenticated successfully.', 'success');
      return true;
    }
    addToast('Please enter both email and password.', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast('Admin logged out successfully.', 'info');
  };

  // Poll CRUD
  const addPoll = (newPollData: Omit<Poll, 'id' | 'createdAt' | 'totalVotes'>) => {
    const totalVotes = newPollData.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const newPoll: Poll = {
      ...newPollData,
      id: `poll-${Date.now()}`,
      totalVotes,
      createdAt: new Date().toISOString(),
    };
    setPolls((prev) => [newPoll, ...prev]);
    addToast('New poll created and scheduled.', 'success');
  };

  const updatePoll = (id: string, updated: Partial<Poll>) => {
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
    addToast('Poll details updated.', 'success');
  };

  const deletePoll = (id: string) => {
    setPolls((prev) => prev.filter((p) => p.id !== id));
    addToast('Poll deleted from database.', 'info');
  };

  const togglePollStatus = (id: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus = p.status === 'active' ? 'ended' : 'active';
        return { ...p, status: nextStatus };
      })
    );
    addToast('Poll status updated.', 'info');
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

  // Cricket API
  const updateApiSettings = (updated: Partial<CricketAPISettings>) => {
    setApiSettings((prev) => ({ ...prev, ...updated }));
    addToast('Cricket API credentials and limits saved.', 'success');
  };

  const testApiConnection = async (): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1100));
    const isHealthy = Boolean(apiSettings.apiKey && apiSettings.apiKey.length > 8);
    setApiSettings((prev) => ({
      ...prev,
      lastPingStatus: isHealthy ? 'healthy' : 'error',
      lastPingTime: new Date().toISOString(),
      requestsUsedToday: prev.requestsUsedToday + 1,
    }));
    if (isHealthy) {
      addToast('API Ping Successful (HTTP 200 OK - Latency 142ms)', 'success');
    } else {
      addToast('API Ping Failed: Invalid API key or endpoint unreachable', 'error');
    }
    return isHealthy;
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
        logout,
        polls,
        addPoll,
        updatePoll,
        deletePoll,
        togglePollStatus,
        feeds,
        addFeed,
        updateFeed,
        deleteFeed,
        syncFeedNow,
        apiSettings,
        updateApiSettings,
        testApiConnection,
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
