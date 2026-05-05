import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useWhatsNew } from 'expo-whats-new';

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
    router.push('/whats-new');
  }, [currentRelease, enabled, hasUnseenRelease, identity, status]);
}
