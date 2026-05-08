jest.mock('expo', () => ({
  NativeModule: class NativeModule {},
  registerWebModule: jest.fn((ModuleClass: new () => unknown) => new ModuleClass()),
}));

import ExpoWhatsNewModule from '../ExpoWhatsNewModule.web';

describe('ExpoWhatsNewModule.web', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  it('reports web app info and persists values through the web storage adapter', async () => {
    await expect(ExpoWhatsNewModule.getAppInfo()).resolves.toEqual({
      platform: 'web',
      version: null,
      buildNumber: null,
    });

    await ExpoWhatsNewModule.setItemAsync('release', '1.0.0');

    await expect(ExpoWhatsNewModule.getItemAsync('release')).resolves.toBe('1.0.0');

    await ExpoWhatsNewModule.removeItemAsync('release');

    await expect(ExpoWhatsNewModule.getItemAsync('release')).resolves.toBeNull();
  });
});
