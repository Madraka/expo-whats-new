import { Image } from 'expo-image';
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { ExampleSymbolIcon } from '../symbol-icon';

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('react-native', () => ({
  StyleSheet: {
    create: (styles: unknown) => styles,
  },
  Text: 'Text',
  View: 'View',
}));

const originalConsoleError = console.error;

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderSymbolIcon(platform: string) {
  let renderer!: ReactTestRenderer;

  act(() => {
    renderer = create(<ExampleSymbolIcon fallback="OK" name="checkmark.circle.fill" platform={platform} />);
  });

  return renderer;
}

describe('ExampleSymbolIcon', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((message?: unknown, ...optionalParams: unknown[]) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) {
        return;
      }

      originalConsoleError(message, ...optionalParams);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('uses SF Symbols on Apple platforms', () => {
    const renderer = renderSymbolIcon('ios');

    const image = renderer.root.findByType(Image);

    expect(image.props.source).toBe('sf:checkmark.circle.fill');
  });

  it('uses text fallback outside Apple platforms', () => {
    const renderer = renderSymbolIcon('android');

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
    expect(renderer.root.findByType(Text).props.children).toBe('OK');
  });
});
