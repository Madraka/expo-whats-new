import type { ReactNode } from 'react';

export type PlatformTarget = 'ios' | 'android' | 'web';

export type AppInfo = {
  platform: PlatformTarget;
  version: string | null;
  buildNumber: string | null;
};

export type NativeStorageCapabilities = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  removeItemAsync(key: string): Promise<void>;
};

export type WhatsNewFeatureAction = {
  label: string;
  url?: string;
  screen?: string;
  payload?: Record<string, unknown>;
};

export type WhatsNewFeature = {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  action?: WhatsNewFeatureAction;
};

export type WhatsNewReleaseKind = 'whats-new' | 'announcement' | 'policy' | 'consent';

export type WhatsNewAcknowledgementMode = 'seen' | 'accepted';

export type WhatsNewAcknowledgement = {
  mode?: WhatsNewAcknowledgementMode;
  required?: boolean;
  acceptLabel?: string;
  declineLabel?: string;
};

export type WhatsNewAcknowledgementStatus = 'seen' | 'accepted' | 'declined';

export type WhatsNewRelease = {
  version: string;
  kind?: WhatsNewReleaseKind;
  title?: string;
  subtitle?: string;
  date?: string;
  features: WhatsNewFeature[];
  acknowledgement?: WhatsNewAcknowledgement;
  minAppVersion?: string;
  maxAppVersion?: string;
  platform?: PlatformTarget[];
  locale?: string | string[];
  audience?: string | string[];
  metadata?: Record<string, unknown>;
};

export type WhatsNewReleaseSource =
  | {
      type: 'static';
      releases: WhatsNewRelease[];
    }
  | {
      type: 'remote';
      url: string;
      headers?: Record<string, string>;
      cache?: boolean;
      fetcher?: (url: string, options: { headers?: Record<string, string> }) => Promise<unknown>;
    };

export type DisplayPolicy = 'once-per-release' | 'always' | 'manual';

export type WhatsNewStatus = 'idle' | 'loading' | 'ready' | 'error';

export type WhatsNewStorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export type ShouldShowWhatsNewOptions = {
  releases: WhatsNewRelease[];
  storage: WhatsNewStorageAdapter;
  storageKey?: string;
  displayPolicy?: DisplayPolicy;
  platform?: PlatformTarget;
  locale?: string;
  audience?: string | string[];
};

export type ShouldShowWhatsNewResult = {
  shouldShow: boolean;
  release: WhatsNewRelease | null;
};

export type WhatsNewAnalyticsAdapter = {
  onShow?: (release: WhatsNewRelease) => void;
  onDismiss?: (release: WhatsNewRelease) => void;
  onMarkSeen?: (release: WhatsNewRelease) => void;
  onAccept?: (release: WhatsNewRelease) => void;
  onDecline?: (release: WhatsNewRelease) => void;
  onActionPress?: (feature: WhatsNewFeature, release: WhatsNewRelease) => void;
};

export type WhatsNewAutoShowHandler = (release: WhatsNewRelease) => void | Promise<void>;

export type WhatsNewActionHandler = (feature: WhatsNewFeature, release: WhatsNewRelease) => void | Promise<void>;
export type WhatsNewDecisionHandler = (release: WhatsNewRelease) => void | Promise<void>;

export type WhatsNewTheme = {
  colors?: {
    backdrop?: string;
    background?: string;
    surface?: string;
    text?: string;
    muted?: string;
    primary?: string;
    border?: string;
  };
  radius?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  spacing?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
};

export type WhatsNewProviderProps = {
  children: ReactNode;
  releases?: WhatsNewRelease[];
  source?: WhatsNewReleaseSource;
  autoShow?: boolean;
  storage?: WhatsNewStorageAdapter;
  storageKey?: string;
  displayPolicy?: DisplayPolicy;
  locale?: string;
  audience?: string | string[];
  onAutoShow?: WhatsNewAutoShowHandler;
  onActionPress?: WhatsNewActionHandler;
  onAccept?: WhatsNewDecisionHandler;
  onDecline?: WhatsNewDecisionHandler;
  analytics?: WhatsNewAnalyticsAdapter;
  theme?: WhatsNewTheme;
};

export type WhatsNewContentProps = {
  doneLabel?: string;
  onDone?: () => void | Promise<void>;
  showDoneButton?: boolean;
};
