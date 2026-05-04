import { useContext } from 'react';

import { WhatsNewContext } from './WhatsNewContext';

export function useWhatsNew() {
  const value = useContext(WhatsNewContext);

  if (!value) {
    throw new Error('useWhatsNew must be used within a WhatsNewProvider.');
  }

  return value;
}
