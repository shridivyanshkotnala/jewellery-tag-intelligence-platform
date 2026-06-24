import type { LabourChargeType, LabourRate } from '@/types/rates';

export interface LabourRateFormErrors {
  amount?: string;
  percentage?: string;
}

export function formatLabourRateDisplay(rate: LabourRate | null): string {
  if (!rate) return 'Empty';
  if (rate.chargeType === 'PERCENTAGE') {
    return `${rate.value}% purity of gold`;
  }
  return `₹ ${rate.value.toLocaleString('en-IN')}`;
}

export function validateLabourRateAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const num = Number(trimmed.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) {
    return 'Enter a valid amount greater than 0.';
  }
  return null;
}

export function validateLabourRatePercentage(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const num = Number(trimmed.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0 || num > 100) {
    return 'Purity must be between 0 and 100.';
  }
  return null;
}

export function validateLabourRateForm(
  amount: string,
  percentage: string,
): LabourRateFormErrors | null {
  const hasAmount = Boolean(amount.trim());
  const hasPercentage = Boolean(percentage.trim());

  if (!hasAmount && !hasPercentage) {
    return { amount: 'Enter amount or purity percentage.' };
  }

  if (hasAmount && hasPercentage) {
    return { amount: 'Fill only one field — amount or purity %.' };
  }

  if (hasAmount) {
    const amountError = validateLabourRateAmount(amount);
    if (amountError) return { amount: amountError };
    return null;
  }

  const percentageError = validateLabourRatePercentage(percentage);
  if (percentageError) return { percentage: percentageError };
  return null;
}

export function labourRateFormToPayload(
  amount: string,
  percentage: string,
): { chargeType: LabourChargeType; value: number } | null {
  const errors = validateLabourRateForm(amount, percentage);
  if (errors) return null;

  if (amount.trim()) {
    return {
      chargeType: 'AMOUNT',
      value: Number(amount.replace(/[^\d.]/g, '')),
    };
  }

  return {
    chargeType: 'PERCENTAGE',
    value: Number(percentage.replace(/[^\d.]/g, '')),
  };
}

export function labourRateToFormValues(rate: LabourRate | null): {
  amount: string;
  percentage: string;
} {
  if (!rate) return { amount: '', percentage: '' };
  if (rate.chargeType === 'AMOUNT') {
    return { amount: String(rate.value), percentage: '' };
  }
  return { amount: '', percentage: String(rate.value) };
}
