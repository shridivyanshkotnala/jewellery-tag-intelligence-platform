import { ActivityIndicator, Image, Text, View } from 'react-native';
import { Camera, ImageUp } from 'lucide-react-native';

import { OutlineButton } from '@/components/scanner/OutlineButton';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import type { ScanSide } from '@/types/scanner';

import type { CaptureSource } from './CapturedSidesStrip';

interface CapturePreviewOverlayProps {
  visible: boolean;
  loading?: boolean;
  uri?: string | null;
  side: ScanSide;
  source: CaptureSource;
  onRetake: () => void;
  onConfirm: () => void;
}

function sideLabel(side: ScanSide): string {
  return side === 'front' ? 'Front Side' : 'Back Side';
}

function sourceTitle(source: CaptureSource, loading?: boolean): string {
  if (loading) {
    return 'Uploading from device...';
  }
  return source === 'gallery' ? 'Uploaded from Device' : 'Scanned with Camera';
}

export function CapturePreviewOverlay({
  visible,
  loading = false,
  uri,
  side,
  source,
  onRetake,
  onConfirm,
}: CapturePreviewOverlayProps) {
  if (!visible) {
    return null;
  }

  const SourceIcon = source === 'gallery' ? ImageUp : Camera;

  return (
    <View className="absolute inset-0 z-50 bg-black/85 px-5 pt-6">
      <View className="rounded-[20px] bg-white px-5 py-6 shadow-lg">
        <View className="mb-4 flex-row items-center gap-2">
          <View className="rounded-full bg-primary/10 p-2">
            {loading ? (
              <ActivityIndicator size="small" color="#1E2F28" />
            ) : (
              <SourceIcon size={18} color="#1E2F28" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-text-primary">{sideLabel(side)}</Text>
            <Text className="text-sm text-text-secondary">{sourceTitle(source, loading)}</Text>
          </View>
        </View>

        {loading ? (
          <View className="mb-5 h-56 items-center justify-center rounded-xl bg-black/5">
            <ActivityIndicator size="large" color="#1E2F28" />
            <Text className="mt-3 text-sm text-text-secondary">Please wait while image is loading...</Text>
          </View>
        ) : uri ? (
          <Image source={{ uri }} className="mb-5 h-56 w-full rounded-xl" resizeMode="contain" />
        ) : null}

        {!loading && uri ? (
          <Text className="mb-5 text-center text-sm text-text-secondary">
            Check the image is clear and readable. Tap OK to continue or Retake to capture again.
          </Text>
        ) : null}

        <View className="flex-row gap-3">
          <OutlineButton title={loading ? 'Cancel' : 'Retake'} onPress={onRetake} />
          {!loading && uri ? <PrimaryGreenButton title="OK" onPress={onConfirm} /> : null}
        </View>
      </View>
    </View>
  );
}
