import { NativeModule, requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

import type { AppInfo, NativeStorageCapabilities } from './ExpoWhatsNew.types';
import { createMemoryStorage } from './storage/memoryStorage';

declare class ExpoWhatsNewNativeModule extends NativeModule implements NativeStorageCapabilities {
  getAppInfo(): Promise<AppInfo>;
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  removeItemAsync(key: string): Promise<void>;
}

const nativeModule = requireOptionalNativeModule<ExpoWhatsNewNativeModule>('ExpoWhatsNew');
const fallbackStorage = createMemoryStorage();

const ExpoWhatsNewModule: Pick<
  ExpoWhatsNewNativeModule,
  'getAppInfo' | 'getItemAsync' | 'setItemAsync' | 'removeItemAsync'
> = nativeModule ?? {
  async getAppInfo() {
    return {
      platform: Platform.OS === 'android' ? 'android' : 'ios',
      version: null,
      buildNumber: null,
    };
  },
  getItemAsync(key) {
    return fallbackStorage.getItem(key);
  },
  setItemAsync(key, value) {
    return fallbackStorage.setItem(key, value);
  },
  removeItemAsync(key) {
    return fallbackStorage.removeItem(key);
  },
};

export default ExpoWhatsNewModule;
