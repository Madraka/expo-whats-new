import { createWebStorage } from '../webStorage';

type TestLocalStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

type TestWindow = {
  localStorage?: TestLocalStorage;
};

function setTestWindow(windowValue: TestWindow) {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: windowValue,
  });
}

function createLocalStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };
}

describe('createWebStorage', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  it('uses browser localStorage when available', async () => {
    const localStorage = createLocalStorage();
    setTestWindow({ localStorage });

    const storage = createWebStorage();

    await storage.setItem('release', '1.0.0');

    expect(await storage.getItem('release')).toBe('1.0.0');

    await storage.removeItem('release');

    expect(await storage.getItem('release')).toBeNull();
  });

  it('uses memory storage when window is unavailable', async () => {
    const storage = createWebStorage();

    await storage.setItem('release', '1.0.0');

    expect(await storage.getItem('release')).toBe('1.0.0');
  });

  it('falls back to memory storage when localStorage access throws', async () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });

    const storage = createWebStorage();

    await storage.setItem('release', '1.0.0');

    expect(await storage.getItem('release')).toBe('1.0.0');
  });

  it('falls back to memory storage when localStorage operations throw', async () => {
    setTestWindow({
      localStorage: {
        getItem() {
          throw new Error('blocked');
        },
        setItem() {
          throw new Error('blocked');
        },
        removeItem() {
          throw new Error('blocked');
        },
      },
    });

    const storage = createWebStorage();

    await storage.setItem('release', '1.0.0');

    expect(await storage.getItem('release')).toBe('1.0.0');

    await storage.removeItem('release');

    expect(await storage.getItem('release')).toBeNull();
  });
});
