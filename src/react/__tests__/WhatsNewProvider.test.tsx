import { useEffect, type ComponentProps } from 'react';
import { act, create } from 'react-test-renderer';

import type { WhatsNewRelease } from '../../ExpoWhatsNew.types';
import { createMemoryStorage } from '../../storage/memoryStorage';
import { WhatsNewProvider } from '../WhatsNewProvider';
import type { WhatsNewContextValue } from '../WhatsNewContext';
import { useWhatsNew } from '../useWhatsNew';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('../../ExpoWhatsNewModule', () => ({
  __esModule: true,
  default: {
    getAppInfo: jest.fn(async () => ({
      platform: 'ios',
      version: null,
      buildNumber: null,
    })),
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    removeItemAsync: jest.fn(),
  },
}));

const originalConsoleError = console.error;

const releases: WhatsNewRelease[] = [
  {
    version: '1.0.0',
    features: [{ title: 'Initial release' }],
  },
  {
    version: '1.1.0',
    features: [{ title: 'Better release notes' }],
  },
];

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

async function renderProvider({
  autoShow,
  onAutoShow,
  storage = createMemoryStorage(),
  analytics,
}: {
  autoShow?: boolean;
  onAutoShow?: (release: WhatsNewRelease) => void | Promise<void>;
  storage?: ReturnType<typeof createMemoryStorage>;
  analytics?: ComponentProps<typeof WhatsNewProvider>['analytics'];
} = {}) {
  const snapshots: WhatsNewContextValue[] = [];

  await act(async () => {
    create(
      <WhatsNewProvider
        analytics={analytics}
        autoShow={autoShow}
        onAutoShow={onAutoShow}
        releases={releases}
        storage={storage}
      >
        <Probe onValue={(value) => snapshots.push(value)} />
      </WhatsNewProvider>
    );
    await flushPromises();
  });

  return {
    get value() {
      return snapshots[snapshots.length - 1];
    },
    snapshots,
    storage,
  };
}

describe('WhatsNewProvider', () => {
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

  it('exposes the newest unseen release through the hook', async () => {
    const harness = await renderProvider();

    expect(harness.value.status).toBe('ready');
    expect(harness.value.currentRelease?.version).toBe('1.1.0');
    expect(harness.value.hasUnseenRelease).toBe(true);
    expect(harness.value.visible).toBe(false);
  });

  it('toggles visibility manually and emits show and dismiss analytics', async () => {
    const analytics = {
      onShow: jest.fn(),
      onDismiss: jest.fn(),
    };
    const harness = await renderProvider({ analytics });

    await act(async () => {
      harness.value.show();
      await flushPromises();
    });

    expect(harness.value.visible).toBe(true);
    expect(analytics.onShow).toHaveBeenCalledWith(expect.objectContaining({ version: '1.1.0' }));

    await act(async () => {
      harness.value.hide();
      await flushPromises();
    });

    expect(harness.value.visible).toBe(false);
    expect(analytics.onDismiss).toHaveBeenCalledWith(expect.objectContaining({ version: '1.1.0' }));
  });

  it('persists acknowledgement when marking the release as seen', async () => {
    const storage = createMemoryStorage();
    const harness = await renderProvider({ storage });

    await act(async () => {
      harness.value.show();
      await harness.value.markSeen();
      await flushPromises();
    });

    expect(harness.value.visible).toBe(false);
    expect(harness.value.hasUnseenRelease).toBe(false);
    expect(await storage.getItem('expo-whats-new:seen-release')).toContain('1.1.0');
  });

  it('auto-shows inside provider state when no route handler is provided', async () => {
    const analytics = {
      onShow: jest.fn(),
    };
    const harness = await renderProvider({ analytics, autoShow: true });

    expect(harness.value.status).toBe('ready');
    expect(harness.value.visible).toBe(true);
    expect(analytics.onShow).toHaveBeenCalledWith(expect.objectContaining({ version: '1.1.0' }));
  });

  it('keeps visibility host-owned when onAutoShow handles presentation', async () => {
    const onAutoShow = jest.fn();
    const harness = await renderProvider({ autoShow: true, onAutoShow });

    expect(harness.value.status).toBe('ready');
    expect(harness.value.visible).toBe(false);
    expect(onAutoShow).toHaveBeenCalledWith(expect.objectContaining({ version: '1.1.0' }));
  });

  it('surfaces async auto-show failures as provider errors', async () => {
    const autoShowError = new Error('route failed');
    const harness = await renderProvider({
      autoShow: true,
      onAutoShow: async () => {
        throw autoShowError;
      },
    });

    await act(async () => {
      await flushPromises();
    });

    expect(harness.value.status).toBe('error');
    expect(harness.value.error).toBe(autoShowError);
  });
});
