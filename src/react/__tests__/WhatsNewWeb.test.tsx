import { useEffect, type ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';
import { act, create } from 'react-test-renderer';

import type { WhatsNewRelease } from '../../ExpoWhatsNew.types';
import { createMemoryStorage } from '../../storage/memoryStorage';
import { WhatsNewModal } from '../WhatsNewModal';
import { WhatsNewProvider } from '../WhatsNewProvider';
import type { WhatsNewContextValue } from '../WhatsNewContext';
import { useWhatsNew } from '../useWhatsNew';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({
  Image: 'Image',
  Linking: {
    openURL: jest.fn(),
  },
  Modal: 'Modal',
  Platform: {
    OS: 'web',
  },
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: {
    absoluteFill: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    create: (styles: unknown) => styles,
    hairlineWidth: 1,
  },
  Text: 'Text',
  useWindowDimensions: () => ({ height: 768, width: 1024 }),
  View: 'View',
}));

jest.mock('../../ExpoWhatsNewModule', () => ({
  __esModule: true,
  default: {
    getAppInfo: jest.fn(async () => ({
      platform: 'web',
      version: null,
      buildNumber: null,
    })),
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    removeItemAsync: jest.fn(),
  },
}));

const originalConsoleError = console.error;

const webRelease: WhatsNewRelease = {
  version: 'web-1',
  title: 'Web release',
  platform: ['web'],
  features: [{ title: 'Browser fallback modal' }],
};

const iosRelease: WhatsNewRelease = {
  version: 'ios-1',
  title: 'iOS release',
  platform: ['ios'],
  features: [{ title: 'Native route' }],
};

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function Probe({ onValue }: { onValue(value: WhatsNewContextValue): void }) {
  const value = useWhatsNew();

  useEffect(() => {
    onValue(value);
  }, [onValue, value]);

  return null;
}

function ShowOnReady() {
  const { show, status } = useWhatsNew();

  useEffect(() => {
    if (status === 'ready') {
      show();
    }
  }, [show, status]);

  return null;
}

async function renderProvider(children: ReactNode, releases: WhatsNewRelease[]) {
  const snapshots: WhatsNewContextValue[] = [];
  let renderer: ReturnType<typeof create> | null = null;

  await act(async () => {
    renderer = create(
      <WhatsNewProvider releases={releases} storage={createMemoryStorage()}>
        <Probe onValue={(value) => snapshots.push(value)} />
        {children}
      </WhatsNewProvider>
    );
    await flushPromises();
  });

  if (!renderer) {
    throw new Error('Failed to render provider.');
  }

  return {
    get value() {
      return snapshots[snapshots.length - 1];
    },
    renderer,
  };
}

async function renderShownModal(release: WhatsNewRelease) {
  let renderer: ReturnType<typeof create> | null = null;

  await act(async () => {
    renderer = create(
      <WhatsNewProvider releases={[release]} storage={createMemoryStorage()}>
        <ShowOnReady />
        <WhatsNewModal />
      </WhatsNewProvider>
    );
    await flushPromises();
  });

  if (!renderer) {
    throw new Error('Failed to render web modal.');
  }

  return renderer;
}

describe('web presentation behavior', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((message?: unknown, ...optionalParams: unknown[]) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) {
        return;
      }

      originalConsoleError(message, ...optionalParams);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('uses the web platform from the Expo module for release targeting', async () => {
    const harness = await renderProvider(null, [iosRelease, webRelease]);

    expect(harness.value.status).toBe('ready');
    expect(harness.value.currentRelease?.version).toBe('web-1');
  });

  it('opens and dismisses the fallback modal on web', async () => {
    const renderer = await renderShownModal(webRelease);
    const modal = renderer.root.findByType(Modal);
    const dismissButton = renderer.root
      .findAllByType(Pressable)
      .find((pressable) => String(pressable.props.accessibilityLabel).startsWith('Dismiss'));

    expect(modal.props.visible).toBe(true);
    expect(modal.props.presentationStyle).toBe('overFullScreen');
    expect(dismissButton).toBeDefined();

    await act(async () => {
      dismissButton?.props.onPress();
      await flushPromises();
    });

    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
  });
});
