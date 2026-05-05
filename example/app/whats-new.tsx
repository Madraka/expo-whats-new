import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { WhatsNewScreen, type WhatsNewMediaRenderContext } from 'expo-whats-new';

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
      <WhatsNewScreen doneLabel="Sürdür" onDone={() => router.back()} renderMedia={renderMedia} variant="event-sheet" />
    </>
  );
}

function renderMedia(context: WhatsNewMediaRenderContext) {
  const symbolName =
    context.media.assetId === 'guide-core' ? 'shippingbox.fill' : context.media.assetId === 'guide-action' ? 'hand.tap.fill' : 'sparkles';

  return (
    <View style={styles.media}>
      <Image source={`sf:${symbolName}`} style={styles.symbol} tintColor="#0a84ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  media: {
    alignItems: 'center',
    aspectRatio: 1.65,
    backgroundColor: '#2c2c2e',
    borderRadius: 22,
    justifyContent: 'center',
    width: '100%',
  },
  symbol: {
    height: 96,
    width: 96,
  },
});
