export type PollStatus = 'active' | 'scheduled' | 'ended' | 'draft';

export type PollCategory = 'Match Prediction' | 'Player of the Match' | 'Tournament Winner' | 'Opinion';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  category: PollCategory;
  options: PollOption[];
  totalVotes: number;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  status: PollStatus;
  allowMultipleVotes: boolean;
  featured: boolean;
  createdAt: string;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: 'International' | 'IPL / T20' | 'Domestic' | 'Editorial';
  status: 'active' | 'paused' | 'error';
  refreshIntervalMinutes: number;
  lastSyncedAt: string;
  articleCount: number;
  autoPublish: boolean;
}

export interface CricketAPISettings {
  provider: 'cricapi' | 'sportmonks' | 'rapidapi_cricket' | 'custom';
  apiKey: string;
  baseUrl: string;
  rateLimitPerDay: number;
  requestsUsedToday: number;
  cacheTtlMinutes: number;
  enableLiveScores: boolean;
  enableUpcomingMatches: boolean;
  enableMatchResults: boolean;
  ballByBallEnabled: boolean;
  lastPingStatus: 'healthy' | 'warning' | 'error' | 'not_tested';
  lastPingTime: string;
}

export interface AdMobSettings {
  adMobAppId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  nativeAdUnitId: string;
  rewardedAdUnitId: string;
  adsEnabledGlobally: boolean;
  bannerOnHomeScreen: boolean;
  interstitialOnNewsDetail: boolean;
  nativeInMatchList: boolean;
  testMode: boolean;
  interstitialFrequencyClicks: number;
}

export interface AppGeneralSettings {
  appName: string;
  currentAppVersion: string;
  minimumRequiredVersion: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  shareMessageTemplate: string;
  supportEmail: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Content Editor';
  avatarUrl?: string;
}
