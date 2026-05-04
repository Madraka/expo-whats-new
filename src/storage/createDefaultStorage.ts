import { Platform } from 'react-native';

import type { WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';
import { createNativeStorage } from './nativeStorage';
import { createWebStorage } from './webStorage';

let defaultStorage: WhatsNewStorageAdapter | null = null;

export function createDefaultStorage(): WhatsNewStorageAdapter {
  if (!defaultStorage) {
    defaultStorage = Platform.OS === 'web' ? createWebStorage() : createNativeStorage();
  }

  return defaultStorage;
}
