import { useEffect, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { WhatsNewScreen, isRequiredRelease, useWhatsNew, type WhatsNewMediaRenderContext } from 'expo-whats-new';

import { useScenario } from '../lib/scenario-context';
import { ExampleSymbolIcon } from '../lib/symbol-icon';
import { markWhatsNewSheetDismissed, markWhatsNewSheetPresented } from '../lib/whats-new-route';

export default function WhatsNewRoute() {
  const { scenario } = useScenario();
  const { currentRelease, markSeen } = useWhatsNew();
  const isRequired = currentRelease ? isRequiredRelease(currentRelease) : false;
  const canGestureDismiss = !isRequired;
  const completedRef = useRef(false);
  const canGestureDismissRef = useRef(canGestureDismiss);
  const markSeenRef = useRef(markSeen);

  useEffect(() => {
    canGestureDismissRef.current = canGestureDismiss;
    markSeenRef.current = markSeen;
  }, [canGestureDismiss, markSeen]);

  useEffect(() => {
    markWhatsNewSheetPresented();

    return markWhatsNewSheetDismissed;
  }, []);

  useEffect(
    () => () => {
      if (!completedRef.current && canGestureDismissRef.current) {
        void markSeenRef.current();
      }
    },
    []
  );

  function handleDone() {
    completedRef.current = true;
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: canGestureDismiss,
          headerShown: false,
          sheetGrabberVisible: canGestureDismiss,
          title: scenario.title,
        }}
      />
      <WhatsNewScreen doneLabel="Continue" onDone={handleDone} renderMedia={renderMedia} variant="event-sheet" />
    </>
  );
}

function renderMedia(context: WhatsNewMediaRenderContext) {
  const symbol =
    context.media.assetId === 'guide-core'
      ? { fallback: 'BOX', name: 'shippingbox.fill' }
      : context.media.assetId === 'guide-action'
        ? { fallback: 'TAP', name: 'hand.tap.fill' }
        : { fallback: 'NEW', name: 'sparkles' };

  return (
    <View style={styles.media}>
      <ExampleSymbolIcon fallback={symbol.fallback} name={symbol.name} size={96} />
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
});
