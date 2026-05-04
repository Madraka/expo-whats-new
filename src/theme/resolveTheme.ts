import type { WhatsNewTheme } from '../ExpoWhatsNew.types';
import { defaultTheme } from './defaultTheme';

export function resolveTheme(theme?: WhatsNewTheme) {
  return {
    colors: {
      ...defaultTheme.colors,
      ...theme?.colors,
    },
    radius: {
      ...defaultTheme.radius,
      ...theme?.radius,
    },
    spacing: {
      ...defaultTheme.spacing,
      ...theme?.spacing,
    },
  };
}
