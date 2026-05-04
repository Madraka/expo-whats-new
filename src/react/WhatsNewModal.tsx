import { Modal, Pressable, StyleSheet, View } from 'react-native';

import type { WhatsNewContentProps } from '../ExpoWhatsNew.types';
import { WhatsNewInline } from './WhatsNewInline';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewModal(props: WhatsNewContentProps) {
  const { visible, hide, theme } = useWhatsNew();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={hide}>
      <View style={[styles.backdrop, { backgroundColor: theme.colors.backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        <View style={styles.sheet}>
          <WhatsNewInline {...props} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
