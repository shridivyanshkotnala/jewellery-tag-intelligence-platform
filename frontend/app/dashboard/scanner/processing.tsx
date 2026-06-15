import { useCallback, useEffect, useState } from 'react';
import { ImageBackground, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProcessingStateView } from '@/components/scanner/ProcessingStateView';
import { isDemoScanMode } from '@/constants/scanMode';
import { useScannerStore } from '@/store/scannerStore';
import type { OcrProcessingState } from '@/types/scanner';
import { ApiError } from '@/utils/apiClient';
import { getDemoClarificationFields } from '@/utils/mockScanApi';
import { analyzeScan } from '@/utils/scanApi';
import { structuredDataToScanItem } from '@/utils/scanMappers';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

export default function ProcessingScreen() {
  const router = useRouter();
  const scanId = useScannerStore((s) => s.scanId);
  const selectedType = useScannerStore((s) => s.selectedType);
  const setUnknownFields = useScannerStore((s) => s.setUnknownFields);
  const setClarificationFields = useScannerStore((s) => s.setClarificationFields);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);
  const [state, setState] = useState<OcrProcessingState>('processing');
  const [errorMessage, setErrorMessage] = useState<string>();

  const runAnalysis = useCallback(async () => {
    if (!scanId) {
      router.replace('/dashboard/scanner/jewellery-type' as Href);
      return;
    }

    setState('processing');
    setErrorMessage(undefined);

    try {
      const result = await analyzeScan(scanId);

      if (result.structuredData) {
        setStructuredData(result.structuredData);
        updateScanData(structuredDataToScanItem(result.structuredData));
      }

      if (result.unknownFields?.length > 0) {
        setUnknownFields(result.unknownFields);
        router.replace('/dashboard/scanner/undetected-abbreviation' as Href);
        return;
      }

      setState('success');
      setTimeout(() => {
        router.replace('/dashboard/scanner/review-results' as Href);
      }, 600);
    } catch (error) {
      if (isDemoScanMode()) {
        const demoFields = getDemoClarificationFields(selectedType);
        setClarificationFields(demoFields);
        setUnknownFields(
          demoFields.map((f) => ({
            abbreviation: f.abbreviation,
            detectedValue: f.detectedValue,
          })),
        );
        router.replace('/dashboard/scanner/undetected-abbreviation' as Href);
        return;
      }
      setState('error');
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Analysis failed. Please try again.',
      );
    }
  }, [scanId, router, selectedType, setUnknownFields, setClarificationFields, setStructuredData, updateScanData]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return (
    <View className="flex-1 bg-black">
      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/60" />
        <SafeAreaView className="flex-1 items-center justify-center">
          <ProcessingStateView state={state} errorMessage={errorMessage} />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
