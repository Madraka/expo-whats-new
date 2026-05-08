import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useWhatsNew } from 'expo-whats-new';

import { openWhatsNewSheet } from '../../lib/whats-new-route';
import { useScenario } from '../../lib/scenario-context';

const capabilities = [
  ['Remote JSON', 'Validated payloads, cache policies, localized copy, and stale fallback.'],
  ['Custom sources', 'Supabase, SQLite, feature flags, or app repositories through one loader contract.'],
  ['Guide media', 'Lottie, Rive, video, symbols, or reduced-motion posters through renderMedia.'],
  ['Native presentation', 'Host-owned Expo Router sheet/modal routes with package fallback modal.'],
];

export default function IntegrationsRoute() {
  const { currentRelease, hasUnseenRelease, refresh, reset, status } = useWhatsNew();
  const { scenario, scenarios, selectScenario } = useScenario();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: 'Integrations' }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Architecture</Text>
        <Text style={styles.title}>Bring your own data and media</Text>
        <Text style={styles.description}>
          The package keeps validation, targeting, acknowledgement, and presentation contracts stable while apps plug in
          their own data stores, animation systems, and navigation surface.
        </Text>
      </View>

      <View style={styles.capabilityList}>
        {capabilities.map(([title, description]) => (
          <View key={title} style={styles.capabilityRow}>
            <View style={styles.capabilityDot} />
            <View style={styles.capabilityText}>
              <Text style={styles.capabilityTitle}>{title}</Text>
              <Text style={styles.capabilityDescription}>{description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Active source</Text>
        <Text style={styles.value}>{scenario.title}</Text>
        <Text style={styles.muted}>Source: {scenario.source?.type ?? 'static'}</Text>
        <Text style={styles.muted}>Resolved: {currentRelease?.id ?? currentRelease?.version ?? 'none'}</Text>
        <Text style={styles.muted}>Status: {status}</Text>
        <Text style={styles.muted}>Unseen: {hasUnseenRelease ? 'yes' : 'no'}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All examples</Text>
        <Pressable accessibilityRole="button" onPress={openWhatsNewSheet}>
          <Text style={styles.linkText}>Present</Text>
        </Pressable>
      </View>

      <View style={styles.scenarioList}>
        {scenarios.map((item) => {
          const selected = item.id === scenario.id;

          return (
            <Link key={item.id} href={`/scenario/${item.id}`} asChild>
              <Pressable
                accessibilityRole="button"
                onPress={() => selectScenario(item.id)}
                style={StyleSheet.flatten([styles.scenarioRow, selected ? styles.scenarioRowSelected : null])}
              >
                <View style={styles.scenarioText}>
                  <Text style={StyleSheet.flatten([styles.scenarioTitle, selected ? styles.selectedText : null])}>{item.title}</Text>
                  <Text style={styles.scenarioDescription}>{item.description}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <View style={styles.commandRow}>
        <Pressable accessibilityRole="button" onPress={reset} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Reset active</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={refresh} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Refresh</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f6f7fb',
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    gap: 8,
    paddingTop: 8,
  },
  eyebrow: {
    color: '#0a84ff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 23,
  },
  capabilityList: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
    padding: 16,
  },
  capabilityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  capabilityDot: {
    backgroundColor: '#0a84ff',
    borderRadius: 5,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  capabilityText: {
    flex: 1,
    gap: 3,
  },
  capabilityTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  capabilityDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: '#111827',
    borderRadius: 8,
    gap: 5,
    padding: 16,
  },
  panelTitle: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  muted: {
    color: '#d1d5db',
    fontSize: 14,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  linkText: {
    color: '#0a84ff',
    fontSize: 14,
    fontWeight: '800',
  },
  scenarioList: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  scenarioRow: {
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  scenarioRowSelected: {
    backgroundColor: '#eef6ff',
  },
  scenarioText: {
    flex: 1,
    gap: 3,
  },
  scenarioTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  scenarioDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  selectedText: {
    color: '#075985',
  },
  chevron: {
    color: '#9ca3af',
    fontSize: 28,
    fontWeight: '400',
  },
  commandRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
});
