import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useScannerStore } from '@/store/scannerStore';
import type { JewelleryType } from '@/types/scanner';

const SCAN_JEWELLERY_TYPES: JewelleryType[] = ['Gold', 'Diamond'];

interface JewelleryTypeModalProps {
  onStartScan: (type: JewelleryType) => void;
  loading?: boolean;
}

export function JewelleryTypeModal({ onStartScan, loading = false }: JewelleryTypeModalProps) {
  const selectedType = useScannerStore((s) => s.selectedType);
  const setSelectedType = useScannerStore((s) => s.setSelectedType);

  return (
    <View className="rounded-[20px] bg-white px-6 py-7 shadow-lg">
      <Text className="text-lg font-bold text-text-primary">Select Jewellery Type</Text>
      <Text className="mt-2 text-sm leading-5 text-text-secondary">
        Please select Jewellery type which will be scanned.
      </Text>

      <View className="mt-6 flex-row gap-2">
        {SCAN_JEWELLERY_TYPES.map((type) => {
          const isActive = selectedType === type;
          return (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              disabled={loading}
              className={`flex-1 items-center rounded-button border py-3 active:opacity-80 ${
                isActive ? 'border-primary bg-primary' : 'border-border bg-white'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => onStartScan(selectedType)}
        disabled={loading}
        className="mt-6 items-center rounded-button bg-primary py-3.5 active:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-sm font-semibold text-white">Start Scan</Text>
        )}
      </Pressable>
    </View>
  );
}
