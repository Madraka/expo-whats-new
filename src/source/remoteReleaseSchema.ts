import { z } from 'zod';

const platformTargetSchema = z.enum(['ios', 'android', 'web']);
const releaseKindSchema = z.enum(['whats-new', 'announcement', 'policy', 'consent']);
const acknowledgementModeSchema = z.enum(['seen', 'accepted']);

const featureActionSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().min(1).optional(),
    screen: z.string().min(1).optional(),
    payload: z.record(z.unknown()).optional(),
  })
  .strip();

const mediaDescriptorSchema = z
  .object({
    type: z.enum(['image', 'lottie', 'rive', 'video', 'custom']),
    assetId: z.string().min(1).optional(),
    url: z.string().min(1).optional(),
    poster: z.string().optional(),
    aspectRatio: z.number().positive().optional(),
    autoplay: z.boolean().optional(),
    loop: z.boolean().optional(),
    accessibilityLabel: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strip();

const remoteFeatureSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    image: z.string().optional(),
    media: mediaDescriptorSchema.optional(),
    action: featureActionSchema.optional(),
  })
  .strip();

const remoteGuideStepSchema = remoteFeatureSchema;

const acknowledgementSchema = z
  .object({
    mode: acknowledgementModeSchema.optional(),
    required: z.boolean().optional(),
    acceptLabel: z.string().optional(),
    declineLabel: z.string().optional(),
  })
  .strip();

const releaseLocalizationSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    features: z.array(remoteFeatureSchema).optional(),
    steps: z.array(remoteGuideStepSchema).optional(),
    acknowledgement: acknowledgementSchema.pick({ acceptLabel: true, declineLabel: true }).optional(),
  })
  .strip();

const releaseSchema = z
  .object({
    version: z.string().min(1),
    id: z.string().min(1).optional(),
    kind: releaseKindSchema.optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    date: z.string().optional(),
    presentation: z.enum(['list', 'guide']).optional(),
    features: z.array(remoteFeatureSchema).min(1),
    steps: z.array(remoteGuideStepSchema).optional(),
    acknowledgement: acknowledgementSchema.optional(),
    minAppVersion: z.string().optional(),
    maxAppVersion: z.string().optional(),
    platform: z.array(platformTargetSchema).optional(),
    locale: z.union([z.string(), z.array(z.string())]).optional(),
    localizations: z.record(releaseLocalizationSchema).optional(),
    audience: z.union([z.string(), z.array(z.string())]).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strip();

export const remoteReleasePayloadSchema = z.union([
  z.array(releaseSchema),
  z
    .object({
      schemaVersion: z.number().int().positive().optional(),
      releases: z.array(releaseSchema),
    })
    .strip(),
]);

export const remoteReleaseCacheEnvelopeSchema = z
  .object({
    schemaVersion: z.literal(1),
    fetchedAt: z.string(),
    expiresAt: z.string().optional(),
    releases: z.array(releaseSchema),
  })
  .strip();

export function formatRemoteReleaseIssues(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`).join('; ');
}
