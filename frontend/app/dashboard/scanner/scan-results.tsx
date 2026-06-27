import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Heart } from 'lucide-react-native';

import { OutlineButton } from '@/components/scanner/OutlineButton';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { ScannerFinalTab } from '@/components/scanner/ScannerFinalTab';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { MOCK_SCAN_RESULT } from '@/constants/scannerData';
import { isDemoScanMode } from '@/constants/scanMode';
import { useScannerStore } from '@/store/scannerStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { buildWishlistItem, computeWishlistPricing } from '@/utils/wishlistUtils';
import { parseStoneArraysFromStructuredData } from '@/utils/stoneSequenceUtils';

export default function ScanResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fromWishlist?: string; wishlistId?: string }>();
  const scanData = useScannerStore((s) => s.scanData);
  const selectedType = useScannerStore((s) => s.selectedType);
  const structuredData = useScannerStore((s) => s.structuredData);
  const addWishlistItem = useWishlistStore((s) => s.addItem);
  const getWishlistItem = useWishlistStore((s) => s.getItemById);
  const demoResult = isDemoScanMode() ? MOCK_SCAN_RESULT : null;

  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const wishlistItem = params.wishlistId ? getWishlistItem(String(params.wishlistId)) : undefined;
  const isFromWishlist = params.fromWishlist === '1' && Boolean(wishlistItem);

  const activeScanData = isFromWishlist ? wishlistItem!.snapshot.scanData : scanData;
  const activeStructuredData = isFromWishlist
    ? wishlistItem!.snapshot.structuredData
    : structuredData;
  const activeSelectedType = isFromWishlist
    ? wishlistItem!.snapshot.selectedType
    : selectedType;

  const { diamonds, colorstones } = useMemo(() => {
    if (isFromWishlist && wishlistItem) {
      return {
        diamonds: wishlistItem.snapshot.diamonds,
        colorstones: wishlistItem.snapshot.colorstones,
      };
    }
    return parseStoneArraysFromStructuredData(structuredData, scanData);
  }, [isFromWishlist, wishlistItem, structuredData, scanData]);

  const handleAddToWishlist = async () => {
    if (addingToWishlist) return;
    setAddingToWishlist(true);
    try {
      const pricing = computeWishlistPricing(scanData, structuredData, selectedType);
      const scanTimestamp = new Date().toISOString();
      const item = buildWishlistItem({
        scanData,
        structuredData,
        selectedType,
        diamonds,
        colorstones,
        pricing,
        scanTimestamp,
      });
      await addWishlistItem(item);
      Alert.alert('Wishlist', 'Item added to your wishlist.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <ScanScreenWrapper
      title="Scanner Result | Final Tab"
      className="bg-surface-muted"
      scanButtonVariant="green"
      onBack={isFromWishlist ? () => router.push('/dashboard/wishlist' as Href) : undefined}
      footer={
        <View className="flex-row gap-3">
          {!isFromWishlist ? (
            <OutlineButton
              title={addingToWishlist ? 'Adding...' : 'Add to Wishlist'}
              onPress={handleAddToWishlist}
              icon={
                addingToWishlist
                  ? <ActivityIndicator size={16} color="#1A332E" />
                  : <Heart size={18} color="#1A332E" />
              }
            />
          ) : null}
          <PrimaryGreenButton
            title="Generate Invoice"
            onPress={() => router.push('/dashboard/scanner/invoice-preview')}
          />
        </View>
      }
    >
      <BackgroundPattern />

      <ScannerFinalTab
        scanData={activeScanData}
        structuredData={activeStructuredData}
        diamonds={diamonds}
        colorstones={colorstones}
        jewelleryType={activeSelectedType}
        editable={false}
        gstNote={demoResult?.gstNote ?? 'MRP = Gold + Stones + Labour'}
      />
    </ScanScreenWrapper>
  );
}

