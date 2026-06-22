import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="business-profile" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard-matrices" />
      <Stack.Screen name="market-rates" />
      <Stack.Screen name="inventory" options={{ headerShown: false }} />
      <Stack.Screen name="employees" options={{ headerShown: false }} />
      <Stack.Screen name="password-manager" />
      <Stack.Screen name="purity-control" />
      <Stack.Screen name="subscription-manager" />
      <Stack.Screen name="scanner" options={{ headerShown: false }} />
    </Stack>
  );
}
