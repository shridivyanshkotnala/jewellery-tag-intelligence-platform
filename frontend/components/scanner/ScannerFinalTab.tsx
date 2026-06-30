import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { LabourChargeResultSection } from '@/components/scanner/LabourChargeResultSection';
import { LaborSection, type LaborSectionValues } from '@/components/scanner/LaborSection';
import { RawMaterialGoldSectionInteractive } from '@/components/scanner/RawMaterialGoldSection';
import { RawMaterialSection } from '@/components/scanner/RawMaterialSection';
import { StoneTypeRowCard } from '@/components/scanner/StoneTypeRowCard';
import { StoneTypeSequence } from '@/components/scanner/StoneTypeResultSection';
import { useFinalTabPricing } from '@/hooks/useFinalTabPricing';
import type { GoldRate } from '@/types/rates';
import type { JewelleryType, ScanItemData, StoneEntry, StructuredScanData } from '@/types/scanner';
import { resolveScannedKarat } from '@/utils/formulaUtils';
import { formatIndianCurrency } from '@/utils/scanPriceCalculation';
import { buildSequentialStoneBlocks } from '@/utils/stoneSequenceUtils';

interface ScannerFinalTabProps {
  scanData: ScanItemData;
  structuredData?: StructuredScanData;
  diamonds: StoneEntry[];
  colorstones: StoneEntry[];
  jewelleryType: JewelleryType;
  goldRates?: GoldRate[];
  editable?: boolean;
  onFieldChange?: (field: keyof ScanItemData, value: string) => void;
  onStoneEntryChange?: (
    stoneType: 'diamond' | 'colorstone',
    sourceIndex: number,
    values: Partial<StoneEntry>,
  ) => void;
  onLaborChange?: (values: Partial<LaborSectionValues>) => void;
  onRateErrorChange?: (sequenceIndex: number, hasError: boolean) => void;
  showLabourValidation?: boolean;
  gstNote?: string;
}

export function ScannerFinalTab({
  scanData,
  structuredData,
  diamonds,
  colorstones,
  jewelleryType,
  goldRates,
  editable = false,
  onFieldChange,
  onStoneEntryChange,
  onLaborChange,
  onRateErrorChange,
  showLabourValidation = false,
  gstNote = 'MRP = Gold + Stones + Labour (client-side)',
}: ScannerFinalTabProps) {
  const [selectedKarat, setSelectedKarat] = useState(
    () => resolveScannedKarat(scanData.karat, scanData.tunch) || '18K',
  );

  const pricing = useFinalTabPricing({
    scanData: { ...scanData, karat: selectedKarat },
    structuredData,
    selectedType: jewelleryType,
    goldRates,
    selectedKarat,
  });

  const editableStoneBlocks = useMemo(
    () => buildSequentialStoneBlocks(diamonds, colorstones, jewelleryType),
    [diamonds, colorstones, jewelleryType],
  );

  const handleKaratChange = (karat: string) => {
    setSelectedKarat(karat);
    onFieldChange?.('karat', karat);
    onFieldChange?.('customPurityPercent', '');
  };

  return (
    <View>
      {editable ? (
        <RawMaterialSection
          scanData={{ ...scanData, karat: selectedKarat }}
          editable
          onFieldChange={(field, value) => {
            if (field === 'karat') {
              handleKaratChange(value);
              return;
            }
            onFieldChange?.(field, value);
          }}
        />
      ) : (
        <RawMaterialGoldSectionInteractive
          badge="Gold"
          pricing={pricing}
        />
      )}

      {editable
        ? editableStoneBlocks.map((block) => (
            <StoneTypeRowCard
              key={`stone-${block.sequenceIndex}-${block.stoneType}-${block.sourceIndex}`}
              title={block.displayTitle}
              stoneType={block.stoneType}
              values={{
                weight: block.entry.weight,
                color: block.entry.color,
                clarity: block.entry.clarity,
                quality: block.entry.quality,
                rate: block.entry.rate,
                shape: block.entry.shape,
              }}
              editable
              onChange={(values) =>
                onStoneEntryChange?.(block.stoneType, block.sourceIndex, values)
              }
              onRateErrorChange={(hasError) =>
                onRateErrorChange?.(block.sequenceIndex, hasError)
              }
            />
          ))
        : <StoneTypeSequence rows={pricing.stoneRows} />}

      {editable ? (
        <LaborSection
          values={{
            labourPurityPercent: scanData.labourPurityPercent,
            labourChargeAmount: scanData.labourChargeAmount,
            labourChargeUnit: scanData.labourChargeUnit,
          }}
          netWeightGrams={scanData.netWt}
          onChange={(values) => onLaborChange?.(values)}
          showValidationError={showLabourValidation}
        />
      ) : (
        <LabourChargeResultSection pricing={pricing} />
      )}
    </View>
  );
}
