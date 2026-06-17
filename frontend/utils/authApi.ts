import { apiRequest, ApiError } from '@/utils/apiClient';
import { getApiUrl } from '@/constants/api';
import { unwrapApiData } from '@/utils/apiResponse';
import type { BusinessLoginResponse } from '@/types/auth';
import { normalizeGstNumber } from '@/utils/validation';

type ApiEnvelope<T extends Record<string, unknown>> = T & {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

function readString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function unwrapEnvelope<T extends Record<string, unknown>>(response: ApiEnvelope<T>): T {
  return unwrapApiData(response) as T;
}

function isSuccessfulResponse(
  response: ApiEnvelope<Record<string, unknown>>,
  unwrapped: Record<string, unknown>,
): boolean {
  const unwrappedSuccess = unwrapped.success;
  if (typeof unwrappedSuccess === 'boolean') return unwrappedSuccess;
  if (typeof response.success === 'boolean') return response.success;
  return true;
}

function resolveApiMessage(
  response: ApiEnvelope<Record<string, unknown>>,
  unwrapped: Record<string, unknown>,
  fallback: string,
): string {
  return (
    readString(unwrapped, ['message', 'error']) ??
    readString(response as Record<string, unknown>, ['message', 'error']) ??
    fallback
  );
}

export async function verifyBusinessGst(gstNumber: string): Promise<{
  success: boolean;
  businessName?: string;
  error?: string;
}> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(
      '/auth/business/gst/verify',
      {
        method: 'POST',
        body: { gstNumber: normalizeGstNumber(gstNumber) },
      },
    );
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'GST verification failed.'),
      };
    }
    const businessName = readString(unwrapped, [
      'businessName',
      'legalName',
      'tradeName',
      'name',
    ]);
    return { success: true, businessName };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'GST verification failed.',
    };
  }
}

export async function verifyAndConfirmBusinessGst(gstNumber: string): Promise<{
  success: boolean;
  businessId?: string;
  businessName?: string;
  error?: string;
}> {
  const verifyResult = await verifyBusinessGst(gstNumber);
  if (!verifyResult.success) {
    return verifyResult;
  }

  try {
    const confirmed = await confirmBusinessGst(gstNumber);
    return {
      success: true,
      businessId: confirmed.businessId,
      businessName: verifyResult.businessName,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm GST details.',
    };
  }
}

export async function confirmBusinessGst(gstNumber: string): Promise<{
  businessId: string;
}> {
  const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>(
    '/auth/business/gst/confirm',
    {
      method: 'POST',
      body: { gstNumber: normalizeGstNumber(gstNumber) },
    },
  );

  const unwrapped = unwrapEnvelope(response);
  if (!isSuccessfulResponse(response, unwrapped)) {
    throw new Error(resolveApiMessage(response, unwrapped, 'Failed to confirm GST details.'));
  }
  const businessId = readString(unwrapped, ['businessId', 'id']);
  if (!businessId) {
    throw new Error('businessId missing in GST confirm response.');
  }
  return { businessId };
}

export async function submitBusinessContactDetails(payload: {
  businessId: string;
  phone: string;
  email: string;
}): Promise<void> {
  const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/auth/business/contact-details', {
    method: 'POST',
    body: {
      businessId: payload.businessId,
      phone: payload.phone.replace(/\D/g, ''),
      email: payload.email.trim().toLowerCase(),
    },
  });
  const unwrapped = unwrapEnvelope(response);
  if (!isSuccessfulResponse(response, unwrapped)) {
    throw new Error(resolveApiMessage(response, unwrapped, 'Failed to submit contact details.'));
  }
}

export async function fetchDevOtps(
  businessId: string,
): Promise<{ phone?: string; email?: string }> {
  if (!__DEV__ || !businessId) {
    return {};
  }

  try {
    const response = await fetch(getApiUrl(`/auth/dev/otps/${businessId}`));
    if (!response.ok) {
      return {};
    }

    const body = (await response.json()) as ApiEnvelope<Record<string, unknown>>;
    const unwrapped = unwrapEnvelope(body);
    return {
      phone: typeof unwrapped.phone === 'string' ? unwrapped.phone : undefined,
      email: typeof unwrapped.email === 'string' ? unwrapped.email : undefined,
    };
  } catch {
    return {};
  }
}

export async function verifyBusinessPhoneOtp(
  businessId: string,
  otp: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/auth/business/verify-phone-otp', {
      method: 'POST',
      body: { businessId, otp: otp.trim() },
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Phone OTP verification failed.'),
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Phone OTP verification failed.',
    };
  }
}

export async function verifyBusinessEmailOtp(
  businessId: string,
  otp: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/auth/business/verify-email-otp', {
      method: 'POST',
      body: { businessId, otp: otp.trim() },
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Email OTP verification failed.'),
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Email OTP verification failed.',
    };
  }
}

export async function createBusinessPassword(payload: {
  businessId: string;
  password: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/auth/business/create-password', {
      method: 'POST',
      body: payload,
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Failed to create business password.'),
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to create business password.',
    };
  }
}

export async function loginBusiness(email: string, password: string): Promise<{
  success: boolean;
  data?: BusinessLoginResponse;
  error?: string;
}> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/auth/business/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Login failed.'),
      };
    }
    const accessToken = readString(unwrapped, ['accessToken', 'token']);
    const refreshToken = readString(unwrapped, ['refreshToken']);

    if (!accessToken) {
      return { success: false, error: 'Login response missing access token.' };
    }

    return { success: true, data: { accessToken, refreshToken } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Login failed.',
    };
  }
}

export async function loginEmployeeByPhone(phone: string, password: string): Promise<{
  success: boolean;
  data?: BusinessLoginResponse & { role?: string };
  error?: string;
}> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/auth/employee/login', {
      method: 'POST',
      body: { phone: phone.replace(/\D/g, '').slice(-10), password },
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Login failed.'),
      };
    }
    const accessToken = readString(unwrapped, ['accessToken', 'token']);
    const refreshToken = readString(unwrapped, ['refreshToken']);
    const role = readString(unwrapped, ['role']);

    if (!accessToken) {
      return { success: false, error: 'Login response missing access token.' };
    }

    return { success: true, data: { accessToken, refreshToken, role } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Login failed.',
    };
  }
}
