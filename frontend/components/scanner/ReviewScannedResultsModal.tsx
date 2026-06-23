import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Pencil } from 'lucide-react-native';

import { ColorstoneSection } from '@/components/scanner/ColorstoneSection';
import { DiamondSection } from '@/components/scanner/DiamondSection';
import { FormSection } from '@/components/scanner/FormSection';
import { getLaborValuesFromScanData, LaborSection } from '@/components/scanner/LaborSection';
import { Colors } from '@/constants/theme';
import type { ScanItemData } from '@/types/scanner';
import { validateLabour } from '@/utils/labourUtils';

interface ReviewFieldRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  missing?: boolean;
  editable?: boolean;
}

function ReviewFieldRow({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  missing = false,
  editable = true,
}: ReviewFieldRowProps) {
  return (
    <View className="mb-3 flex-row items-center gap-3">
      <Text className="w-[118px] text-sm font-semibold text-text-primary">
        {label}
        {required ? <Text className="text-danger-text">*</Text> : null}
      </Text>
      <View
        className={`h-[42px] flex-1 flex-row items-center rounded-input border bg-white px-3 ${
          missing ? 'border-danger-text' : 'border-border'
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
          placeholderTextColor={Colors.placeholder}
          className="flex-1 text-sm text-text-primary"
        />
        {editable && !missing ? <Pencil size={14} color="#757575" /> : null}
      </View>
    </View>
  );
}

interface ReviewScannedResultsModalProps {
  scanData: ScanItemData;
  jewelleryType: 'Gold' | 'Diamond';
  onFieldChange: (field: keyof ScanItemData, value: string) => void;
  onLaborChange: (values: Partial<ScanItemData>) => void;
  onReScan: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

export function ReviewScannedResultsModal({
  scanData,
  jewelleryType,
  onFieldChange,
  onLaborChange,
  onReScan,
  onConfirm,
  confirming = false,
}: ReviewScannedResultsModalProps) {
  const [diamondRateError, setDiamondRateError] = useState(false);
  const [colorstoneRateError, setColorstoneRateError] = useState(false);
  const [showLabourValidation, setShowLabourValidation] = useState(false);

  const hasRateError = diamondRateError || colorstoneRateError;
  const labourError = validateLabour(scanData);
  const canConfirm = Boolean(scanData.grossWt.trim()) && !hasRateError;

  const handleConfirm = () => {
    if (labourError) {
      setShowLabourValidation(true);
      return;
    }
    onConfirm();
  };

  return (
    <View className="rounded-[20px] bg-white px-5 py-6 shadow-lg">
      <Text className="mb-5 text-lg font-bold text-text-primary">Review Scanned Results</Text>

      <FormSection title="Weight & Purity">
        <ReviewFieldRow
          label="Gross Wt."
          value={scanData.grossWt}
          onChangeText={(value) => onFieldChange('grossWt', value)}
          placeholder="Enter Missing Value"
          required
          missing={!scanData.grossWt}
        />
        <ReviewFieldRow
          label="Net Weight"
          value={scanData.netWt}
          onChangeText={(value) => onFieldChange('netWt', value)}
        />
        <ReviewFieldRow
          label="Tunch (Purity)"
          value={scanData.tunch}
          onChangeText={(value) => onFieldChange('tunch', value)}
        />
      </FormSection>

      <ColorstoneSection
        values={{
          weight: scanData.colorstoneWeight,
          color: scanData.colorstoneColor,
          clarity: scanData.colorstoneClarity,
          quality: scanData.colorstoneQuality,
          rate: scanData.colorstoneRate,
        }}
        onChange={(values) => {
          if (values.weight !== undefined) onFieldChange('colorstoneWeight', values.weight);
          if (values.color !== undefined) onFieldChange('colorstoneColor', values.color);
          if (values.clarity !== undefined) onFieldChange('colorstoneClarity', values.clarity);
          if (values.quality !== undefined) onFieldChange('colorstoneQuality', values.quality);
          if (values.rate !== undefined) onFieldChange('colorstoneRate', values.rate);
        }}
        onRateErrorChange={setColorstoneRateError}
      />

      {jewelleryType === 'Diamond' ? (
        <DiamondSection
          values={{
            weight: scanData.diamondWeight,
            color: scanData.diamondColor,
            clarity: scanData.diamondClarity,
            quality: scanData.diamondQuality,
            rate: scanData.diamondRate,
          }}
          onChange={(values) => {
            if (values.weight !== undefined) onFieldChange('diamondWeight', values.weight);
            if (values.color !== undefined) onFieldChange('diamondColor', values.color);
            if (values.clarity !== undefined) onFieldChange('diamondClarity', values.clarity);
            if (values.quality !== undefined) onFieldChange('diamondQuality', values.quality);
            if (values.rate !== undefined) onFieldChange('diamondRate', values.rate);
          }}
          onRateErrorChange={setDiamondRateError}
        />
      ) : null}

      <LaborSection
        values={getLaborValuesFromScanData(scanData)}
        onChange={(values) => onLaborChange(values)}
        showValidationError={showLabourValidation || Boolean(labourError)}
      />

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={onReScan}
          className="flex-1 items-center rounded-button border border-border bg-white py-3.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-text-secondary">ReScan</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={confirming || !canConfirm}
          className="flex-1 items-center rounded-button bg-primary py-3.5 active:opacity-90 disabled:opacity-60"
        >
          {confirming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-semibold text-white">Confirm</Text>
          )}
        </Pressable>
      </View>

      {hasRateError ? (
        <Text className="mt-3 text-center text-xs text-danger-text">
          Resolve rate errors before saving.
        </Text>
      ) : null}

      <Text className="mt-4 text-center text-xs leading-5 text-text-secondary">
        <Text className="text-danger-text">*</Text> Scanner couldn&apos;t scan or find specific value,
        Manually Enter value or ReScan.
      </Text>
    </View>
  );
}
