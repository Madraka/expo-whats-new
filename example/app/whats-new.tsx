import { Stack, router } from 'expo-router';
import { WhatsNewDoneButton, WhatsNewScreen } from 'expo-whats-new';

import { useScenario } from './scenario-context';

export default function WhatsNewRoute() {
  const { scenario } = useScenario();

  return (
    <>
      <Stack.Screen
        options={{
          title: scenario.title,
          headerRight: () => <WhatsNewDoneButton onDone={() => router.back()} />,
        }}
      />
      <WhatsNewScreen showDoneButton={false} />
    </>
  );
}
