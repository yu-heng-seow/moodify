import { Stack } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function AppLayout() {
  const { onboardingComplete } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!onboardingComplete}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={onboardingComplete}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="journal/[date]" />
      </Stack.Protected>
    </Stack>
  );
}
