import type { JewelleryType, ScanItemData, ScanMode } from '@/types/scanner';
import type {
  ApiJewelleryType,
  ApiScanType,
  ClarificationField,
  ConfirmedMapping,
  StructuredScanData,
} from '@/types/scanner';
import { getClarificationFieldLabel } from '@/utils/clarificationFields';

const JEWELLERY_TYPE_TO_API: Record<JewelleryType, ApiJewelleryType> = {
  Diamond: 'DIAMOND',
  Gold: 'GOLD',
  Silver: 'SILVER',
  'Colour Stone': 'COLOUR_STONE',
};

const API_FIELD_LABELS: Record<string, string> = {
  grossWeight: 'Gross Wt',
  netWeight: 'Net Wt',
  pureWeight: 'Pure Wt',
  purity: 'Purity / Tunch',
  diamondWeight: 'Diamond Wt',
  diamondPieces: 'Diamond Pieces',
  diamondRate: 'Diamond Rate',
  diamondQuality: 'Diamond Quality',
  goldWeight: 'Gold Wt',
  goldRate: 'Gold Rate',
  goldQuality: 'Gold Quality',
  goldPieces: 'Gold Pieces',
  silverWeight: 'Silver Wt',
  silverRate: 'Silver Rate',
  silverQuality: 'Silver Quality',
  silverPieces: 'Silver Pieces',
  coloredStoneWeight: 'Colour Stone Wt',
  coloredStoneRate: 'Colour Stone Rate',
  coloredStoneQuality: 'Colour Stone Quality',
  coloredStonePieces: 'Colour Stone Pieces',
  labour: 'Labour',
  other: 'Other',
};

const SCAN_ITEM_TO_API: Partial<Record<keyof ScanItemData, string>> = {
  grossWt: 'grossWeight',
  netWt: 'netWeight',
  pureWt: 'pureWeight',
  tunch: 'purity',
  diamondWeight: 'diamondWeight',
  diamondPieces: 'diamondPieces',
  diamondRate: 'diamondRate',
  diamondQuality: 'diamondQuality',
  labour: 'labour',
};

const API_TO_SCAN_ITEM: Record<string, keyof ScanItemData> = {
  grossWeight: 'grossWt',
  netWeight: 'netWt',
  pureWeight: 'pureWt',
  purity: 'tunch',
  diamondWeight: 'diamondWeight',
  diamondPieces: 'diamondPieces',
  diamondRate: 'diamondRate',
  diamondQuality: 'diamondQuality',
  labour: 'labour',
};

export function toApiJewelleryType(type: JewelleryType): ApiJewelleryType {
  return JEWELLERY_TYPE_TO_API[type];
}

export function toApiScanType(mode: ScanMode): ApiScanType {
  return mode === 'both' ? 'BOTH_SIDES' : 'SINGLE_SIDE';
}

export function getApiFieldLabel(field: string, jewelleryType?: JewelleryType): string {
  if (jewelleryType) {
    return getClarificationFieldLabel(field, jewelleryType);
  }
  return API_FIELD_LABELS[field] ?? field;
}

export function structuredDataToScanItem(data: StructuredScanData): Partial<ScanItemData> {
  const result: Partial<ScanItemData> = {};
  for (const [apiKey, value] of Object.entries(data)) {
    const scanKey = API_TO_SCAN_ITEM[apiKey];
    if (scanKey && value != null) {
      result[scanKey] = String(value) as ScanItemData[typeof scanKey];
    }
  }
  return result;
}

export function scanItemToStructuredData(
  scanData: ScanItemData,
  existing: StructuredScanData = {},
): StructuredScanData {
  const result: StructuredScanData = { ...existing };
  for (const [scanKey, apiKey] of Object.entries(SCAN_ITEM_TO_API) as [keyof ScanItemData, string][]) {
    const value = scanData[scanKey];
    if (value) {
      result[apiKey] = value;
    }
  }
  return result;
}

export function buildConfirmedMappings(
  fields: ClarificationField[],
  selections: Record<string, { mappedField: string; description?: string }>,
): ConfirmedMapping[] {
  return fields.map((field) => ({
    abbreviation: field.abbreviation,
    mappedField: selections[field.abbreviation]?.mappedField ?? field.suggestedField,
    ...(selections[field.abbreviation]?.mappedField === 'other' &&
    selections[field.abbreviation]?.description
      ? { description: selections[field.abbreviation].description }
      : {}),
  }));
}
