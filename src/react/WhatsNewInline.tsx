import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type {
  WhatsNewContentProps,
  WhatsNewContentVariant,
  WhatsNewFeature,
  WhatsNewGuideStep,
  WhatsNewMediaDescriptor,
  WhatsNewRelease,
} from '../ExpoWhatsNew.types';
import { getAcceptLabel, getAcknowledgementMode } from '../storage/acknowledgementStorage';
import { useWhatsNew } from './useWhatsNew';

export function WhatsNewInline({
  doneLabel = 'Done',
  onDone,
  renderMedia,
  showDoneButton = true,
  variant = 'card',
}: WhatsNewContentProps = {}) {
  const { accept, currentRelease, decline, markSeen, onActionPress, theme } = useWhatsNew();
  const { width } = useWindowDimensions();

  if (!currentRelease) {
    return null;
  }

  const release = currentRelease;
  const isEventSheet = variant === 'event-sheet';
  const presentation = release.presentation ?? 'list';
  const guideSteps = release.steps?.length ? release.steps : release.features;
  const guidePageWidth = isEventSheet ? width : Math.min(width - 40, 560);

  async function handleDone() {
    if (getAcknowledgementMode(release) === 'accepted') {
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
    <View
      style={[
        styles.container,
        isEventSheet ? styles.eventContainer : styles.cardContainer,
        { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
      ]}
    >
      <View style={[styles.header, isEventSheet ? styles.eventHeader : null]}>
        <Text style={[styles.title, isEventSheet ? styles.eventTitle : null, { color: theme.colors.text }]}>{release.title ?? "What's New"}</Text>
        {release.subtitle ? (
          <Text style={[styles.subtitle, isEventSheet ? styles.eventSubtitle : null, { color: theme.colors.muted }]}>{release.subtitle}</Text>
        ) : null}
      </View>

      {presentation === 'guide' ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[styles.features, isEventSheet ? styles.eventFeatures : null]}
          contentContainerStyle={[styles.guideContent, isEventSheet ? styles.eventGuideContent : null]}
          contentInsetAdjustmentBehavior="automatic"
        >
          {guideSteps.map((step, index) => (
            <GuideStep
              key={`${release.version}-${step.title}-${index}`}
              index={index}
              release={release}
              renderMedia={renderMedia}
              pageWidth={guidePageWidth}
              step={step}
              total={guideSteps.length}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          style={[styles.features, isEventSheet ? styles.eventFeatures : null]}
          contentContainerStyle={[styles.featuresContent, isEventSheet ? styles.eventFeaturesContent : null]}
          contentInsetAdjustmentBehavior="automatic"
        >
          {release.features.map((feature, index) => (
            <FeatureRow
              key={`${release.version}-${feature.title}-${index}`}
              feature={feature}
              index={index}
              release={release}
              renderMedia={renderMedia}
              variant={variant}
              onActionPress={() => {
                void onActionPress(feature);
              }}
            />
          ))}
        </ScrollView>
      )}

      {showDoneButton ? (
        <View style={[styles.footer, isEventSheet ? styles.eventFooter : null]}>
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
            style={[
              styles.primaryButton,
              isEventSheet ? styles.eventPrimaryButton : null,
              { backgroundColor: theme.colors.primary, borderRadius: isEventSheet ? 999 : theme.radius.md },
            ]}
          >
            <Text style={[styles.primaryButtonText, isEventSheet ? styles.eventPrimaryButtonText : null]}>{getAcceptLabel(release, doneLabel)}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function FeatureRow({
  feature,
  index,
  onActionPress,
  release,
  renderMedia,
  variant,
}: {
  feature: WhatsNewFeature;
  index: number;
  onActionPress(): void;
  release: WhatsNewRelease;
  renderMedia?: WhatsNewContentProps['renderMedia'];
  variant: WhatsNewContentVariant;
}) {
  const { theme } = useWhatsNew();
  const isEventSheet = variant === 'event-sheet';
  const primaryColor = theme.colors.primary ?? '#2563eb';
  const icon = feature.icon ? (
    <View style={[styles.icon, isEventSheet ? styles.eventIcon : null]}>{feature.icon}</View>
  ) : isEventSheet ? null : (
    <View style={[styles.dot, { backgroundColor: primaryColor }]} />
  );

  return (
    <View style={[styles.feature, isEventSheet ? styles.eventFeature : null]}>
      {icon}
      <View style={[styles.featureBody, isEventSheet && !icon ? styles.eventFeatureBodyWithoutIcon : null]}>
        {feature.media || feature.image ? (
          <MediaFrame
            media={feature.media ?? { type: 'image', url: feature.image }}
            renderMedia={renderMedia}
            context={{ kind: 'feature', feature, release, index }}
          />
        ) : null}
        <Text style={[styles.featureTitle, isEventSheet ? styles.eventFeatureTitle : null, { color: theme.colors.text }]}>{feature.title}</Text>
        {feature.description ? (
          <Text style={[styles.featureDescription, isEventSheet ? styles.eventFeatureDescription : null, { color: theme.colors.muted }]}>
            {feature.description}
          </Text>
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

function GuideStep({
  index,
  release,
  renderMedia,
  pageWidth,
  step,
  total,
}: {
  index: number;
  release: WhatsNewRelease;
  renderMedia?: WhatsNewContentProps['renderMedia'];
  pageWidth: number;
  step: WhatsNewGuideStep;
  total: number;
}) {
  const { theme } = useWhatsNew();
  const media = step.media ?? (step.image ? { type: 'image' as const, url: step.image } : null);

  return (
    <View style={[styles.guideStep, { width: pageWidth }]}>
      {media ? <MediaFrame context={{ kind: 'step', step, release, index }} media={media} renderMedia={renderMedia} /> : null}
      <View style={styles.guideText}>
        <Text style={[styles.eventFeatureTitle, { color: theme.colors.text }]}>{step.title}</Text>
        {step.description ? <Text style={[styles.eventFeatureDescription, { color: theme.colors.muted }]}>{step.description}</Text> : null}
      </View>
      <View accessibilityLabel={`Step ${index + 1} of ${total}`} style={styles.stepIndicators}>
        {Array.from({ length: total }).map((_, itemIndex) => (
          <View
            key={itemIndex}
            style={[styles.stepIndicator, { backgroundColor: itemIndex === index ? theme.colors.primary : theme.colors.border }]}
          />
        ))}
      </View>
    </View>
  );
}

function MediaFrame({
  context,
  media,
  renderMedia,
}: {
  context:
    | {
        kind: 'feature';
        feature: WhatsNewFeature;
        release: WhatsNewRelease;
        index: number;
      }
    | {
        kind: 'step';
        step: WhatsNewGuideStep;
        release: WhatsNewRelease;
        index: number;
      };
  media: WhatsNewMediaDescriptor;
  renderMedia?: WhatsNewContentProps['renderMedia'];
}) {
  const { theme } = useWhatsNew();
  const renderedMedia = renderMedia?.({ ...context, media } as Parameters<NonNullable<WhatsNewContentProps['renderMedia']>>[0]);

  if (renderedMedia) {
    return <View style={styles.mediaFrame}>{renderedMedia}</View>;
  }

  if (media.type === 'image' && media.url) {
    return (
      <Image
        accessibilityLabel={media.accessibilityLabel}
        resizeMode="cover"
        source={{ uri: media.url }}
        style={[styles.mediaImage, { aspectRatio: media.aspectRatio ?? 1.65 }]}
      />
    );
  }

  return (
    <View style={[styles.mediaPlaceholder, { aspectRatio: media.aspectRatio ?? 1.65, borderColor: theme.colors.border }]}>
      <Text style={[styles.mediaPlaceholderText, { color: theme.colors.muted }]}>{media.accessibilityLabel ?? media.assetId ?? media.type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  cardContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventContainer: {
    flex: 1,
    borderWidth: 0,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  eventHeader: {
    paddingHorizontal: 32,
    paddingTop: 76,
    paddingBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  eventSubtitle: {
    fontSize: 20,
    lineHeight: 27,
    marginTop: 12,
  },
  features: {
    maxHeight: 360,
  },
  eventFeatures: {
    flex: 1,
    maxHeight: undefined,
  },
  featuresContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 16,
  },
  eventFeaturesContent: {
    gap: 30,
    paddingHorizontal: 32,
    paddingTop: 0,
    paddingBottom: 28,
  },
  guideContent: {
    paddingBottom: 8,
  },
  eventGuideContent: {
    paddingBottom: 28,
  },
  guideStep: {
    gap: 18,
    paddingHorizontal: 32,
  },
  guideText: {
    gap: 4,
  },
  mediaFrame: {
    width: '100%',
  },
  mediaImage: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    width: '100%',
  },
  mediaPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stepIndicators: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingTop: 4,
  },
  stepIndicator: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  feature: {
    flexDirection: 'row',
    gap: 12,
  },
  eventFeature: {
    gap: 22,
  },
  icon: {
    width: 28,
    alignItems: 'center',
    paddingTop: 2,
  },
  eventIcon: {
    width: 72,
    paddingTop: 0,
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
  eventFeatureBodyWithoutIcon: {
    paddingLeft: 0,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventFeatureTitle: {
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 29,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  eventFeatureDescription: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: 2,
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
  eventFooter: {
    gap: 10,
    margin: 0,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 32,
  },
  primaryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventPrimaryButton: {
    minHeight: 58,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  eventPrimaryButtonText: {
    fontSize: 22,
    fontWeight: '800',
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
