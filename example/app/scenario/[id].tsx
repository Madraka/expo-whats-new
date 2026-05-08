import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useWhatsNew } from 'expo-whats-new';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAutoPresentScenario } from '../../lib/auto-present';
import { findScenario, useScenario } from '../../lib/scenario-context';
import { openWhatsNewSheet } from '../../lib/whats-new-route';

export default function ScenarioRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const routeScenario = findScenario(params.id);
  const { scenario, selectScenario } = useScenario();
  const { accept, currentRelease, error, hasUnseenRelease, refresh, reset, status } = useWhatsNew();
  const isActiveScenario = scenario.id === routeScenario.id;

  useEffect(() => {
    if (!isActiveScenario) {
      selectScenario(routeScenario.id);
    }
  }, [isActiveScenario, routeScenario.id, selectScenario]);

  useAutoPresentScenario(isActiveScenario && status === 'ready', `scenario:${routeScenario.id}`);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerBackTitle: 'Gallery', title: routeScenario.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Example flow</Text>
        <Text style={styles.title}>{routeScenario.title}</Text>
        <Text style={styles.description}>{routeScenario.description}</Text>

        <View style={styles.summaryPanel}>
          <View style={styles.summaryHeader}>
            <Text style={styles.panelTitle}>Configured event</Text>
            <Text style={styles.badge}>{isActiveScenario ? status : 'activating'}</Text>
          </View>
          <Text style={styles.value}>{isActiveScenario ? currentRelease?.id ?? currentRelease?.version ?? 'Resolving' : 'Activating'}</Text>
          <View style={styles.metaGrid}>
            <Meta label="Kind" value={isActiveScenario ? currentRelease?.kind ?? 'whats-new' : routeScenario.id} />
            <Meta label="Source" value={routeScenario.source ? routeScenario.source.type : 'static'} />
            <Meta label="Unseen" value={isActiveScenario && hasUnseenRelease ? 'yes' : 'no'} />
            <Meta label="Policy" value={routeScenario.displayPolicy ?? 'once'} />
          </View>
          {error ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Behavior</Text>
          <Text style={styles.muted}>The first unresolved event opens automatically when this page becomes active.</Text>
          <Text style={styles.muted}>After acknowledgement, the same sheet remains available through the manual presentation button.</Text>
          <Text style={styles.muted}>Storage key: {routeScenario.storageKey}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!isActiveScenario}
            onPress={openWhatsNewSheet}
            style={StyleSheet.flatten([styles.primaryAction, !isActiveScenario ? styles.disabledAction : null])}
          >
            <Text style={styles.primaryActionText}>Present sheet manually</Text>
          </Pressable>
          <View style={styles.secondaryActions}>
            <Pressable
              accessibilityRole="button"
              disabled={!isActiveScenario}
              onPress={accept}
              style={StyleSheet.flatten([styles.secondaryAction, !isActiveScenario ? styles.disabledAction : null])}
            >
              <Text style={styles.secondaryActionText}>Accept</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!isActiveScenario}
              onPress={reset}
              style={StyleSheet.flatten([styles.secondaryAction, !isActiveScenario ? styles.disabledAction : null])}
            >
              <Text style={styles.secondaryActionText}>Reset</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!isActiveScenario}
              onPress={refresh}
              style={StyleSheet.flatten([styles.secondaryAction, !isActiveScenario ? styles.disabledAction : null])}
            >
              <Text style={styles.secondaryActionText}>Refresh</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  content: {
    flexGrow: 1,
    gap: 16,
    padding: 24,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
  },
  description: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  summaryPanel: {
    backgroundColor: '#111827',
    borderRadius: 8,
    gap: 12,
    padding: 16,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#1f2937',
    borderRadius: 999,
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 3,
    padding: 10,
  },
  metaLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '800',
  },
  muted: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 8,
  },
  actions: {
    gap: 10,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledAction: {
    opacity: 0.45,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
});
