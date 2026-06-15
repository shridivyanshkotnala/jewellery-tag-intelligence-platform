import { useState } from 'react';
import { Alert, ImageBackground, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { JewelleryTypeModal } from '@/components/scanner/JewelleryTypeModal';
import { ScreenBackHeader } from '@/components/scanner/ScreenBackHeader';
import { useScannerStore } from '@/store/scannerStore';
import type { JewelleryType } from '@/types/scanner';
import { ApiError } from '@/utils/apiClient';
import { createScan } from '@/utils/scanApi';
import { structuredDataToScanItem } from '@/utils/scanMappers';

const SCANNER_BG =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';

export default function JewelleryTypeScreen() {
  const router = useRouter();
  const scanMode = useScannerStore((s) => s.scanMode);
  const setSelectedType = useScannerStore((s) => s.setSelectedType);
  const setScanId = useScannerStore((s) => s.setScanId);
  const setScanSide = useScannerStore((s) => s.setScanSide);
  const setFrontImageUri = useScannerStore((s) => s.setFrontImageUri);
  const setBackImageUri = useScannerStore((s) => s.setBackImageUri);
  const setStructuredData = useScannerStore((s) => s.setStructuredData);
  const updateScanData = useScannerStore((s) => s.updateScanData);
  const [loading, setLoading] = useState(false);

  const handleStartScan = async (type: JewelleryType) => {
    setSelectedType(type);
    setScanSide('front');
    setFrontImageUri(null);
    setBackImageUri(null);
    setStructuredData({});
    updateScanData(structuredDataToScanItem({}));
    setLoading(true);

    try {
      const session = await createScan(type, scanMode);
      setScanId(session.scanId);
      router.push('/dashboard/scanner/barcode' as Href);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to start scan. Please try again.';
      Alert.alert('Scan Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader onBack={() => router.back()} />
      </SafeAreaView>

      <ImageBackground source={{ uri: SCANNER_BG }} className="flex-1" resizeMode="cover">
        <View className="absolute inset-0 bg-black/50" />
        <View className="flex-1 items-center justify-center px-6 pb-28">
          <View className="w-full">
            <JewelleryTypeModal onStartScan={handleStartScan} loading={loading} />
          </View>
        </View>
      </ImageBackground>

      <BottomNav activeRoute="scanner" scanButtonVariant="gold" />
    </View>
  );
}
