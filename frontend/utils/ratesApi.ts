import type {
  GoldRate,
  GoldRatesResponse,
  LabourRate,
  StoneRate,
  StoneRateLookupPayload,
  StoneRateLookupResponse,
  UpdateGoldRatePayload,
  UpsertLabourRatePayload,
  UpsertStoneRatePayload,
} from '@/types/rates';
import { apiRequest } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

type ApiEnvelope = Record<string, unknown> & {
  success?: boolean;
  data?: unknown;
};

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value != null && typeof value === 'object' && 'toString' in value) {
    const asString = String(value);
    if (asString.trim() && asString !== '[object Object]') return asString.trim();
  }
  return undefined;
}

function normalizeGoldRate(raw: Record<string, unknown>): GoldRate | null {
  const carat = readString(raw.carat ?? raw.karat);
  const purity = readNumber(raw.purity);
  const finalRate = readNumber(
    raw.finalRate ??
      raw.final_rate ??
      raw.calculatedFinalRate ??
      raw.calculated_final_rate ??
      raw.rate,
  );

  if (!carat || purity == null || finalRate == null) {
    return null;
  }

  const increaseByType = readString(raw.increaseByType ?? raw.increase_by_type);
  const normalizedIncreaseByType =
    increaseByType === 'PERCENTAGE' || increaseByType === 'FLAT' ? increaseByType : undefined;

  return {
    id: readString(raw.id ?? raw._id),
    carat,
    purity,
    finalRate,
    baseRate: readNumber(raw.baseRate ?? raw.base_rate),
    increaseByAmount: readNumber(raw.increaseByAmount ?? raw.increase_by_amount),
    increaseByType: normalizedIncreaseByType,
  };
}

function normalizeStoneRate(raw: Record<string, unknown>): StoneRate | null {
  const color = readString(raw.color) ?? '';
  const clarity = readString(raw.clarity) ?? '';
  const rate = readNumber(raw.rate);

  if (rate == null || (!color && !clarity)) {
    return null;
  }

  const id =
    readString(raw.id ?? raw._id) ??
    `${color.trim().toLowerCase()}|${clarity.trim().toLowerCase()}|${rate}`;

  return {
    id,
    color,
    clarity,
    rate,
    updatedAt: readString(raw.updatedAt ?? raw.updated_at),
  };
}

function normalizeRateList(raw: unknown): StoneRate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(normalizeStoneRate)
    .filter((item): item is StoneRate => item !== null);
}

function extractRatesArray(payload: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function normalizeGoldRatesResponse(response: unknown): GoldRatesResponse {
  const unwrapped = unwrapApiData((response ?? {}) as ApiEnvelope);
  const mcxLiveRate =
    readNumber(unwrapped.mcxLiveRate ?? unwrapped.mcx_live_rate) ?? 0;
  const ratesRaw = extractRatesArray(unwrapped, ['rates', 'goldRates', 'items', 'data']);
  const rates = (Array.isArray(ratesRaw) ? ratesRaw : [])
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(normalizeGoldRate)
    .filter((item): item is GoldRate => item !== null);

  return { mcxLiveRate, rates };
}

export function normalizeStoneRatesResponse(response: unknown): StoneRate[] {
  const unwrapped = unwrapApiData((response ?? {}) as ApiEnvelope);
  const list = extractRatesArray(unwrapped, ['rates', 'diamondRates', 'colorstoneRates', 'items', 'data']);
  if (Array.isArray(list) && list.length > 0) {
    return normalizeRateList(list);
  }
  if (Array.isArray(unwrapped)) {
    return normalizeRateList(unwrapped);
  }
  return normalizeRateList(unwrapped.data);
}

export async function fetchGoldRates(): Promise<GoldRatesResponse> {
  const response = await apiRequest<ApiEnvelope>('/rates/gold', { method: 'GET' });
  return normalizeGoldRatesResponse(response);
}

export async function updateGoldRate(payload: UpdateGoldRatePayload): Promise<GoldRate> {
  const response = await apiRequest<ApiEnvelope>('/rates/gold', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
  const unwrapped = unwrapApiData(response);
  const normalized = normalizeGoldRate(unwrapped);
  if (normalized) return normalized;

  const nested = unwrapped.rate ?? unwrapped.data;
  if (nested && typeof nested === 'object') {
    const fromNested = normalizeGoldRate(nested as Record<string, unknown>);
    if (fromNested) return fromNested;
  }

  throw new Error('Invalid gold rate update response from server');
}

export async function fetchDiamondRates(): Promise<StoneRate[]> {
  const response = await apiRequest<ApiEnvelope>('/rates/diamond', { method: 'GET' });
  return normalizeStoneRatesResponse(response);
}

export async function upsertDiamondRate(payload: UpsertStoneRatePayload): Promise<StoneRate> {
  const response = await apiRequest<ApiEnvelope>('/rates/diamond', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
  const unwrapped = unwrapApiData(response);
  const normalized = normalizeStoneRate(unwrapped);
  if (normalized) return normalized;

  const nested = unwrapped.rate ?? unwrapped.data;
  if (nested && typeof nested === 'object') {
    const fromNested = normalizeStoneRate(nested as Record<string, unknown>);
    if (fromNested) return fromNested;
  }

  throw new Error('Invalid diamond rate response from server');
}

export async function fetchColorstoneRates(): Promise<StoneRate[]> {
  const response = await apiRequest<ApiEnvelope>('/rates/colorstone', { method: 'GET' });
  return normalizeStoneRatesResponse(response);
}

export async function upsertColorstoneRate(payload: UpsertStoneRatePayload): Promise<StoneRate> {
  const response = await apiRequest<ApiEnvelope>('/rates/colorstone', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
  const unwrapped = unwrapApiData(response);
  const normalized = normalizeStoneRate(unwrapped);
  if (normalized) return normalized;

  const nested = unwrapped.rate ?? unwrapped.data;
  if (nested && typeof nested === 'object') {
    const fromNested = normalizeStoneRate(nested as Record<string, unknown>);
    if (fromNested) return fromNested;
  }

  throw new Error('Invalid colorstone rate response from server');
}

export async function deleteDiamondRate(id: string): Promise<void> {
  await apiRequest<ApiEnvelope>(`/rates/diamond/${id}`, { method: 'DELETE' });
}

export async function deleteColorstoneRate(id: string): Promise<void> {
  await apiRequest<ApiEnvelope>(`/rates/colorstone/${id}`, { method: 'DELETE' });
}

export class RateNotFoundError extends Error {
  readonly quality: string;

  constructor(quality: string) {
    super(`No rate exists for quality "${quality}"`);
    this.name = 'RateNotFoundError';
    this.quality = quality;
  }
}

export async function lookupStoneRate(
  payload: StoneRateLookupPayload,
): Promise<StoneRateLookupResponse> {
  const trimmedColor = payload.color.trim();
  const trimmedClarity = payload.clarity.trim();
  const quality = `${trimmedColor} ${trimmedClarity}`.trim();

  let rates: StoneRate[] = [];
  try {
    rates =
      payload.type === 'colorstone' ? await fetchColorstoneRates() : await fetchDiamondRates();
  } catch (error) {
    console.warn(`Failed to fetch ${payload.type} rates from API:`, error);
    // Proceed with empty rates so we can still check for local fallbacks
  }

  const match = rates.find(
    (item) =>
      item.color.trim().toLowerCase() === trimmedColor.toLowerCase() &&
      item.clarity.trim().toLowerCase() === trimmedClarity.toLowerCase(),
  );

  if (match) {
    return { rate: match.rate };
  }

  // Fallback for IJ diamond color based on standard pricing
  if (payload.type === 'diamond' && trimmedColor.toUpperCase() === 'IJ') {
    return { rate: 20000 };
  }

  throw new RateNotFoundError(quality);
}

function normalizeLabourRate(raw: Record<string, unknown>): LabourRate | null {
  const chargeType = readString(raw.chargeType ?? raw.charge_type);
  const value = readNumber(raw.value);

  if ((chargeType !== 'AMOUNT' && chargeType !== 'PERCENTAGE') || value == null) {
    return null;
  }

  return {
    id: readString(raw.id ?? raw._id),
    chargeType,
    value,
    updatedAt: readString(raw.updatedAt ?? raw.updated_at),
  };
}

export async function fetchLabourRate(): Promise<LabourRate | null> {
  const response = await apiRequest<ApiEnvelope>('/rates/labour', { method: 'GET' });

  if (response.data === null || response.data === undefined) {
    return null;
  }

  const unwrapped = unwrapApiData(response);
  if (!unwrapped || typeof unwrapped !== 'object') {
    return null;
  }

  return normalizeLabourRate(unwrapped as Record<string, unknown>);
}

export async function upsertLabourRate(payload: UpsertLabourRatePayload): Promise<LabourRate> {
  const response = await apiRequest<ApiEnvelope>('/rates/labour', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });

  const unwrapped = unwrapApiData(response);
  const normalized = normalizeLabourRate(unwrapped);
  if (normalized) return normalized;

  const nested = unwrapped.rate ?? unwrapped.data;
  if (nested && typeof nested === 'object') {
    const fromNested = normalizeLabourRate(nested as Record<string, unknown>);
    if (fromNested) return fromNested;
  }

  throw new Error('Invalid labour rate response from server');
}
