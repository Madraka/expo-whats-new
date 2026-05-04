import { SafeAreaView, StyleSheet, View } from 'react-native';

import type { WhatsNewContentProps } from '../ExpoWhatsNew.types';
import { WhatsNewInline } from './WhatsNewInline';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewScreen(props: WhatsNewContentProps) {
  const { theme } = useWhatsNew();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        <WhatsNewInline {...props} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
