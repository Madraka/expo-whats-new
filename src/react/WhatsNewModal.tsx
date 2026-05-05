import { Modal, Pressable, StyleSheet, View } from 'react-native';

import type { WhatsNewContentProps } from '../ExpoWhatsNew.types';
import { isRequiredRelease } from '../storage/acknowledgementStorage';
import { WhatsNewInline } from './WhatsNewInline';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewModal({ variant = 'card', ...props }: WhatsNewContentProps) {
  const { currentRelease, visible, hide, theme } = useWhatsNew();
  const isEventSheet = variant === 'event-sheet';
  const canDismiss = currentRelease ? !isRequiredRelease(currentRelease) : true;
  const title = currentRelease?.title ?? "What's New";

  function handleRequestClose() {
    if (canDismiss) {
      hide();
    }
  }

  return (
    <Modal animationType={isEventSheet ? 'slide' : 'fade'} transparent visible={visible} onRequestClose={handleRequestClose}>
      <View style={[styles.backdrop, isEventSheet ? styles.eventBackdrop : styles.cardBackdrop, { backgroundColor: theme.colors.backdrop }]}>
        {canDismiss ? (
          <Pressable
            accessibilityLabel={`Dismiss ${title}`}
            accessibilityRole="button"
            style={StyleSheet.absoluteFill}
            onPress={hide}
          />
        ) : null}
        <View
          accessibilityLabel={title}
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={[
            styles.sheet,
            isEventSheet ? styles.eventSheet : styles.cardSheet,
            isEventSheet ? { backgroundColor: theme.colors.background } : null,
          ]}
        >
          <WhatsNewInline {...props} variant={variant} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  cardBackdrop: {
    justifyContent: 'center',
    padding: 20,
  },
  eventBackdrop: {
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
  },
  cardSheet: {
    maxWidth: 560,
    alignSelf: 'center',
  },
  eventSheet: {
    alignSelf: 'stretch',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: '92%',
    overflow: 'hidden',
  },
});
