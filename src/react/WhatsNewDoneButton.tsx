import { Button } from 'react-native';

import type { WhatsNewContentProps } from '../ExpoWhatsNew.types';
import { getAcceptLabel } from '../storage/acknowledgementStorage';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewDoneButton({ doneLabel = 'Done', onDone }: WhatsNewContentProps) {
  const { accept, currentRelease, markSeen } = useWhatsNew();

  async function handlePress() {
    if (currentRelease?.acknowledgement?.mode === 'accepted' || currentRelease?.kind === 'policy' || currentRelease?.kind === 'consent') {
      await accept();
    } else {
      await markSeen();
    }
    await onDone?.();
  }

  return <Button disabled={!currentRelease} title={currentRelease ? getAcceptLabel(currentRelease, doneLabel) : doneLabel} onPress={handlePress} />;
}
