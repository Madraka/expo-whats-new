import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { WhatsNewContentProps, WhatsNewFeature } from '../ExpoWhatsNew.types';
import { getAcceptLabel } from '../storage/acknowledgementStorage';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewInline({ doneLabel = 'Done', onDone, showDoneButton = true }: WhatsNewContentProps = {}) {
  const { accept, currentRelease, decline, markSeen, onActionPress, theme } = useWhatsNew();

  if (!currentRelease) {
    return null;
  }

  const release = currentRelease;

  async function handleDone() {
    if (release.acknowledgement?.mode === 'accepted' || release.kind === 'policy' || release.kind === 'consent') {
      await accept();
    } else {
      await markSeen();
    }
    await onDone?.();
  }

  async function handleDecline() {
    await decline();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{release.title ?? "What's New"}</Text>
        {release.subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{release.subtitle}</Text>
        ) : null}
      </View>

      <ScrollView style={styles.features} contentContainerStyle={styles.featuresContent}>
        {release.features.map((feature, index) => (
          <FeatureRow
            key={`${release.version}-${feature.title}-${index}`}
            feature={feature}
            onActionPress={() => {
              void onActionPress(feature);
            }}
          />
        ))}
      </ScrollView>

      {showDoneButton ? (
        <View style={styles.footer}>
          {release.acknowledgement?.declineLabel ? (
            <Pressable accessibilityRole="button" onPress={handleDecline} style={styles.secondaryButton}>
              <Text style={[styles.secondaryButtonText, { color: theme.colors.muted }]}>
                {release.acknowledgement.declineLabel}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={handleDone}
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
          >
            <Text style={styles.primaryButtonText}>{getAcceptLabel(release, doneLabel)}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function FeatureRow({ feature, onActionPress }: { feature: WhatsNewFeature; onActionPress(): void }) {
  const { theme } = useWhatsNew();

  return (
    <View style={styles.feature}>
      {feature.icon ? <View style={styles.icon}>{feature.icon}</View> : <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />}
      <View style={styles.featureBody}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
        {feature.description ? (
          <Text style={[styles.featureDescription, { color: theme.colors.muted }]}>{feature.description}</Text>
        ) : null}
        {feature.action ? (
          <Pressable accessibilityRole="button" onPress={onActionPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>{feature.action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  features: {
    maxHeight: 360,
  },
  featuresContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    width: 28,
    alignItems: 'center',
    paddingTop: 2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    marginTop: 7,
  },
  featureBody: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    gap: 8,
    margin: 20,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
