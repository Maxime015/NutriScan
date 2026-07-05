import { Stack } from 'expo-router';

import { useColors } from '../../lib/theme';

export default function AnalysisLayout() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
        animation: 'slide_from_bottom',
      }}>
      <Stack.Screen name="camera" options={{ animation: 'fade' }} />
      <Stack.Screen name="processing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="[id]/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[id]/risks" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[id]/allergens" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="[id]/extracted" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
