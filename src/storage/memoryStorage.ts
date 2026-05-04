import type { WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';

export function createMemoryStorage(initialValues?: Record<string, string>): WhatsNewStorageAdapter {
  const values = new Map<string, string>(Object.entries(initialValues ?? {}));

  return {
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
  };
}
