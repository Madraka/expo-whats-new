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

export type WhatsNewMediaDescriptor = {
  type: 'image' | 'lottie' | 'rive' | 'video' | 'custom';
  assetId?: string;
  url?: string;
  poster?: string;
  aspectRatio?: number;
  autoplay?: boolean;
  loop?: boolean;
  accessibilityLabel?: string;
  metadata?: Record<string, unknown>;
};

export type WhatsNewFeature = {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  media?: WhatsNewMediaDescriptor;
  action?: WhatsNewFeatureAction;
};

export type WhatsNewRemoteFeature = Omit<WhatsNewFeature, 'icon'>;

export type WhatsNewGuideStep = {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: string;
  media?: WhatsNewMediaDescriptor;
  action?: WhatsNewFeatureAction;
};

export type WhatsNewRemoteGuideStep = Omit<WhatsNewGuideStep, 'icon'>;

export type WhatsNewPresentation = 'list' | 'guide';

export type WhatsNewReleaseKind = 'whats-new' | 'announcement' | 'policy' | 'consent';

export type WhatsNewAcknowledgementMode = 'seen' | 'accepted';

export type WhatsNewAcknowledgement = {
  mode?: WhatsNewAcknowledgementMode;
  required?: boolean;
  acceptLabel?: string;
  declineLabel?: string;
};

export type WhatsNewAcknowledgementStatus = 'seen' | 'accepted' | 'declined';

export type WhatsNewReleaseLocalization = {
  title?: string;
  subtitle?: string;
  features?: WhatsNewRemoteFeature[];
  steps?: WhatsNewRemoteGuideStep[];
  acknowledgement?: Pick<WhatsNewAcknowledgement, 'acceptLabel' | 'declineLabel'>;
};

export type WhatsNewRelease = {
  version: string;
  id?: string;
  kind?: WhatsNewReleaseKind;
  title?: string;
  subtitle?: string;
  date?: string;
  presentation?: WhatsNewPresentation;
  features: WhatsNewFeature[];
  steps?: WhatsNewGuideStep[];
  acknowledgement?: WhatsNewAcknowledgement;
  minAppVersion?: string;
  maxAppVersion?: string;
  platform?: PlatformTarget[];
  locale?: string | string[];
  localizations?: Record<string, WhatsNewReleaseLocalization>;
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
      cacheKey?: string;
      cacheTtlMs?: number;
      requestPolicy?: 'network-first' | 'cache-first';
      timeoutMs?: number;
      fetcher?: (url: string, options: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<unknown>;
    }
  | {
      type: 'custom';
      key: string;
      cache?: boolean;
      cacheKey?: string;
      cacheTtlMs?: number;
      requestPolicy?: 'network-first' | 'cache-first';
      loader: (options: { signal?: AbortSignal }) => Promise<unknown>;
      timeoutMs?: number;
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
  fallbackLocale?: string;
  audience?: string | string[];
  appVersion?: string | null;
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
  platform?: PlatformTarget;
  appVersion?: string | null;
  locale?: string;
  fallbackLocale?: string;
  audience?: string | string[];
  allowedUrlSchemes?: string[];
  onAutoShow?: WhatsNewAutoShowHandler;
  onActionPress?: WhatsNewActionHandler;
  onAccept?: WhatsNewDecisionHandler;
  onDecline?: WhatsNewDecisionHandler;
  analytics?: WhatsNewAnalyticsAdapter;
  theme?: WhatsNewTheme;
};

export type WhatsNewContentVariant = 'card' | 'event-sheet';

export type WhatsNewMediaRenderContext =
  | {
      kind: 'feature';
      media: WhatsNewMediaDescriptor;
      feature: WhatsNewFeature;
      release: WhatsNewRelease;
      index: number;
    }
  | {
      kind: 'step';
      media: WhatsNewMediaDescriptor;
      step: WhatsNewGuideStep;
      release: WhatsNewRelease;
      index: number;
    };

export type WhatsNewContentProps = {
  doneLabel?: string;
  onDone?: () => void | Promise<void>;
  renderMedia?: (context: WhatsNewMediaRenderContext) => ReactNode;
  showDoneButton?: boolean;
  variant?: WhatsNewContentVariant;
};
