import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown, Pencil } from 'lucide-react-native';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import {
  KARAT_DROPDOWN_OPTIONS,
  computePureWeightGrams,
  resolveEffectivePurityPercent as resolvePurityFromScan,
  resolveKaratPurityPercent,
} from '@/utils/scanPriceCalculation';
import { Colors } from '@/constants/theme';
import { parseNumericLabourValue } from '@/utils/labourUtils';
import { resolveScannedKarat, parseWeightValue } from '@/utils/formulaUtils';
import type { ScanItemData } from '@/types/scanner';

interface RawMaterialSectionProps {
  scanData: Pick<
    ScanItemData,
    'grossWt' | 'netWt' | 'karat' | 'tunch' | 'customPurityPercent' | 'labourPurityPercent'
  >;
  editable?: boolean;
  onFieldChange?: (field: keyof ScanItemData, value: string) => void;
}

function formatPurityLabel(percent: number): string {
  return `${percent}%`;
}

export function RawMaterialSection({
  scanData,
  editable = false,
  onFieldChange,
}: RawMaterialSectionProps) {
  const [karatOpen, setKaratOpen] = useState(false);
  const [editingPurity, setEditingPurity] = useState(false);

  const resolvedKarat = resolveScannedKarat(scanData.karat, scanData.tunch);
  const defaultPurity = resolveKaratPurityPercent(resolvedKarat);
  const { percent: effectivePurity } = resolvePurityFromScan({
    scanData: scanData as ScanItemData,
    selectedKarat: resolvedKarat,
  });
  const pureWeightGrams = computePureWeightGrams(parseWeightValue(scanData.netWt), effectivePurity);

  const purityDisplay = useMemo(() => {
    if (scanData.labourPurityPercent.trim()) {
      return scanData.labourPurityPercent;
    }
    if (scanData.customPurityPercent.trim()) {
      return scanData.customPurityPercent;
    }
    if (defaultPurity !== null) {
      return formatPurityLabel(defaultPurity);
    }
    return scanData.tunch || '—';
  }, [
    scanData.labourPurityPercent,
    scanData.customPurityPercent,
    scanData.tunch,
    defaultPurity,
  ]);

  const handleKaratSelect = (karat: string) => {
    onFieldChange?.('karat', karat);
    onFieldChange?.('customPurityPercent', '');
    setKaratOpen(false);
  };

  const handlePurityEdit = (text: string) => {
    const digits = text.replace(/[^0-9.]/g, '');
    if (!digits) {
      onFieldChange?.('customPurityPercent', '');
      return;
    }
    onFieldChange?.('customPurityPercent', `${digits}%`);
  };

  return (
    <FormSection title="Raw Material: Gold (fixed)" variant="card">
      <FormFieldGrid>
        <FormFieldGridItem>
          <FormInput
            label="Gross Wt."
            value={scanData.grossWt}
            onChangeText={(value) => onFieldChange?.('grossWt', value)}
            editable={editable}
            placeholder="from scanner"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Net Wt."
            value={scanData.netWt}
            onChangeText={(value) => onFieldChange?.('netWt', value)}
            editable={editable}
            placeholder="from scanner"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Pure Wt."
            value={
              pureWeightGrams > 0
                ? `${pureWeightGrams.toFixed(3).replace(/\.?0+$/, '')} g`
                : ''
            }
            editable={false}
            placeholder="Net wt × % purity"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <View className="mb-2.5">
            <FieldLabel label="Tunch Purity" />
            {editable ? (
              <>
                <Pressable
                  onPress={() => setKaratOpen((prev) => !prev)}
                  className="mb-2 min-h-11 flex-row items-center justify-between rounded-input border border-border bg-surface-input px-3.5 py-2"
                >
                  <Text className="flex-1 text-sm text-text-primary">
                    {resolvedKarat || 'Select karat'}
                  </Text>
                  <ChevronDown size={18} color="#757575" />
                </Pressable>
                {karatOpen ? (
                  <View className="mb-2 overflow-hidden rounded-input border border-border bg-white">
                    {KARAT_DROPDOWN_OPTIONS.map((option) => {
                      const purity = resolveKaratPurityPercent(option);
                      return (
                        <Pressable
                          key={option}
                          onPress={() => handleKaratSelect(option)}
                          className={`flex-row items-center justify-between px-3.5 py-3 ${
                            resolvedKarat === option ? 'bg-[#E8F0EC]' : ''
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              resolvedKarat === option
                                ? 'font-bold text-primary'
                                : 'text-text-primary'
                            }`}
                          >
                            {option}
                          </Text>
                          {purity !== null ? (
                            <Text className="text-xs text-text-muted">
                              {formatPurityLabel(purity)}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
                <View className="flex-row items-center rounded-input border border-border bg-surface-input px-3.5">
                  {editingPurity ? (
                    <TextInput
                      value={parseNumericLabourValue(scanData.customPurityPercent)?.toString() ?? ''}
                      onChangeText={handlePurityEdit}
                      onBlur={() => setEditingPurity(false)}
                      autoFocus
                      keyboardType="decimal-pad"
                      placeholder={defaultPurity !== null ? String(defaultPurity) : '75'}
                      placeholderTextColor={Colors.placeholder}
                      className="flex-1 py-3 text-sm text-text-primary"
                    />
                  ) : (
                    <Text className="flex-1 py-3 text-sm text-text-primary">{purityDisplay}</Text>
                  )}
                  <Pressable onPress={() => setEditingPurity(true)} hitSlop={8}>
                    <Pencil size={14} color="#757575" />
                  </Pressable>
                </View>
                <Text className="mt-1 text-[10px] leading-4 text-text-muted">
                  Purity % from backend; edit to override (e.g. 74.9%)
                </Text>
              </>
            ) : (
              <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
                <Text className="text-sm text-text-primary">
                  {resolvedKarat ? `${resolvedKarat} · ${purityDisplay}` : purityDisplay}
                </Text>
              </View>
            )}
          </View>
        </FormFieldGridItem>
      </FormFieldGrid>
    </FormSection>
  );
}
