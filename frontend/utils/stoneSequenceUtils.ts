import type {
  JewelleryType,
  ScanItemData,
  SequentialStoneBlock,
  StoneEntry,
  StoneKind,
  StructuredScanData,
} from '@/types/scanner';
import { buildQuality } from '@/utils/qualityUtils';

const STONE_ARRAY_KEYS: Record<StoneKind, 'diamonds' | 'colorstones'> = {
  diamond: 'diamonds',
  colorstone: 'colorstones',
};

const STONE_TYPE_LABELS: Record<StoneKind, string> = {
  diamond: 'Diamond',
  colorstone: 'Colorstone',
};

export function createEmptyStoneEntry(stoneType: StoneKind): StoneEntry {
  return {
    stoneType,
    weight: '',
    color: '',
    clarity: '',
    quality: '',
    rate: '',
    pieces: '',
  };
}

function flattenStoneField(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'object' && raw !== null && 'value' in raw) {
    const value = (raw as { value?: string | number | null }).value;
    return value != null ? String(value).trim() : '';
  }
  return String(raw).trim();
}

function hasStoneData(entry: StoneEntry): boolean {
  return Boolean(
    entry.weight ||
      entry.color ||
      entry.clarity ||
      entry.quality ||
      entry.rate ||
      entry.pieces,
  );
}

function normalizeStoneEntry(raw: unknown, stoneType: StoneKind): StoneEntry {
  if (!raw || typeof raw !== 'object') {
    return createEmptyStoneEntry(stoneType);
  }

  const record = raw as Record<string, unknown>;
  const prefix = stoneType === 'diamond' ? 'diamond' : 'colorstone';
  const color = flattenStoneField(record.color ?? record[`${prefix}Color`]);
  const clarity = flattenStoneField(record.clarity ?? record[`${prefix}Clarity`]);
  const quality =
    flattenStoneField(record.quality ?? record[`${prefix}Quality`]) ||
    buildQuality(color, clarity);

  return {
    stoneType,
    weight: flattenStoneField(record.weight ?? record[`${prefix}Weight`]),
    color,
    clarity,
    quality,
    rate: flattenStoneField(record.rate ?? record[`${prefix}Rate`]),
    pieces: flattenStoneField(record.pieces ?? record.diamondPieces),
  };
}

function parseStoneArray(raw: unknown, stoneType: StoneKind): StoneEntry[] {
  if (raw == null) return [];

  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => normalizeStoneEntry(item, stoneType));
}

function stoneEntryFromScanData(scanData: ScanItemData, stoneType: StoneKind): StoneEntry | null {
  if (stoneType === 'diamond') {
    const entry: StoneEntry = {
      stoneType,
      weight: scanData.diamondWeight,
      color: scanData.diamondColor,
      clarity: scanData.diamondClarity,
      quality:
        scanData.diamondQuality ||
        buildQuality(scanData.diamondColor, scanData.diamondClarity),
      rate: scanData.diamondRate,
      pieces: scanData.diamondPieces,
    };
    return hasStoneData(entry) ? entry : null;
  }

  const entry: StoneEntry = {
    stoneType,
    weight: scanData.colorstoneWeight,
    color: scanData.colorstoneColor,
    clarity: scanData.colorstoneClarity,
    quality:
      scanData.colorstoneQuality ||
      buildQuality(scanData.colorstoneColor, scanData.colorstoneClarity),
    rate: scanData.colorstoneRate,
  };
  return hasStoneData(entry) ? entry : null;
}

export function parseStoneArraysFromStructuredData(
  data: StructuredScanData | Record<string, unknown>,
  scanData?: Partial<ScanItemData>,
): { diamonds: StoneEntry[]; colorstones: StoneEntry[] } {
  const record = data as Record<string, unknown>;
  let diamonds = parseStoneArray(record.diamonds, 'diamond');
  let colorstones = parseStoneArray(record.colorstones, 'colorstone');

  if (diamonds.length === 0 && scanData) {
    const fallback = stoneEntryFromScanData(scanData as ScanItemData, 'diamond');
    if (fallback) diamonds = [fallback];
  }

  if (colorstones.length === 0 && scanData) {
    const fallback = stoneEntryFromScanData(scanData as ScanItemData, 'colorstone');
    if (fallback) colorstones = [fallback];
  }

  return { diamonds, colorstones };
}

export function resolveStoneEntryArrays(
  diamonds: StoneEntry[],
  colorstones: StoneEntry[],
  jewelleryType: JewelleryType,
): { diamonds: StoneEntry[]; colorstones: StoneEntry[] } {
  let resolvedDiamonds = [...diamonds];
  let resolvedColorstones = [...colorstones];

  const diamondsFromScan = diamonds.length > 0;
  const colorstonesFromScan = colorstones.length > 0;

  if (jewelleryType === 'Diamond' && resolvedDiamonds.length === 0) {
    resolvedDiamonds = [createEmptyStoneEntry('diamond')];
  }

  if (jewelleryType !== 'Diamond') {
    resolvedDiamonds = resolvedDiamonds.filter(hasStoneData);
  }

  if (diamondsFromScan && !colorstonesFromScan) {
    resolvedColorstones = [createEmptyStoneEntry('colorstone')];
  } else if (resolvedColorstones.length === 0) {
    resolvedColorstones = [createEmptyStoneEntry('colorstone')];
  }

  return { diamonds: resolvedDiamonds, colorstones: resolvedColorstones };
}

export function buildSequentialStoneBlocks(
  diamonds: StoneEntry[],
  colorstones: StoneEntry[],
  jewelleryType: JewelleryType,
): SequentialStoneBlock[] {
  const { diamonds: resolvedDiamonds, colorstones: resolvedColorstones } = resolveStoneEntryArrays(
    diamonds,
    colorstones,
    jewelleryType,
  );

  const blocks: SequentialStoneBlock[] = [];
  let sequenceIndex = 0;

  for (let sourceIndex = 0; sourceIndex < resolvedDiamonds.length; sourceIndex++) {
    blocks.push({
      sequenceIndex,
      displayTitle: `Stone Type ${sequenceIndex + 1} (${STONE_TYPE_LABELS.diamond})`,
      stoneType: 'diamond',
      entry: resolvedDiamonds[sourceIndex],
      sourceIndex,
    });
    sequenceIndex += 1;
  }

  for (let sourceIndex = 0; sourceIndex < resolvedColorstones.length; sourceIndex++) {
    blocks.push({
      sequenceIndex,
      displayTitle: `Stone Type ${sequenceIndex + 1} (${STONE_TYPE_LABELS.colorstone})`,
      stoneType: 'colorstone',
      entry: resolvedColorstones[sourceIndex],
      sourceIndex,
    });
    sequenceIndex += 1;
  }

  return blocks;
}

export function sumStoneWeights(entries: StoneEntry[]): string {
  const total = entries.reduce((sum, entry) => {
    const parsed = Number.parseFloat(entry.weight.replace(/[^\d.]/g, ''));
    return sum + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
  if (total <= 0) return '';
  return String(total);
}

export function applyStoneEntriesToScanData(
  scanData: ScanItemData,
  diamonds: StoneEntry[],
  colorstones: StoneEntry[],
): Partial<ScanItemData> {
  const primaryDiamond = diamonds[0] ?? createEmptyStoneEntry('diamond');
  const primaryColorstone = colorstones[0] ?? createEmptyStoneEntry('colorstone');

  return {
    diamondWeight: primaryDiamond.weight,
    diamondColor: primaryDiamond.color,
    diamondClarity: primaryDiamond.clarity,
    diamondQuality: primaryDiamond.quality,
    diamondRate: primaryDiamond.rate,
    diamondPieces: primaryDiamond.pieces ?? '',
    colorstoneWeight: primaryColorstone.weight,
    colorstoneColor: primaryColorstone.color,
    colorstoneClarity: primaryColorstone.clarity,
    colorstoneQuality: primaryColorstone.quality,
    colorstoneRate: primaryColorstone.rate,
  };
}

export function stoneEntriesToStructuredData(
  existing: StructuredScanData,
  diamonds: StoneEntry[],
  colorstones: StoneEntry[],
): StructuredScanData {
  const result: StructuredScanData = { ...existing };

  if (diamonds.length > 0) {
    result[STONE_ARRAY_KEYS.diamond] = JSON.stringify(diamonds);
  } else {
    delete result[STONE_ARRAY_KEYS.diamond];
  }

  if (colorstones.length > 0) {
    result[STONE_ARRAY_KEYS.colorstone] = JSON.stringify(colorstones);
  } else {
    delete result[STONE_ARRAY_KEYS.colorstone];
  }

  const flatFields = applyStoneEntriesToScanData(
    {} as ScanItemData,
    diamonds,
    colorstones,
  );

  if (flatFields.diamondWeight) result.diamondWeight = flatFields.diamondWeight;
  if (flatFields.diamondColor) result.diamondColor = flatFields.diamondColor;
  if (flatFields.diamondClarity) result.diamondClarity = flatFields.diamondClarity;
  if (flatFields.diamondQuality) result.diamondQuality = flatFields.diamondQuality;
  if (flatFields.diamondRate) result.diamondRate = flatFields.diamondRate;
  if (flatFields.diamondPieces) result.diamondPieces = flatFields.diamondPieces;

  if (flatFields.colorstoneWeight) result.colorstoneWeight = flatFields.colorstoneWeight;
  if (flatFields.colorstoneColor) result.colorstoneColor = flatFields.colorstoneColor;
  if (flatFields.colorstoneClarity) result.colorstoneClarity = flatFields.colorstoneClarity;
  if (flatFields.colorstoneQuality) result.colorstoneQuality = flatFields.colorstoneQuality;
  if (flatFields.colorstoneRate) result.colorstoneRate = flatFields.colorstoneRate;

  return result;
}

export function updateStoneEntryAtIndex(
  entries: StoneEntry[],
  index: number,
  partial: Partial<StoneEntry>,
): StoneEntry[] {
  return entries.map((entry, entryIndex) =>
    entryIndex === index ? { ...entry, ...partial } : entry,
  );
}
