import { Stack, router } from 'expo-router';
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
            presentation: 'formSheet',
            title: scenario.title,
            sheetAllowedDetents: [0.55, 0.9],
            sheetGrabberVisible: true,
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
