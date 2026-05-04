import type { WhatsNewTheme } from '../ExpoWhatsNew.types';

export const defaultTheme = {
  colors: {
    backdrop: 'rgba(15, 23, 42, 0.48)',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#111827',
    muted: '#64748b',
    primary: '#2563eb',
    border: '#e2e8f0',
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
} satisfies Required<WhatsNewTheme>;
