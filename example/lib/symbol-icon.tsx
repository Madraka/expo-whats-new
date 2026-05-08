import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type ExampleSymbolIconProps = {
  color?: string;
  fallback: string;
  name: string;
  platform?: string;
  size?: number;
};

const APPLE_PLATFORMS = new Set(['ios', 'macos', 'tvos', 'visionos']);

export function ExampleSymbolIcon({ color = '#0a84ff', fallback, name, platform = process.env.EXPO_OS, size = 56 }: ExampleSymbolIconProps) {
  if (APPLE_PLATFORMS.has(platform ?? '')) {
    return <Image source={`sf:${name}`} style={{ height: size, width: size }} tintColor={color} />;
  }

  return (
    <View
      accessibilityLabel={fallback}
      style={[
        styles.fallback,
        {
          borderColor: color,
          borderRadius: Math.round(size * 0.28),
          height: size,
          width: size,
        },
      ]}
    >
      <Text
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1}
        numberOfLines={1}
        style={[
          styles.fallbackText,
          {
            color,
            fontSize: Math.max(11, Math.round(size * 0.32)),
          },
        ]}
      >
        {fallback}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
