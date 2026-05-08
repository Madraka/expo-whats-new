import { useEffect, useRef } from 'react';
import { useWhatsNew } from 'expo-whats-new';

import { openWhatsNewSheet } from './whats-new-route';

export function useAutoPresentScenario(enabled: boolean, identity: string) {
  const { currentRelease, hasUnseenRelease, status } = useWhatsNew();
  const promptedIdentity = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || status !== 'ready' || !hasUnseenRelease || !currentRelease) {
      return;
    }

    const promptIdentity = `${identity}:${currentRelease.id ?? currentRelease.version}`;

    if (promptedIdentity.current === promptIdentity) {
      return;
    }

    promptedIdentity.current = promptIdentity;
    openWhatsNewSheet();
  }, [currentRelease, enabled, hasUnseenRelease, identity, status]);
}
