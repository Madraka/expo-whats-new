import { Stack, router } from 'expo-router';
import { WhatsNewScreen } from 'expo-whats-new';

import { useScenario } from './scenario-context';

export default function WhatsNewRoute() {
  const { scenario } = useScenario();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: scenario.title,
        }}
      />
      <WhatsNewScreen doneLabel="Sürdür" onDone={() => router.back()} variant="event-sheet" />
    </>
  );
}
