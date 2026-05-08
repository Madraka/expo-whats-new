import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { ExpoWhatsNew, useWhatsNew, type AppInfo } from 'expo-whats-new';

import { openWhatsNewSheet } from '../../lib/whats-new-route';
import { useScenario } from '../../lib/scenario-context';

export default function GalleryRoute() {
  const { currentRelease, error, hasUnseenRelease, refresh, reset, status } = useWhatsNew();
  const { scenario, scenarios, selectScenario } = useScenario();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const featuredScenarios = useMemo(() => scenarios.slice(0, 4), [scenarios]);

  useEffect(() => {
    ExpoWhatsNew.getAppInfo().then(setAppInfo);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: 'Gallery' }} />

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>expo-whats-new</Text>
        <Text style={styles.title}>Event presentation system</Text>
        <Text style={styles.description}>
          Native sheets, required policy events, localized remote payloads, custom source adapters, and guide-style media
          walkthroughs from one deterministic core.
        </Text>
      </View>

      <View style={styles.statusGrid}>
        <InfoTile label="Resolved" value={currentRelease?.version ?? 'none'} />
        <InfoTile label="Status" value={status} />
        <InfoTile label="Unseen" value={hasUnseenRelease ? 'yes' : 'no'} />
        <InfoTile label="Platform" value={appInfo?.platform ?? 'loading'} />
      </View>

      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured flows</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/scenario/guide')}>
          <Text style={styles.linkText}>Open guide</Text>
        </Pressable>
      </View>

      <View style={styles.scenarioGrid}>
        {featuredScenarios.map((item) => {
          const selected = item.id === scenario.id;

          return (
            <Link key={item.id} href={`/scenario/${item.id}`} asChild>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  selectScenario(item.id);
                }}
                style={StyleSheet.flatten([styles.scenarioCard, selected ? styles.scenarioCardSelected : null])}
              >
                <Text style={StyleSheet.flatten([styles.scenarioTitle, selected ? styles.selectedText : null])}>{item.title}</Text>
                <Text style={StyleSheet.flatten([styles.scenarioDescription, selected ? styles.selectedMuted : null])}>{item.description}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <View style={styles.commandPanel}>
        <Pressable accessibilityRole="button" onPress={openWhatsNewSheet} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Present current event</Text>
        </Pressable>
        <View style={styles.secondaryActions}>
          <Pressable accessibilityRole="button" onPress={reset} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Reset</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={refresh} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Refresh</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>
        {value}
      </Text>
    </View>
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
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  description: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 23,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoTile: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 4,
    padding: 14,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
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
  scenarioGrid: {
    gap: 10,
  },
  scenarioCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    padding: 16,
  },
  scenarioCardSelected: {
    backgroundColor: '#eef6ff',
    borderColor: '#0a84ff',
  },
  scenarioTitle: {
    color: '#111827',
    fontSize: 17,
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
  selectedMuted: {
    color: '#1d4ed8',
  },
  commandPanel: {
    gap: 10,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#0a84ff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryActions: {
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
