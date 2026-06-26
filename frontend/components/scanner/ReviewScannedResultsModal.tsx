import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { ScannerFinalTab } from '@/components/scanner/ScannerFinalTab';
import { useFormulaStore } from '@/store/formulaStore';
import type { ScanItemData, StoneEntry, StructuredScanData } from '@/types/scanner';
import {
  applyFormula2KaratConstraint,
  computeNetWeightFallback,
  isKaratWhitelisted,
  resolveScannedKarat,
} from '@/utils/formulaUtils';
import { validateLabour } from '@/utils/labourUtils';
import {
  parseStoneArraysFromStructuredData,
  resolveStoneEntryArrays,
  sumStoneWeights,
  updateStoneEntryAtIndex,
} from '@/utils/stoneSequenceUtils';

interface ReviewScannedResultsModalProps {
  scanData: ScanItemData;
  structuredData: StructuredScanData;
  jewelleryType: 'Gold' | 'Diamond';
  onFieldChange: (field: keyof ScanItemData, value: string) => void;
  onStoneEntriesChange: (diamonds: StoneEntry[], colorstones: StoneEntry[]) => void;
  onLaborChange: (values: Partial<ScanItemData>) => void;
  onReScan: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

export function ReviewScannedResultsModal({
  scanData,
  structuredData,
  jewelleryType,
  onFieldChange,
  onStoneEntriesChange,
  onLaborChange,
  onReScan,
  onConfirm,
  confirming = false,
}: ReviewScannedResultsModalProps) {
  const activeFormula = useFormulaStore((s) => s.activeFormula);
  const formula2Rules = useFormulaStore((s) => s.formula2Rules);

  const parsedStones = useMemo(
    () => parseStoneArraysFromStructuredData(structuredData, scanData),
    [structuredData, scanData],
  );

  const [diamondEntries, setDiamondEntries] = useState<StoneEntry[]>(parsedStones.diamonds);
  const [colorstoneEntries, setColorstoneEntries] = useState<StoneEntry[]>(
    parsedStones.colorstones,
  );
  const [rateErrors, setRateErrors] = useState<Record<number, boolean>>({});
  const [showLabourValidation, setShowLabourValidation] = useState(false);
  const [karatDropdownMode, setKaratDropdownMode] = useState(false);
  const [useNetWtFormula, setUseNetWtFormula] = useState(false);

  const stoneDataKey = `${structuredData.diamonds ?? ''}|${structuredData.colorstones ?? ''}`;

  useEffect(() => {
    const parsed = parseStoneArraysFromStructuredData(structuredData, scanData);
    const resolved = resolveStoneEntryArrays(
      parsed.diamonds,
      parsed.colorstones,
      jewelleryType,
    );
    setDiamondEntries(resolved.diamonds);
    setColorstoneEntries(resolved.colorstones);
    setRateErrors({});
  }, [stoneDataKey, jewelleryType, structuredData, scanData]);

  const hasRateError = Object.values(rateErrors).some(Boolean);
  const labourError = validateLabour(scanData);
  const canConfirm = Boolean(scanData.grossWt.trim()) && !hasRateError;

  useEffect(() => {
    if (activeFormula !== 'F2') {
      setKaratDropdownMode(false);
      return;
    }

    const scannedKarat = resolveScannedKarat(scanData.karat, scanData.tunch);
    const { karat, requiresDropdown } = applyFormula2KaratConstraint(scannedKarat, formula2Rules);
    setKaratDropdownMode(requiresDropdown);

    if (requiresDropdown) {
      if (scanData.karat) {
        onFieldChange('karat', '');
      }
      return;
    }

    if (karat && karat !== scanData.karat) {
      onFieldChange('karat', karat);
    }
  }, [activeFormula, formula2Rules, scanData.karat, scanData.tunch, onFieldChange]);

  useEffect(() => {
    if (!useNetWtFormula) return;
    const computed = computeNetWeightFallback(
      scanData.grossWt,
      sumStoneWeights(diamondEntries),
      sumStoneWeights(colorstoneEntries),
    );
    if (computed !== scanData.netWt) {
      onFieldChange('netWt', computed);
    }
  }, [
    useNetWtFormula,
    scanData.grossWt,
    diamondEntries,
    colorstoneEntries,
    scanData.netWt,
    onFieldChange,
  ]);

  const handleStoneEntryChange = useCallback(
    (stoneType: 'diamond' | 'colorstone', sourceIndex: number, values: Partial<StoneEntry>) => {
      if (stoneType === 'diamond') {
        const nextDiamonds = updateStoneEntryAtIndex(diamondEntries, sourceIndex, values);
        setDiamondEntries(nextDiamonds);
        onStoneEntriesChange(nextDiamonds, colorstoneEntries);
        return;
      }

      const nextColorstones = updateStoneEntryAtIndex(colorstoneEntries, sourceIndex, values);
      setColorstoneEntries(nextColorstones);
      onStoneEntriesChange(diamondEntries, nextColorstones);
    },
    [colorstoneEntries, diamondEntries, onStoneEntriesChange],
  );

  const handleStoneRateErrorChange = useCallback((sequenceIndex: number, hasError: boolean) => {
    setRateErrors((prev) => {
      if (prev[sequenceIndex] === hasError) return prev;
      return { ...prev, [sequenceIndex]: hasError };
    });
  }, []);

  const handleNetWtFormulaToggle = () => {
    const next = !useNetWtFormula;
    setUseNetWtFormula(next);
    if (!next) {
      onFieldChange('netWt', '');
    }
  };

  const handleConfirm = () => {
    if (labourError) {
      setShowLabourValidation(true);
      return;
    }
    onConfirm();
  };

  const requiresKaratSelection =
    activeFormula === 'F2' &&
    (karatDropdownMode || !isKaratWhitelisted(scanData.karat, formula2Rules));

  return (
    <View className="rounded-[20px] bg-white px-screen py-5 shadow-lg">
      <Text className="mb-4 text-lg font-bold text-text-primary">
        Scanner Result | Final Tab
      </Text>

      <Pressable
        onPress={handleNetWtFormulaToggle}
        className="mb-4 flex-row items-start gap-2.5 rounded-input border border-border bg-surface-muted px-3 py-3"
      >
        <View
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
            useNetWtFormula ? 'border-primary bg-primary' : 'border-border bg-white'
          }`}
        >
          {useNetWtFormula ? <Check size={12} color="#FFFFFF" /> : null}
        </View>
        <Text className="flex-1 text-xs leading-5 text-text-secondary">
          Use Net Wt = gross wt - 0.2 x (dia wt + colorstone wt)
        </Text>
      </Pressable>

      {requiresKaratSelection && !scanData.karat ? (
        <Text className="mb-3 text-xs text-danger-text">
          Select a karat from Tunch Purity before confirming.
        </Text>
      ) : null}

      <ScannerFinalTab
        scanData={scanData}
        structuredData={structuredData}
        diamonds={diamondEntries}
        colorstones={colorstoneEntries}
        jewelleryType={jewelleryType}
        editable
        onFieldChange={onFieldChange}
        onStoneEntryChange={handleStoneEntryChange}
        onLaborChange={onLaborChange}
        onRateErrorChange={handleStoneRateErrorChange}
        showLabourValidation={showLabourValidation || Boolean(labourError)}
      />

      <View className="mt-2 flex-row gap-3">
        <Pressable
          onPress={onReScan}
          className="flex-1 items-center rounded-button border border-border bg-white py-3.5 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-text-secondary">ReScan</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={confirming || !canConfirm || (requiresKaratSelection && !scanData.karat)}
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
        <Text className="mt-3 text-center text-xs leading-5 text-danger-text">
          Resolve rate errors before saving.
        </Text>
      ) : null}

      <Text className="mt-4 text-center text-xs leading-5 text-text-secondary">
        <Text className="text-danger-text">*</Text> Scanner couldn&apos;t scan or find specific value.
        Manually enter the value or ReScan.
      </Text>
    </View>
  );
}
