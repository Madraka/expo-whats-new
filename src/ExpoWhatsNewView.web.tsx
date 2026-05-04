import * as React from 'react';

import { ExpoWhatsNewViewProps } from './ExpoWhatsNew.types';

export default function ExpoWhatsNewView(props: ExpoWhatsNewViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
