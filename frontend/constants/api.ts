import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_V1_PREFIX = '/api/v1';

function getMetroHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)?.extra
      ?.expoClient?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

export function resolveApiBaseUrl(): string {
  if (__DEV__) {
    const metroHost = getMetroHost();
    if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
      return `http://${metroHost}:3000`;
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${API_V1_PREFIX}${path}`;
}

export async function waitForMockDelay(ms = 800): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
