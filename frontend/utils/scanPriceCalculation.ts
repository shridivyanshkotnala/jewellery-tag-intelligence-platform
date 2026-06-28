import { DEFAULT_LABOUR_CHARGE_UNIT, type LabourChargeUnit } from '@/constants/labour';
import type { GoldRate } from '@/types/rates';
import type { ScanItemData, StoneEntry } from '@/types/scanner';
import { ALL_FORMULA_KARATS, normalizeKarat, parseWeightValue, resolveScannedKarat } from '@/utils/formulaUtils';
import {
  hasActiveLabourCharge,
  hasActiveLabourPurity,
  parseNumericLabourValue,
} from '@/utils/labourUtils';
import { buildQuality } from '@/utils/qualityUtils';

/** Default karat → purity % map (backend gold-rates table fallback). */
export const DEFAULT_KARAT_PURITY_PERCENT: Record<string, number> = {
  '24K': 99.6,
  '22K': 91.6,
  '20K': 85,
  '18K': 75,
  '14K': 58.5,
  '9K': 37.5,
};

export type LabourInputMode = 'percentage' | 'fixedAmount' | 'none';

export interface FinalTabPricingInput {
  scanData: ScanItemData;
  structuredData?: Record<string, string>;
  goldRates?: GoldRate[];
  selectedKarat?: string;
}

export interface StoneAmountRow {
  sequenceIndex: number;
  displayTitle: string;
  stoneType: 'diamond' | 'colorstone';
  rate: string;
  quality: string;
  weight: string;
  amount: number;
  amountDisplay: string;
}

export interface FinalTabPricingResult {
  grossWtDisplay: string;
  netWtGrams: number;
  netWtDisplay: string;
  selectedKarat: string;
  effectivePurityPercent: number;
  puritySource: 'labourOverride' | 'tunchOverride' | 'karatMapping';
  pureWtGrams: number;
  pureWtDisplay: string;
  goldRatePerGram: number;
  goldBasePrice: number;
  goldBasePriceDisplay: string;
  stoneRows: StoneAmountRow[];
  totalStoneAmount: number;
  labourInputMode: LabourInputMode;
  usePercentageMode: boolean;
  useFixedAmountMode: boolean;
  labourAmount: number;
  labourDisplay: string;
  ultimateMrp: number;
  ultimateMrpDisplay: string;
}

export function parseNumericValue(raw: string | number | undefined | null): number {
  if (raw == null) return 0;
  const parsed = Number.parseFloat(String(raw).replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatIndianCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatWeightGrams(grams: number): string {
  if (!Number.isFinite(grams) || grams <= 0) return '—';
  const formatted = grams.toFixed(3).replace(/\.?0+$/, '');
  return `${formatted} g`;
}

export function formatCaratDisplay(weight: string): string {
  const value = parseWeightValue(weight);
  if (value <= 0) return '—';
  return `${value} ct`;
}

export function formatStoneRateDisplay(rate: string): string {
  const trimmed = rate.trim();
  if (!trimmed) return '—';
  if (trimmed.includes('₹') || /\/ct/i.test(trimmed)) return trimmed;
  const numeric = parseNumericValue(trimmed);
  return numeric > 0 ? `₹${numeric.toLocaleString('en-IN')}/ct` : '—';
}

export function computeStoneAmount(weight: string, rate: string): number {
  const carat = parseWeightValue(weight);
  const rateValue = parseNumericValue(rate);
  if (carat <= 0 || rateValue <= 0) return 0;
  return carat * rateValue;
}

export function resolveGoldRatePerGram(
  structuredData?: Record<string, string>,
  goldRates?: GoldRate[],
  karat?: string,
  scanDataGoldRate?: string,
): number {
  const fromScanData = parseNumericValue(scanDataGoldRate);
  if (fromScanData > 0) return fromScanData;

  const fromPayload = parseNumericValue(structuredData?.goldRate);
  if (fromPayload > 0) return fromPayload;

  const normalizedKarat = normalizeKarat(karat);
  if (goldRates?.length && normalizedKarat) {
    const match = goldRates.find(
      (rate) => normalizeKarat(rate.carat) === normalizedKarat,
    );
    if (match?.finalRate && match.finalRate > 0) {
      return match.finalRate / 10;
    }
  }

  return 0;
}

export function parsePurityPercentFromTunch(tunch?: string | null): number | null {
  if (!tunch?.trim()) return null;
  const match = tunch.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : null;
}

export function resolveKaratPurityPercent(
  karat: string,
  goldRates?: GoldRate[],
): number {
  const normalized = normalizeKarat(karat);
  if (!normalized) return 0;

  const fromRates = goldRates?.find((rate) => normalizeKarat(rate.carat) === normalized);
  if (fromRates?.purity && fromRates.purity > 0) return fromRates.purity;

  return DEFAULT_KARAT_PURITY_PERCENT[normalized] ?? 0;
}

export function resolveEffectivePurityPercent(input: {
  scanData: ScanItemData;
  selectedKarat: string;
  goldRates?: GoldRate[];
}): { percent: number; source: FinalTabPricingResult['puritySource'] } {
  if (hasActiveLabourPurity(input.scanData)) {
    const labourPercent = parseNumericLabourValue(input.scanData.labourPurityPercent);
    if (labourPercent !== null && labourPercent > 0) {
      return { percent: labourPercent, source: 'labourOverride' };
    }
  }

  const customPercent = parseNumericLabourValue(input.scanData.customPurityPercent ?? '');
  if (customPercent !== null && customPercent > 0) {
    return { percent: customPercent, source: 'tunchOverride' };
  }

  const tunchPercent = parsePurityPercentFromTunch(input.scanData.tunch);
  if (tunchPercent !== null) {
    return { percent: tunchPercent, source: 'tunchOverride' };
  }

  return {
    percent: resolveKaratPurityPercent(input.selectedKarat, input.goldRates),
    source: 'karatMapping',
  };
}

export function computePureWeightGrams(netWtGrams: number, purityPercent: number): number {
  if (netWtGrams <= 0 || purityPercent <= 0) return 0;
  return netWtGrams * (purityPercent / 100);
}

/** Baseline vs labour-purity override for gold pure wt and amount. */
export function computeGoldAmountWithPurityOverride(input: {
  netWtGrams: number;
  scanData: ScanItemData;
  selectedKarat: string;
  goldRatePerGram: number;
  goldRates?: GoldRate[];
}): {
  pureWtGrams: number;
  goldAmount: number;
  purityPercent: number;
  usedLaborOverride: boolean;
  puritySource: FinalTabPricingResult['puritySource'];
} {
  const { percent, source } = resolveEffectivePurityPercent({
    scanData: input.scanData,
    selectedKarat: input.selectedKarat,
    goldRates: input.goldRates,
  });

  const pureWtGrams = computePureWeightGrams(input.netWtGrams, percent);
  const goldAmount = pureWtGrams * input.goldRatePerGram;

  return {
    pureWtGrams,
    goldAmount,
    purityPercent: percent,
    usedLaborOverride: source === 'labourOverride',
    puritySource: source,
  };
}

export function resolveLabourInputMode(
  scanData: Pick<ScanItemData, 'labourPurityPercent' | 'labourChargeAmount'>,
): LabourInputMode {
  if (hasActiveLabourPurity(scanData)) return 'percentage';
  if (hasActiveLabourCharge(scanData)) return 'fixedAmount';
  return 'none';
}

export function computeLabourAmount(
  scanData: Pick<ScanItemData, 'labourPurityPercent' | 'labourChargeAmount' | 'labourChargeUnit'>,
  netWtGrams: number,
): { amount: number; display: string; mode: LabourInputMode } {
  const mode = resolveLabourInputMode(scanData);

  if (mode === 'percentage') {
    return { amount: 0, display: formatIndianCurrency(0), mode };
  }

  if (mode === 'fixedAmount') {
    const rate = parseNumericLabourValue(scanData.labourChargeAmount) ?? 0;
    const unit = scanData.labourChargeUnit || DEFAULT_LABOUR_CHARGE_UNIT;
    const amount = applyLabourRateToNetWeight(netWtGrams, rate, unit);
    const unitLabel = unit === 'Per 10 Gram' ? '/10g' : '/g';
    return {
      amount,
      display: `${formatIndianCurrency(amount)} (₹${rate.toLocaleString('en-IN')}${unitLabel})`,
      mode,
    };
  }

  return { amount: 0, display: '—', mode };
}

export function applyLabourRateToNetWeight(
  netWtGrams: number,
  rate: number,
  unit: LabourChargeUnit,
): number {
  if (netWtGrams <= 0 || rate <= 0) return 0;
  if (unit === 'Per 10 Gram') return netWtGrams * (rate / 10);
  return netWtGrams * rate;
}

export function buildStoneAmountRow(
  sequenceIndex: number,
  displayTitle: string,
  stoneType: 'diamond' | 'colorstone',
  entry: StoneEntry,
): StoneAmountRow {
  const quality =
    entry.quality.trim() || buildQuality(entry.color, entry.clarity);
  const amount = computeStoneAmount(entry.weight, entry.rate);

  return {
    sequenceIndex,
    displayTitle,
    stoneType,
    rate: formatStoneRateDisplay(entry.rate),
    quality: quality || '—',
    weight: formatCaratDisplay(entry.weight),
    amount,
    amountDisplay: formatIndianCurrency(amount),
  };
}

export function computeFinalTabPricing(input: FinalTabPricingInput): FinalTabPricingResult {
  const selectedKarat =
    input.selectedKarat ||
    resolveScannedKarat(input.scanData.karat, input.scanData.tunch) ||
    '18K';

  const netWtGrams = parseWeightValue(input.scanData.netWt);

  const { percent: effectivePurityPercent, source: puritySource } = resolveEffectivePurityPercent({
    scanData: input.scanData,
    selectedKarat,
    goldRates: input.goldRates,
  });

  const pureWtGrams = computePureWeightGrams(netWtGrams, effectivePurityPercent);
  const goldRatePerGram = resolveGoldRatePerGram(
    input.structuredData,
    input.goldRates,
    selectedKarat,
    input.scanData.goldRate,
  );
  const goldMetrics = computeGoldAmountWithPurityOverride({
    netWtGrams,
    scanData: input.scanData,
    selectedKarat,
    goldRatePerGram,
    goldRates: input.goldRates,
  });
  const goldBasePrice = goldMetrics.goldAmount;

  const labour = computeLabourAmount(input.scanData, netWtGrams);
  const usePercentageMode = labour.mode === 'percentage';
  const useFixedAmountMode = labour.mode === 'fixedAmount';

  return {
    grossWtDisplay: input.scanData.grossWt || '—',
    netWtGrams,
    netWtDisplay: formatWeightGrams(netWtGrams),
    selectedKarat,
    effectivePurityPercent,
    puritySource,
    pureWtGrams,
    pureWtDisplay: formatWeightGrams(pureWtGrams),
    goldRatePerGram,
    goldBasePrice,
    goldBasePriceDisplay: formatIndianCurrency(goldBasePrice),
    stoneRows: [],
    totalStoneAmount: 0,
    labourInputMode: labour.mode,
    usePercentageMode,
    useFixedAmountMode,
    labourAmount: labour.amount,
    labourDisplay: labour.display,
    ultimateMrp: goldBasePrice + labour.amount,
    ultimateMrpDisplay: formatIndianCurrency(goldBasePrice + labour.amount),
  };
}

export function withStoneRows(
  pricing: FinalTabPricingResult,
  stoneRows: StoneAmountRow[],
): FinalTabPricingResult {
  const totalStoneAmount = stoneRows.reduce((sum, row) => sum + row.amount, 0);
  const ultimateMrp = pricing.goldBasePrice + totalStoneAmount + pricing.labourAmount;

  return {
    ...pricing,
    stoneRows,
    totalStoneAmount,
    ultimateMrp,
    ultimateMrpDisplay: formatIndianCurrency(ultimateMrp),
  };
}

export const KARAT_DROPDOWN_OPTIONS = [...ALL_FORMULA_KARATS];
