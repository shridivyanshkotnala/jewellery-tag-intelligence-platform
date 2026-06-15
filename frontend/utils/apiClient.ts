import { getApiUrl } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
  skipJson?: boolean;
};

function getNetworkErrorMessage(): string {
  return 'Cannot reach the server. If you are on a phone, set EXPO_PUBLIC_API_URL to your computer IP (e.g. http://192.168.1.3:3000) and make sure the backend is running.';
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipJson, headers: customHeaders, ...rest } = options;
  const token = useAuthStore.getState().authToken;

  const headers = new Headers(customHeaders);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData || typeof body === 'string') {
    requestBody = body;
  } else if (body != null) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const url = getApiUrl(path);

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body: requestBody,
    });
  } catch {
    throw new ApiError(getNetworkErrorMessage());
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    const message =
      typeof errorBody === 'object' && errorBody !== null
        ? typeof (errorBody as { message?: unknown }).message === 'string'
          ? (errorBody as { message: string }).message
          : typeof (errorBody as { error?: unknown }).error === 'string'
            ? (errorBody as { error: string }).error
            : `Request failed (${response.status})`
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, errorBody);
  }

  if (skipJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
