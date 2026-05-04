import { registerWebModule, NativeModule } from 'expo';

import { ExpoWhatsNewModuleEvents } from './ExpoWhatsNew.types';

class ExpoWhatsNewModule extends NativeModule<ExpoWhatsNewModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoWhatsNewModule, 'ExpoWhatsNewModule');
