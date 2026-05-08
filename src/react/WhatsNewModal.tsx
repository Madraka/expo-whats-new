import { Modal, Pressable, StyleSheet, View, type ModalProps } from 'react-native';

import type { WhatsNewContentProps } from '../ExpoWhatsNew.types';
import { isRequiredRelease } from '../storage/acknowledgementStorage';
import { WhatsNewInline } from './WhatsNewInline';
import { useWhatsNew } from './useWhatsNew';

export type WhatsNewModalProps = WhatsNewContentProps &
  Pick<
    ModalProps,
    | 'allowSwipeDismissal'
    | 'hardwareAccelerated'
    | 'navigationBarTranslucent'
    | 'onDismiss'
    | 'onShow'
    | 'presentationStyle'
    | 'statusBarTranslucent'
    | 'supportedOrientations'
  >;

export function WhatsNewModal({
  allowSwipeDismissal = false,
  hardwareAccelerated = true,
  navigationBarTranslucent,
  onDismiss,
  onShow,
  presentationStyle = 'overFullScreen',
  statusBarTranslucent,
  supportedOrientations,
  variant = 'card',
  ...props
}: WhatsNewModalProps) {
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
    <Modal
      allowSwipeDismissal={canDismiss && allowSwipeDismissal}
      animationType={isEventSheet ? 'slide' : 'fade'}
      hardwareAccelerated={hardwareAccelerated}
      navigationBarTranslucent={navigationBarTranslucent}
      onDismiss={onDismiss}
      onRequestClose={handleRequestClose}
      onShow={onShow}
      presentationStyle={presentationStyle}
      statusBarTranslucent={statusBarTranslucent}
      supportedOrientations={supportedOrientations}
      transparent
      visible={visible}
    >
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
          accessible
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
