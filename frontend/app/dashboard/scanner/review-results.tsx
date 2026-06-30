import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { ItemSelectedBadge } from '@/components/scanner/ItemSelectedBadge';
import { ReviewScannedResultsModal } from '@/components/scanner/ReviewScannedResultsModal';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { MOCK_REVIEW_RESULTS } from '@/constants/scannerData';
import { isDemoScanMode } from '@/constants/scanMode';
import { useFormulaStore } from '@/store/formulaStore';
import { useScannerStore } from '@/store/scannerStore';
import type { ScanItemData, StoneEntry } from '@/types/scanner';
import { ApiError } from '@/utils/apiClient';
import { syncFormulaStoreFromApi } from '@/utils/formulaSettingsApi';
import {
  applyFormula2KaratConstraint,
  resolveScannedKarat,
} from '@/utils/formulaUtils';
import { getReview, submitReview } from '@/utils/scanApi';
import { scanItemToStructuredData, structuredDataToScanItem } from '@/utils/scanMappers';
import {
  applyStoneEntriesToScanData,
  stoneEntriesToStructuredData,
} from '@/utils/stoneSequenceUtils';
import { validateLabour } from '@/utils/labourUtils';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

function applyClientFormulaRules(data: ScanItemData): ScanItemData {
  const { activeFormula, formula2Rules } = useFormulaStore.getState();
  const withKarat = {
    ...data,
    karat: data.karat || resolveScannedKarat(data.karat, data.tunch),
  };

  if (activeFormula !== 'F2') {
    return withKarat;
  }

  const scannedKarat = resolveScannedKarat(withKarat.karat, withKarat.tunch);
  const { karat, requiresDropdown } = applyFormula2KaratConstraint(
    scannedKarat,
    formula2Rules,
  );

  return {
    ...withKarat,
    karat: requiresDropdown ? '' : karat,
  };
}

export default function ReviewResultsScreen() {
  const router = useRouter();
  const scanId = useScannerStore((s) => s.scanId);
  const scanData = useScannerStore((s) => s.scanData);
  const selectedType = useScannerStore((s) => s.selectedType);
  const structuredData = useScannerStore((s) => s.structuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReview = useCallback(async () => {
    if (!scanId) {
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    setLoading(true);
    try {
      if (!isDemoScanMode()) {
        try {
          await syncFormulaStoreFromApi();
        } catch {
          // Keep existing store values when formula settings cannot be loaded.
        }
      }

      const data = await getReview(scanId);
      setStructuredData(data.structuredData);
      updateScanData(applyClientFormulaRules(structuredDataToScanItem(data.structuredData)));
    } catch (error) {
      const existing = useScannerStore.getState().structuredData;
      if (Object.keys(existing).length > 0) {
        updateScanData(applyClientFormulaRules(structuredDataToScanItem(existing)));
        return;
      }
      if (isDemoScanMode()) {
        const base = useScannerStore.getState().scanData;
        updateScanData(
          applyClientFormulaRules({
            ...base,
            grossWt: MOCK_REVIEW_RESULTS.grossWt || '42.500',
            netWt: MOCK_REVIEW_RESULTS.netWt,
            tunch: MOCK_REVIEW_RESULTS.tunch,
            karat: resolveScannedKarat('', MOCK_REVIEW_RESULTS.tunch),
            diamondWeight: MOCK_REVIEW_RESULTS.diamondWeight,
            diamondColor: MOCK_REVIEW_RESULTS.diamondColor,
            diamondClarity: MOCK_REVIEW_RESULTS.diamondClarity,
            diamondPieces: MOCK_REVIEW_RESULTS.diamondPieces,
            diamondRate: MOCK_REVIEW_RESULTS.diamondRate,
            diamondQuality: MOCK_REVIEW_RESULTS.diamondQuality,
            colorstoneWeight: MOCK_REVIEW_RESULTS.colorstoneWeight,
            colorstoneColor: MOCK_REVIEW_RESULTS.colorstoneColor,
            colorstoneClarity: MOCK_REVIEW_RESULTS.colorstoneClarity,
            colorstoneQuality: MOCK_REVIEW_RESULTS.colorstoneQuality,
            colorstoneRate: MOCK_REVIEW_RESULTS.colorstoneRate,
            labourPurityPercent: MOCK_REVIEW_RESULTS.labourPurityPercent,
            labourChargeAmount: MOCK_REVIEW_RESULTS.labourChargeAmount,
            labourChargeUnit: MOCK_REVIEW_RESULTS.labourChargeUnit,
          }),
        );
        return;
      }
      const message =
        error instanceof ApiError ? error.message : 'Failed to load review data. Please try again.';
      Alert.alert('Review Error', message, [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [scanId, router, setStructuredData, updateScanData]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const handleFieldChange = useCallback((field: keyof ScanItemData, value: string) => {
    const updated = { ...useScannerStore.getState().scanData, [field]: value };
    updateScanData({ [field]: value });
    setStructuredData(
      scanItemToStructuredData(updated, useScannerStore.getState().structuredData),
    );
  }, [updateScanData, setStructuredData]);

  const handleStoneEntriesChange = useCallback(
    (diamonds: StoneEntry[], colorstones: StoneEntry[]) => {
      const currentScanData = useScannerStore.getState().scanData;
      const currentStructuredData = useScannerStore.getState().structuredData;
      const stoneFields = applyStoneEntriesToScanData(currentScanData, diamonds, colorstones);
      const updatedScanData = { ...currentScanData, ...stoneFields };
      const nextStructuredData = stoneEntriesToStructuredData(
        currentStructuredData,
        diamonds,
        colorstones,
      );
      updateScanData(stoneFields);
      setStructuredData(scanItemToStructuredData(updatedScanData, nextStructuredData));
    },
    [setStructuredData, updateScanData],
  );

  const handleLaborChange = useCallback((values: Partial<ScanItemData>) => {
    const updated = { ...useScannerStore.getState().scanData, ...values };
    updateScanData(values);
    setStructuredData(
      scanItemToStructuredData(updated, useScannerStore.getState().structuredData),
    );
  }, [updateScanData, setStructuredData]);

  const handleReScan = () => {
    setScanSide('front');
    router.push('/dashboard/scanner/barcode' as Href);
  };

  const handleConfirm = async () => {
    if (!scanId) return;
    if (validateLabour(scanData)) return;

    const payload = scanItemToStructuredData(scanData, structuredData);
    setSubmitting(true);
    try {
      await submitReview(scanId, payload);
      router.push('/dashboard/scanner/scan-results' as Href);
    } catch (error) {
      if (isDemoScanMode()) {
        router.push('/dashboard/scanner/scan-results' as Href);
        return;
      }
      const message =
        error instanceof ApiError ? error.message : 'Failed to approve scan. Please try again.';
      Alert.alert('Approval Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/50" />
        <SafeAreaView className="flex-1" edges={['top']}>
          <ScreenBackHeader iconColor="#9E9E9E" onBack={() => router.back()} />
          <View className="mt-3">
            <ItemSelectedBadge />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow items-center justify-center px-screen pb-28 pt-2"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#D4C19C" />
            ) : (
              <View className="w-full">
                <ReviewScannedResultsModal
                  scanData={scanData}
                  structuredData={structuredData}
                  jewelleryType={selectedType}
                  onFieldChange={handleFieldChange}
                  onStoneEntriesChange={handleStoneEntriesChange}
                  onLaborChange={handleLaborChange}
                  onReScan={handleReScan}
                  onConfirm={handleConfirm}
                  confirming={submitting}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>

        {(loading || submitting) ? (
          <View className="absolute inset-0 z-50 flex-1 items-center justify-center bg-black/70">
            <ActivityIndicator size="large" color="#D4C19C" />
            <Text className="mt-4 text-lg font-bold text-white">
              {loading ? 'Loading Results...' : 'Processing...'}
            </Text>
          </View>
        ) : null}
      </ImageBackground>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
