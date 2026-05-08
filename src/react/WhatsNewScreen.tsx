import { StyleSheet, View } from 'react-native';

import type { WhatsNewContentProps } from '../ExpoWhatsNew.types';
import { WhatsNewInline } from './WhatsNewInline';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewScreen({ variant = 'card', ...props }: WhatsNewContentProps) {
  const { theme } = useWhatsNew();
  const isEventSheet = variant === 'event-sheet';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.content, isEventSheet ? styles.eventContent : null]}>
        <WhatsNewInline {...props} variant={variant} />
      </View>
    </View>
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
  eventContent: {
    justifyContent: 'flex-start',
    padding: 0,
  },
});
