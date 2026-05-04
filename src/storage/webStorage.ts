import type { WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';
import { createMemoryStorage } from './memoryStorage';

export function createWebStorage(): WhatsNewStorageAdapter {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createMemoryStorage();
  }

  return {
    async getItem(key) {
      return window.localStorage.getItem(key);
    },
    async setItem(key, value) {
      window.localStorage.setItem(key, value);
    },
    async removeItem(key) {
      window.localStorage.removeItem(key);
    },
  };
}
