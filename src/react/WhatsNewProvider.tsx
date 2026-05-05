import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';

import ExpoWhatsNewModule from '../ExpoWhatsNewModule';
import type { WhatsNewFeature, WhatsNewProviderProps, WhatsNewRelease } from '../ExpoWhatsNew.types';
import { resolveFeatureAction } from '../logic/resolveFeatureAction';
import { DEFAULT_STORAGE_KEY, shouldShowWhatsNew } from '../logic/shouldShowWhatsNew';
import { resolveReleaseSource } from '../source/resolveReleaseSource';
import { setReleaseAcknowledgement } from '../storage/acknowledgementStorage';
import { createDefaultStorage } from '../storage/createDefaultStorage';
import { resolveTheme } from '../theme/resolveTheme';
import { WhatsNewContext } from './WhatsNewContext';

export function WhatsNewProvider({
  children,
  releases,
  source,
  autoShow = false,
  storage = createDefaultStorage(),
  storageKey = DEFAULT_STORAGE_KEY,
  displayPolicy = 'once-per-release',
  platform,
  appVersion,
  locale,
  fallbackLocale,
  audience,
  allowedUrlSchemes,
  onAutoShow,
  onActionPress: handleActionPress,
  onAccept,
  onDecline,
  analytics,
  theme,
}: WhatsNewProviderProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [visible, setVisible] = useState(false);
  const [currentRelease, setCurrentRelease] = useState<WhatsNewRelease | null>(null);
  const [hasUnseenRelease, setHasUnseenRelease] = useState(false);
  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);

  const resolveState = useCallback(async () => {
    const [resolvedReleases, appInfo] = await Promise.all([
      resolveReleaseSource({ source, releases, storage, locale, fallbackLocale }),
      ExpoWhatsNewModule.getAppInfo().catch(() => null),
    ]);

    return shouldShowWhatsNew({
      releases: resolvedReleases,
      storage,
      storageKey,
      displayPolicy,
      locale,
      fallbackLocale,
      audience,
      appVersion: appVersion ?? appInfo?.version ?? null,
      platform: platform ?? appInfo?.platform ?? (Platform.OS === 'web' ? 'web' : Platform.OS === 'android' ? 'android' : 'ios'),
    });
  }, [appVersion, audience, displayPolicy, fallbackLocale, locale, platform, releases, source, storage, storageKey]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const result = await resolveState();

      setCurrentRelease(result.release);
      setHasUnseenRelease(result.shouldShow);
      setStatus('ready');
    } catch (refreshError) {
      setCurrentRelease(null);
      setHasUnseenRelease(false);
      setError(refreshError instanceof Error ? refreshError : new Error('Failed to resolve whats-new releases.'));
      setStatus('error');
    }
  }, [resolveState]);

  useEffect(() => {
    let mounted = true;

    setStatus('loading');
    setError(null);

    resolveState()
      .then((result) => {
        if (!mounted) {
          return;
        }

        setCurrentRelease(result.release);
        setHasUnseenRelease(result.shouldShow);
        setStatus('ready');

        if (autoShow && result.shouldShow && result.release) {
          if (onAutoShow) {
            Promise.resolve(onAutoShow(result.release)).catch((autoShowError) => {
              if (!mounted) {
                return;
              }

              setError(autoShowError instanceof Error ? autoShowError : new Error('Failed to auto-show whats-new release.'));
              setStatus('error');
            });
          } else {
            setVisible(true);
          }
          analytics?.onShow?.(result.release);
        }
      })
      .catch((loadError) => {
        if (!mounted) {
          return;
        }

        setCurrentRelease(null);
        setHasUnseenRelease(false);
        setError(loadError instanceof Error ? loadError : new Error('Failed to resolve whats-new releases.'));
        setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, [analytics, autoShow, onAutoShow, resolveState]);

  const show = useCallback(() => {
    if (currentRelease) {
      analytics?.onShow?.(currentRelease);
    }
    setVisible(true);
  }, [analytics, currentRelease]);

  const hide = useCallback(() => {
    if (currentRelease) {
      analytics?.onDismiss?.(currentRelease);
    }
    setVisible(false);
  }, [analytics, currentRelease]);

  const markSeen = useCallback(async () => {
    if (!currentRelease) {
      return;
    }

    await setReleaseAcknowledgement(storage, storageKey, currentRelease, 'seen');
    setHasUnseenRelease(false);
    setVisible(false);
    analytics?.onMarkSeen?.(currentRelease);
  }, [analytics, currentRelease, storage, storageKey]);

  const accept = useCallback(async () => {
    if (!currentRelease) {
      return;
    }

    await setReleaseAcknowledgement(storage, storageKey, currentRelease, 'accepted');
    setHasUnseenRelease(false);
    setVisible(false);
    analytics?.onAccept?.(currentRelease);
    await onAccept?.(currentRelease);
  }, [analytics, currentRelease, onAccept, storage, storageKey]);

  const decline = useCallback(async () => {
    if (!currentRelease) {
      return;
    }

    await setReleaseAcknowledgement(storage, storageKey, currentRelease, 'declined');
    setHasUnseenRelease(true);
    setVisible(false);
    analytics?.onDecline?.(currentRelease);
    await onDecline?.(currentRelease);
  }, [analytics, currentRelease, onDecline, storage, storageKey]);

  const reset = useCallback(async () => {
    await storage.removeItem(storageKey);
    setHasUnseenRelease(Boolean(currentRelease));
  }, [currentRelease, storage, storageKey]);

  const onActionPress = useCallback(
    async (feature: WhatsNewFeature) => {
      if (!currentRelease) {
        return;
      }

      try {
        analytics?.onActionPress?.(feature, currentRelease);

        const action = resolveFeatureAction(feature, currentRelease, { allowedUrlSchemes });

        if (action.type === 'url') {
          await Linking.openURL(action.url);
          return;
        }

        if (action.type === 'custom') {
          await handleActionPress?.(feature, currentRelease);
        }
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError : new Error('Failed to handle whats-new action.'));
        setStatus('error');
      }
    },
    [allowedUrlSchemes, analytics, currentRelease, handleActionPress]
  );

  const value = useMemo(
    () => ({
      status,
      error,
      visible,
      currentRelease,
      hasUnseenRelease,
      refresh,
      show,
      hide,
      markSeen,
      accept,
      decline,
      reset,
      onActionPress,
      analytics,
      theme: resolvedTheme,
    }),
    [
      analytics,
      accept,
      currentRelease,
      decline,
      error,
      hasUnseenRelease,
      hide,
      markSeen,
      onActionPress,
      refresh,
      reset,
      resolvedTheme,
      show,
      status,
      visible,
    ]
  );

  return <WhatsNewContext.Provider value={value}>{children}</WhatsNewContext.Provider>;
}
