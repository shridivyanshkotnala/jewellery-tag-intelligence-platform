import type { ApiJewelleryType, JewelleryType } from '@/types/scanner';
import { toApiJewelleryType } from '@/utils/scanMappers';

const COMMON_FIELDS = ['grossWeight', 'netWeight', 'purity', 'labour', 'other'] as const;

const JEWELLERY_STONE_FIELDS: Record<JewelleryType, readonly string[]> = {
  Diamond: ['diamondWeight', 'diamondRate', 'diamondQuality', 'diamondPieces'],
  Gold: ['goldWeight', 'goldRate', 'goldQuality', 'goldPieces'],
  Silver: ['silverWeight', 'silverRate', 'silverQuality', 'silverPieces'],
  'Colour Stone': [
    'coloredStoneWeight',
    'coloredStoneRate',
    'coloredStoneQuality',
    'coloredStonePieces',
  ],
};

const SHARED_FIELD_LABELS: Record<string, string> = {
  grossWeight: 'Gross Wt',
  netWeight: 'Net Wt',
  purity: 'Purity / Tunch',
  pureWeight: 'Pure Wt',
  labour: 'Labour',
  other: 'Other',
};

const JEWELLERY_FIELD_LABELS: Record<JewelleryType, Record<string, string>> = {
  Diamond: {
    ...SHARED_FIELD_LABELS,
    diamondWeight: 'Diamond Wt',
    diamondRate: 'Diamond Rate',
    diamondQuality: 'Diamond Quality',
    diamondPieces: 'Diamond Pieces',
  },
  Gold: {
    ...SHARED_FIELD_LABELS,
    goldWeight: 'Gold Wt',
    goldRate: 'Gold Rate',
    goldQuality: 'Gold Quality',
    goldPieces: 'Gold Pieces',
  },
  Silver: {
    ...SHARED_FIELD_LABELS,
    silverWeight: 'Silver Wt',
    silverRate: 'Silver Rate',
    silverQuality: 'Silver Quality',
    silverPieces: 'Silver Pieces',
  },
  'Colour Stone': {
    ...SHARED_FIELD_LABELS,
    coloredStoneWeight: 'Colour Stone Wt',
    coloredStoneRate: 'Colour Stone Rate',
    coloredStoneQuality: 'Colour Stone Quality',
    coloredStonePieces: 'Colour Stone Pieces',
  },
};

export function getAvailableFieldsForJewelleryType(jewelleryType: JewelleryType): string[] {
  return [...COMMON_FIELDS, ...JEWELLERY_STONE_FIELDS[jewelleryType]];
}

export function getClarificationFieldLabel(
  field: string,
  jewelleryType: JewelleryType,
): string {
  return JEWELLERY_FIELD_LABELS[jewelleryType][field] ?? field;
}

export function getAvailableFieldsForApiJewelleryType(
  jewelleryType: ApiJewelleryType | string,
): string[] {
  const normalized = jewelleryType.toUpperCase() as ApiJewelleryType;
  const typeMap: Record<ApiJewelleryType, JewelleryType> = {
    DIAMOND: 'Diamond',
    GOLD: 'Gold',
    SILVER: 'Silver',
    COLOUR_STONE: 'Colour Stone',
  };

  return getAvailableFieldsForJewelleryType(typeMap[normalized] ?? 'Diamond');
}

export function applyJewelleryTypeToClarificationFields<T extends { availableFields: string[] }>(
  fields: T[],
  jewelleryType: JewelleryType,
): T[] {
  const availableFields = getAvailableFieldsForJewelleryType(jewelleryType);

  return fields.map((field) => ({
    ...field,
    availableFields,
    suggestedField: availableFields.includes(field.suggestedField)
      ? field.suggestedField
      : 'other',
  }));
}

export function getJewelleryTypeFromApi(apiType?: string | null): JewelleryType {
  const map: Record<string, JewelleryType> = {
    DIAMOND: 'Diamond',
    GOLD: 'Gold',
    SILVER: 'Silver',
    COLOUR_STONE: 'Colour Stone',
  };
  return map[(apiType ?? '').toUpperCase()] ?? 'Diamond';
}

export function jewelleryTypeToApi(type: JewelleryType): ApiJewelleryType {
  return toApiJewelleryType(type);
}
