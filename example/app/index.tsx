import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ExpoWhatsNew, useWhatsNew, type AppInfo } from 'expo-whats-new';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScenario } from './scenario-context';

export default function HomeRoute() {
  const { accept, currentRelease, error, hasUnseenRelease, refresh, reset, status } = useWhatsNew();
  const { scenario, scenarios, selectScenario } = useScenario();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

  useEffect(() => {
    ExpoWhatsNew.getAppInfo().then(setAppInfo);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>expo-whats-new</Text>
        <Text style={styles.title}>Native sheet event gallery</Text>
        <Text style={styles.description}>
          Select a scenario to present release notes, policies, consent prompts, announcements, remote events, and
          feature actions through the same native sheet route.
        </Text>

        <View style={styles.scenarioList}>
          {scenarios.map((item) => {
            const selected = item.id === scenario.id;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  selectScenario(item.id);
                  router.push(`/scenario/${item.id}`);
                }}
                style={[styles.scenarioButton, selected ? styles.scenarioButtonSelected : null]}
              >
                <Text style={[styles.scenarioTitle, selected ? styles.scenarioTitleSelected : null]}>{item.title}</Text>
                <Text style={[styles.scenarioDescription, selected ? styles.scenarioDescriptionSelected : null]}>
                  {item.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Current event</Text>
          <Text style={styles.muted}>Scenario: {scenario.title}</Text>
          <Text style={styles.value}>{currentRelease?.version ?? 'No release'}</Text>
          <Text style={styles.muted}>Kind: {currentRelease?.kind ?? 'whats-new'}</Text>
          <Text style={styles.muted}>Status: {status}</Text>
          <Text style={styles.muted}>Unseen: {hasUnseenRelease ? 'yes' : 'no'}</Text>
          {error ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Native capability</Text>
          <Text style={styles.value}>{appInfo?.platform ?? 'loading'}</Text>
          <Text style={styles.muted}>Version: {appInfo?.version ?? 'unknown'}</Text>
          <Text style={styles.muted}>Build: {appInfo?.buildNumber ?? 'unknown'}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/scenario/${scenario.id}`)} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Open selected scenario</Text>
          </Pressable>
          <View style={styles.secondaryActions}>
            <Pressable accessibilityRole="button" onPress={accept} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Accept</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={reset} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Reset</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={refresh} style={styles.secondaryAction}>
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
  scenarioList: {
    gap: 10,
  },
  scenarioButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  scenarioButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  scenarioTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  scenarioTitleSelected: {
    color: '#1d4ed8',
  },
  scenarioDescription: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  scenarioDescriptionSelected: {
    color: '#1e40af',
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
