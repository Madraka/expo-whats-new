import type { WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';
import { createMemoryStorage } from './memoryStorage';

function getBrowserLocalStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function createWebStorage(): WhatsNewStorageAdapter {
  const fallbackStorage = createMemoryStorage();
  let browserStorage = getBrowserLocalStorage();

  return {
    async getItem(key) {
      if (!browserStorage) {
        return fallbackStorage.getItem(key);
      }

      try {
        return browserStorage.getItem(key);
      } catch {
        browserStorage = null;
        return fallbackStorage.getItem(key);
      }
    },
    async setItem(key, value) {
      if (!browserStorage) {
        await fallbackStorage.setItem(key, value);
        return;
      }

      try {
        browserStorage.setItem(key, value);
      } catch {
        browserStorage = null;
        await fallbackStorage.setItem(key, value);
      }
    },
    async removeItem(key) {
      if (!browserStorage) {
        await fallbackStorage.removeItem(key);
        return;
      }

      try {
        browserStorage.removeItem(key);
      } catch {
        browserStorage = null;
        await fallbackStorage.removeItem(key);
      }
    },
  };
}
