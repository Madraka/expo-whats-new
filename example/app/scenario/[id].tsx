import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useWhatsNew } from 'expo-whats-new';
import { SafeAreaView } from 'react-native-safe-area-context';

import { findScenario, useScenario } from '../scenario-context';

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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: routeScenario.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Scenario</Text>
        <Text style={styles.title}>{routeScenario.title}</Text>
        <Text style={styles.description}>{routeScenario.description}</Text>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Configured event</Text>
          <Text style={styles.value}>{isActiveScenario ? currentRelease?.version ?? 'Resolving' : 'Activating'}</Text>
          <Text style={styles.muted}>Kind: {isActiveScenario ? currentRelease?.kind ?? 'whats-new' : routeScenario.id}</Text>
          <Text style={styles.muted}>Status: {isActiveScenario ? status : 'activating'}</Text>
          <Text style={styles.muted}>Unseen: {isActiveScenario && hasUnseenRelease ? 'yes' : 'no'}</Text>
          {error ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Behavior</Text>
          <Text style={styles.muted}>Storage key: {routeScenario.storageKey}</Text>
          <Text style={styles.muted}>Display policy: {routeScenario.displayPolicy ?? 'once-per-release'}</Text>
          <Text style={styles.muted}>Source: {routeScenario.source ? routeScenario.source.type : 'static'}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!isActiveScenario}
            onPress={() => router.push('/whats-new')}
            style={[styles.primaryAction, !isActiveScenario ? styles.disabledAction : null]}
          >
            <Text style={styles.primaryActionText}>Open native sheet</Text>
          </Pressable>
          <View style={styles.secondaryActions}>
            <Pressable
              accessibilityRole="button"
              disabled={!isActiveScenario}
              onPress={accept}
              style={[styles.secondaryAction, !isActiveScenario ? styles.disabledAction : null]}
            >
              <Text style={styles.secondaryActionText}>Accept</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!isActiveScenario}
              onPress={reset}
              style={[styles.secondaryAction, !isActiveScenario ? styles.disabledAction : null]}
            >
              <Text style={styles.secondaryActionText}>Reset</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!isActiveScenario}
              onPress={refresh}
              style={[styles.secondaryAction, !isActiveScenario ? styles.disabledAction : null]}
            >
              <Text style={styles.secondaryActionText}>Refresh</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    fontSize: 34,
    fontWeight: '800',
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
  panelTitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
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
