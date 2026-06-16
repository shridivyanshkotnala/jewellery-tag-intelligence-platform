import type { RegistrationData } from '@/types/auth';

export interface BusinessProfile {
  businessName: string;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
}

const EMPTY_PROFILE: BusinessProfile = {
  businessName: '',
  gstNumber: '',
  phone: '',
  email: '',
  address: '',
};

function buildProfile(registration: Partial<RegistrationData>): BusinessProfile {
  return {
    businessName: registration.businessName ?? '',
    gstNumber: registration.gstNumber ?? '',
    phone: registration.phone ?? '',
    email: registration.email ?? '',
    address: registration.address ?? '',
  };
}

export function getBusinessProfile(registration: Partial<RegistrationData>): BusinessProfile {
  const profile = buildProfile(registration);
  const hasData = Object.values(profile).some((value) => value.trim().length > 0);
  return hasData ? profile : EMPTY_PROFILE;
}

export function getEditableBusinessProfile(registration: Partial<RegistrationData>): BusinessProfile {
  return buildProfile(registration);
}

export function formatProfileValue(value: string, fallback = 'Not set'): string {
  return value.trim() || fallback;
}
