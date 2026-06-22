import type {
  GoldRate,
  GoldRatesResponse,
  StoneRate,
  UpdateGoldRatePayload,
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
  return undefined;
}

function normalizeGoldRate(raw: Record<string, unknown>): GoldRate | null {
  const carat = readString(raw.carat);
  const purity = readNumber(raw.purity);
  const finalRate = readNumber(raw.finalRate ?? raw.final_rate ?? raw.rate);

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
  const color = readString(raw.color);
  const clarity = readString(raw.clarity);
  const rate = readNumber(raw.rate);

  if (!color || !clarity || rate == null) {
    return null;
  }

  return {
    id: readString(raw.id ?? raw._id),
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
  const ratesRaw = extractRatesArray(unwrapped, ['rates', 'goldRates', 'items']);
  const rates = (Array.isArray(ratesRaw) ? ratesRaw : [])
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(normalizeGoldRate)
    .filter((item): item is GoldRate => item !== null);

  return { mcxLiveRate, rates };
}

export function normalizeStoneRatesResponse(response: unknown): StoneRate[] {
  const unwrapped = unwrapApiData((response ?? {}) as ApiEnvelope);
  const list = extractRatesArray(unwrapped, ['rates', 'diamondRates', 'colorstoneRates', 'items']);
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
