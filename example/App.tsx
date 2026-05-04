import { ExpoRoot } from 'expo-router';

const context = (require as NodeRequire & {
  context(directory: string, recursive: boolean, filter: RegExp): Parameters<typeof ExpoRoot>[0]['context'];
}).context('./app', true, /\.(js|jsx|ts|tsx)$/);

export default function App() {
  return <ExpoRoot context={context} />;
}
