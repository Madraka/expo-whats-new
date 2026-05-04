import ExpoWhatsNewModule from '../ExpoWhatsNewModule';
import type { WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';

export function createNativeStorage(): WhatsNewStorageAdapter {
  return {
    getItem(key) {
      return ExpoWhatsNewModule.getItemAsync(key);
    },
    setItem(key, value) {
      return ExpoWhatsNewModule.setItemAsync(key, value);
    },
    removeItem(key) {
      return ExpoWhatsNewModule.removeItemAsync(key);
    },
  };
}
