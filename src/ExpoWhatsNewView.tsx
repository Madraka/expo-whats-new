import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoWhatsNewViewProps } from './ExpoWhatsNew.types';

const NativeView: React.ComponentType<ExpoWhatsNewViewProps> =
  requireNativeView('ExpoWhatsNew');

export default function ExpoWhatsNewView(props: ExpoWhatsNewViewProps) {
  return <NativeView {...props} />;
}
