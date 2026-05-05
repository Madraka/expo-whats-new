import { Stack } from 'expo-router';
import { WhatsNewProvider } from 'expo-whats-new';

import { ScenarioProvider, useScenario } from './scenario-context';

export default function RootLayout() {
  return (
    <ScenarioProvider>
      <WhatsNewRuntime />
    </ScenarioProvider>
  );
}

function WhatsNewRuntime() {
  const { scenario } = useScenario();

  return (
    <WhatsNewProvider
      key={scenario.id}
      releases={scenario.releases}
      source={scenario.source}
      displayPolicy={scenario.displayPolicy}
      storageKey={scenario.storageKey}
      autoShow={false}
      onActionPress={(feature) => {
        if (feature.action?.screen) {
          console.log('Custom navigation action', feature.action);
        }
      }}
      onAccept={(release) => {
        console.log('Accepted event', release.version);
      }}
      onDecline={(release) => {
        console.log('Declined event', release.version);
      }}
      theme={{
        colors: {
          backdrop: 'rgba(0, 0, 0, 0.72)',
          background: '#1c1c1e',
          surface: '#1c1c1e',
          text: '#f5f5f7',
          muted: '#9b9ba3',
          primary: '#0a84ff',
          border: 'transparent',
        },
      }}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'expo-whats-new',
          }}
        />
        <Stack.Screen
          name="whats-new"
          options={{
            contentStyle: { backgroundColor: 'transparent' },
            gestureEnabled: false,
            headerShown: false,
            presentation: 'formSheet',
            sheetAllowedDetents: [0.92],
            sheetGrabberVisible: false,
            title: '',
          }}
        />
        <Stack.Screen
          name="scenario/[id]"
          options={{
            title: 'Scenario',
          }}
        />
      </Stack>
    </WhatsNewProvider>
  );
}
