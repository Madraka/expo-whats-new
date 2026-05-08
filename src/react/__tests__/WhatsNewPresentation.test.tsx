import { useEffect, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text } from 'react-native';
import { act, create, type ReactTestInstance } from 'react-test-renderer';

import type { WhatsNewRelease } from '../../ExpoWhatsNew.types';
import { createMemoryStorage } from '../../storage/memoryStorage';
import { WhatsNewInline } from '../WhatsNewInline';
import { WhatsNewModal } from '../WhatsNewModal';
import { WhatsNewProvider } from '../WhatsNewProvider';
import { useWhatsNew } from '../useWhatsNew';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({
  Image: 'Image',
  Linking: {
    openURL: jest.fn(),
  },
  Modal: 'Modal',
  Platform: {
    OS: 'ios',
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
  useWindowDimensions: () => ({ height: 844, width: 390 }),
  View: 'View',
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

const requiredConsentRelease: WhatsNewRelease = {
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
    },
    {
      title: 'No personal content',
      description: 'Event payloads should never include messages, documents, or private user content.',
    },
  ],
};

const optionalRelease: WhatsNewRelease = {
  version: '2.0.0',
  title: 'What is new',
  features: [{ title: 'Native sheet' }],
};

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
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

async function renderWithRelease(children: ReactNode, release: WhatsNewRelease) {
  let renderer: ReturnType<typeof create> | null = null;

  await act(async () => {
    renderer = create(
      <WhatsNewProvider releases={[release]} storage={createMemoryStorage()}>
        <ShowOnReady />
        {children}
      </WhatsNewProvider>
    );
    await flushPromises();
  });

  if (!renderer) {
    throw new Error('Failed to render provider.');
  }

  return renderer;
}

function textContent(instance: ReactTestInstance) {
  return instance.findAllByType(Text).map((textNode) => textNode.props.children).flat().join(' ');
}

describe('WhatsNew presentation surfaces', () => {
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

  it('keeps event-sheet header and feature content in one vertical scroll flow', async () => {
    const renderer = await renderWithRelease(<WhatsNewInline variant="event-sheet" />, requiredConsentRelease);
    const scrollViews = renderer.root.findAllByType(ScrollView);
    const verticalScroll = scrollViews.find((scrollView) => scrollView.props.horizontal !== true);

    expect(verticalScroll).toBeDefined();
    expect(verticalScroll?.props.contentInsetAdjustmentBehavior).toBe('never');
    expect(textContent(verticalScroll as ReactTestInstance)).toContain('Help improve the app');
    expect(textContent(verticalScroll as ReactTestInstance)).toContain('Optional analytics');
  });

  it('calls onDone after a decline action so route-owned sheets can close', async () => {
    const onDone = jest.fn();
    const renderer = await renderWithRelease(<WhatsNewInline onDone={onDone} variant="event-sheet" />, requiredConsentRelease);
    const declineButton = renderer.root
      .findAllByType(Pressable)
      .find((pressable) => textContent(pressable).includes('Continue without sharing'));

    expect(declineButton).toBeDefined();

    await act(async () => {
      await declineButton?.props.onPress();
      await flushPromises();
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('disables swipe and backdrop dismissal for required fallback modals', async () => {
    const renderer = await renderWithRelease(<WhatsNewModal allowSwipeDismissal variant="event-sheet" />, requiredConsentRelease);
    const modal = renderer.root.findByType(Modal);
    const dismissButtons = renderer.root.findAllByType(Pressable).filter((pressable) => String(pressable.props.accessibilityLabel).startsWith('Dismiss'));

    expect(modal.props.visible).toBe(true);
    expect(modal.props.allowSwipeDismissal).toBe(false);
    expect(dismissButtons).toHaveLength(0);
  });

  it('allows host-enabled swipe dismissal for optional fallback modals', async () => {
    const renderer = await renderWithRelease(<WhatsNewModal allowSwipeDismissal />, optionalRelease);
    const modal = renderer.root.findByType(Modal);
    const dismissButtons = renderer.root.findAllByType(Pressable).filter((pressable) => String(pressable.props.accessibilityLabel).startsWith('Dismiss'));

    expect(modal.props.visible).toBe(true);
    expect(modal.props.allowSwipeDismissal).toBe(true);
    expect(dismissButtons).toHaveLength(1);
  });
});
