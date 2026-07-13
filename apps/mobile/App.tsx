import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { PlaygroundScreen } from './src/screens/PlaygroundScreen';

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

export default function App() {
  const [client] = useState(() => {
    if (!CONVEX_URL) {
      throw new Error(
        'EXPO_PUBLIC_CONVEX_URL is not set. Add it to apps/mobile/.env.local.',
      );
    }
    return new ConvexReactClient(CONVEX_URL);
  });

  return (
    <ConvexProvider client={client}>
      <StatusBar style="auto" />
      <PlaygroundScreen />
    </ConvexProvider>
  );
}
