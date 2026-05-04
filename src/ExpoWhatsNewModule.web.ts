import { NativeModule, registerWebModule } from 'expo';

import type { AppInfo } from './ExpoWhatsNew.types';
import { createWebStorage } from './storage/webStorage';

const storage = createWebStorage();

class ExpoWhatsNewModule extends NativeModule {
  async getAppInfo(): Promise<AppInfo> {
    return {
      platform: 'web',
      version: null,
      buildNumber: null,
    };
  }

  getItemAsync(key: string): Promise<string | null> {
    return storage.getItem(key);
  }

  setItemAsync(key: string, value: string): Promise<void> {
    return storage.setItem(key, value);
  }

  removeItemAsync(key: string): Promise<void> {
    return storage.removeItem(key);
  }
}

export default registerWebModule(ExpoWhatsNewModule, 'ExpoWhatsNew');
