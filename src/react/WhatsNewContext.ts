import { createContext } from 'react';

import type {
  WhatsNewAnalyticsAdapter,
  WhatsNewFeature,
  WhatsNewRelease,
  WhatsNewStatus,
  WhatsNewTheme,
} from '../ExpoWhatsNew.types';

export type WhatsNewContextValue = {
  status: WhatsNewStatus;
  error: Error | null;
  visible: boolean;
  currentRelease: WhatsNewRelease | null;
  hasUnseenRelease: boolean;
  refresh(): Promise<void>;
  show(): void;
  hide(): void;
  markSeen(): Promise<void>;
  accept(): Promise<void>;
  decline(): Promise<void>;
  reset(): Promise<void>;
  onActionPress(feature: WhatsNewFeature): Promise<void>;
  analytics?: WhatsNewAnalyticsAdapter;
  theme: Required<WhatsNewTheme>;
};

export const WhatsNewContext = createContext<WhatsNewContextValue | null>(null);
