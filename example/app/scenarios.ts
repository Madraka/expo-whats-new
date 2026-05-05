import { createElement } from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import type { DisplayPolicy, WhatsNewRelease, WhatsNewReleaseSource } from 'expo-whats-new';

export type ExampleScenario = {
  id: string;
  title: string;
  description: string;
  storageKey: string;
  displayPolicy?: DisplayPolicy;
  releases?: WhatsNewRelease[];
  source?: WhatsNewReleaseSource;
};

const styles = StyleSheet.create({
  symbol: {
    height: 56,
    width: 56,
  },
});

function symbol(name: string) {
  return createElement(Image, {
    source: `sf:${name}`,
    style: styles.symbol,
    tintColor: '#0a84ff',
  });
}

const whatsNewReleases: WhatsNewRelease[] = [
  {
    version: '2.0.0',
    title: 'What is new in 2.0',
    subtitle: 'A native sheet release note flow for Expo apps.',
    features: [
      {
        title: 'Native modal sheet',
        description: 'Presented with Expo Router native-stack formSheet presentation.',
        icon: symbol('rectangle.bottomthird.inset.filled'),
      },
      {
        title: 'Toolbar action',
        description: 'The Continue button lives in the native header instead of inside the content.',
        icon: symbol('button.programmable'),
      },
      {
        title: 'Durable acknowledgement',
        description: 'Seen state is persisted through platform storage where native modules are available.',
        icon: symbol('checkmark.seal.fill'),
      },
    ],
  },
];

const policyReleases: WhatsNewRelease[] = [
  {
    kind: 'policy',
    version: '2026.05.terms',
    title: 'Updated Terms',
    subtitle: 'Please review the latest terms before continuing.',
    acknowledgement: {
      mode: 'accepted',
      required: true,
      acceptLabel: 'Continue',
      declineLabel: 'Not now',
    },
    features: [
      {
        title: 'Account terms',
        description: 'We clarified account ownership and service availability language.',
        icon: symbol('doc.text.fill'),
      },
      {
        title: 'Privacy language',
        description: 'We improved wording around diagnostics, support logs, and optional analytics.',
        icon: symbol('lock.shield.fill'),
      },
    ],
  },
];

const consentReleases: WhatsNewRelease[] = [
  {
    kind: 'consent',
    version: '2026.05.analytics-consent',
    title: 'Help improve the app',
    subtitle: 'Choose whether product analytics can be used to improve reliability.',
    acknowledgement: {
      mode: 'accepted',
      required: true,
      acceptLabel: 'Allow and continue',
      declineLabel: 'Continue without sharing',
    },
    features: [
      {
        title: 'Optional analytics',
        description: 'Usage signals help us find crashes, slow screens, and confusing flows.',
        icon: symbol('chart.bar.xaxis'),
      },
      {
        title: 'No personal content',
        description: 'Event payloads should never include messages, documents, or private user content.',
        icon: symbol('person.crop.circle.badge.checkmark'),
      },
    ],
  },
];

const guideReleases: WhatsNewRelease[] = [
  {
    id: 'interactive-guide',
    version: '2026.05.guide',
    presentation: 'guide',
    title: 'Interactive Guide',
    subtitle: 'A host-rendered media walkthrough without adding animation dependencies to the core package.',
    acknowledgement: {
      mode: 'accepted',
      required: true,
      acceptLabel: 'Start using it',
    },
    features: [
      {
        title: 'Host-rendered media',
        description: 'The package provides the guide structure while the app renders Lottie, Rive, video, or symbols.',
        media: {
          type: 'custom',
          assetId: 'guide-media',
          accessibilityLabel: 'A layered guide animation placeholder',
        },
      },
    ],
    steps: [
      {
        title: 'Show the concept',
        description: 'Use large visual media to introduce the new workflow before showing controls.',
        media: {
          type: 'custom',
          assetId: 'guide-concept',
          accessibilityLabel: 'Guide concept animation',
        },
      },
      {
        title: 'Teach the action',
        description: 'Pair each step with one clear user action and keep acknowledgement for the final CTA.',
        media: {
          type: 'custom',
          assetId: 'guide-action',
          accessibilityLabel: 'Guide action animation',
        },
      },
      {
        title: 'Keep core lightweight',
        description: 'Lottie or Rive stays in the host app through renderMedia, so apps choose their own renderer.',
        media: {
          type: 'custom',
          assetId: 'guide-core',
          accessibilityLabel: 'Core package boundary animation',
        },
      },
    ],
  },
];

const actionReleases: WhatsNewRelease[] = [
  {
    version: '2.1.0-actions',
    title: 'Feature actions',
    subtitle: 'Actions can open URLs or delegate navigation to the host app.',
    features: [
      {
        title: 'Open documentation',
        description: 'URL actions are handled through React Native Linking.',
        icon: symbol('safari.fill'),
        action: {
          label: 'Open Expo docs',
          url: 'https://docs.expo.dev',
        },
      },
      {
        title: 'Navigate inside the app',
        description: 'Screen actions are passed to the app through onActionPress.',
        icon: symbol('arrow.turn.up.right'),
        action: {
          label: 'Open custom screen',
          screen: '/details',
          payload: {
            source: 'whats-new-action',
          },
        },
      },
    ],
  },
];

const announcementReleases: WhatsNewRelease[] = [
  {
    kind: 'announcement',
    version: '2026.05.maintenance',
    title: 'Scheduled Maintenance',
    subtitle: 'A lightweight announcement that only needs to be seen once.',
    features: [
      {
        title: 'Maintenance window',
        description: 'Some services may be unavailable between 02:00 and 03:00 UTC.',
        icon: symbol('clock.fill'),
      },
      {
        title: 'No user action required',
        description: 'The event is acknowledged as seen after the user taps Done.',
        icon: symbol('checkmark.circle.fill'),
      },
    ],
  },
];

const remoteReleases: WhatsNewRelease[] = [
  {
    id: 'localized-remote-source',
    version: 'remote-2026.05',
    title: 'Remote source',
    subtitle: 'Loaded from a simulated CDN response with cache enabled.',
    features: [
      {
        title: 'Remote JSON',
        description: 'The provider can resolve releases from an array or a { releases } object.',
      },
      {
        title: 'Cache fallback',
        description: 'When cache is enabled, successful responses are stored for later offline fallback.',
      },
    ],
    localizations: {
      en: {
        title: 'Remote source',
        subtitle: 'Loaded from a simulated CDN response with cache enabled.',
        acknowledgement: {
          acceptLabel: 'Continue',
        },
        features: [
          {
            title: 'Validated JSON',
            description: 'Remote payloads are checked before any content reaches the UI.',
          },
          {
            title: 'Localized copy',
            description: 'The host app passes the Expo locale while the package keeps acknowledgement state stable.',
          },
        ],
      },
      tr: {
        title: 'Uzak kaynak',
        subtitle: 'Cache destekli simüle edilmiş CDN yanıtından yüklendi.',
        acknowledgement: {
          acceptLabel: 'Sürdür',
        },
        features: [
          {
            title: 'Doğrulanan JSON',
            description: 'Uzak payload, içerik UI’a ulaşmadan önce kontrol edilir.',
          },
          {
            title: 'Dil uyumlu metin',
            description: 'Host app Expo locale bilgisini verir, paket kabul durumunu aynı release üzerinde tutar.',
          },
        ],
      },
    },
  },
];

export const scenarios: ExampleScenario[] = [
  {
    id: 'whats-new',
    title: 'Release Notes',
    description: 'Once-per-release native sheet for product updates.',
    storageKey: 'example:whats-new',
    releases: whatsNewReleases,
  },
  {
    id: 'policy',
    title: 'Policy Acknowledgement',
    description: 'Required Apple-style Continue flow for updated terms.',
    storageKey: 'example:policy',
    releases: policyReleases,
  },
  {
    id: 'consent',
    title: 'Consent Prompt',
    description: 'Accept/decline event with explicit decision callbacks.',
    storageKey: 'example:consent',
    releases: consentReleases,
  },
  {
    id: 'actions',
    title: 'Feature Actions',
    description: 'URL and app-navigation actions inside a release event.',
    storageKey: 'example:actions',
    releases: actionReleases,
  },
  {
    id: 'guide',
    title: 'Interactive Guide',
    description: 'Step-based guide sheet with host-rendered media slots.',
    storageKey: 'example:guide',
    releases: guideReleases,
  },
  {
    id: 'announcement',
    title: 'Announcement',
    description: 'A lightweight once-seen message for operational notices.',
    storageKey: 'example:announcement',
    releases: announcementReleases,
  },
  {
    id: 'remote',
    title: 'Remote Source',
    description: 'Simulated remote JSON source with cache enabled.',
    storageKey: 'example:remote',
    source: {
      type: 'remote',
      url: 'https://cdn.example.com/whats-new.json',
      cache: true,
      cacheKey: 'example:remote-localized',
      cacheTtlMs: 1000 * 60 * 60,
      requestPolicy: 'cache-first',
      timeoutMs: 5000,
      fetcher: async () => ({ releases: remoteReleases }),
    },
  },
  {
    id: 'manual',
    title: 'Manual Mode',
    description: 'Provider resolves the event without auto-showing it.',
    storageKey: 'example:manual',
    displayPolicy: 'manual',
    releases: [
      {
        version: 'manual-1',
        title: 'Manual presentation',
        subtitle: 'Use this when the app decides exactly when to present the event.',
        features: [
          {
            title: 'No automatic prompt',
            description: 'The sheet opens only when the app navigates to the route.',
            icon: symbol('hand.tap.fill'),
          },
        ],
      },
    ],
  },
];

export const defaultScenario = scenarios[0];
