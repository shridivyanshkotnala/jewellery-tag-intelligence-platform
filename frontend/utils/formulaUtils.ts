export const ALL_FORMULA_KARATS = ['9K', '14K', '18K', '20K', '22K'] as const;

export type FormulaKarat = (typeof ALL_FORMULA_KARATS)[number];

export function normalizeKarat(value: string): string {
  const match = value.trim().match(/(\d+)\s*k(?:t)?/i);
  if (!match) return '';
  return `${match[1]}K`.toUpperCase();
}

export function extractKaratFromTunch(tunch: string): string {
  return normalizeKarat(tunch);
}

export function resolveScannedKarat(karat: string, tunch: string): string {
  const fromKarat = normalizeKarat(karat);
  if (fromKarat) return fromKarat;
  return extractKaratFromTunch(tunch);
}

export function isKaratWhitelisted(karat: string, whitelist: string[]): boolean {
  const normalized = normalizeKarat(karat);
  return normalized !== '' && whitelist.includes(normalized);
}

export function getKaratOptionsForEdit(rules: string[], index: number): string[] {
  const occupied = new Set(rules.filter((_, i) => i !== index));
  return ALL_FORMULA_KARATS.filter((karat) => !occupied.has(karat));
}

export function getKaratOptionsForAdd(rules: string[]): string[] {
  return ALL_FORMULA_KARATS.filter((karat) => !rules.includes(karat));
}

export function applyFormula2KaratConstraint(
  scannedKarat: string,
  whitelist: string[],
): { karat: string; requiresDropdown: boolean } {
  if (isKaratWhitelisted(scannedKarat, whitelist)) {
    return { karat: normalizeKarat(scannedKarat), requiresDropdown: false };
  }
  return { karat: '', requiresDropdown: true };
}

export function parseWeightValue(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computeNetWeightFallback(
  grossWt: string,
  diamondWeight: string,
  colorstoneWeight: string,
): string {
  const gross = parseWeightValue(grossWt);
  const dia = parseWeightValue(diamondWeight);
  const colorstone = parseWeightValue(colorstoneWeight);
  const result = gross - 0.2 * (dia + colorstone);
  if (!Number.isFinite(result)) return '';
  return result > 0 ? result.toFixed(3).replace(/\.?0+$/, '') : '0';
}
