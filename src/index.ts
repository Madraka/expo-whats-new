// Reexport the native module. On web, it will be resolved to ExpoWhatsNewModule.web.ts
// and on native platforms to ExpoWhatsNewModule.ts
export { default } from './ExpoWhatsNewModule';
export { default as ExpoWhatsNewView } from './ExpoWhatsNewView';
export * from  './ExpoWhatsNew.types';
