import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { Camera, ImageUp } from 'lucide-react-native';

import type { ScanMode } from '@/types/scanner';

import type { CaptureSource } from './CapturedSidesStrip';

interface SideSummary {
  uri: string;
  source: CaptureSource;
}

interface CaptureSummaryOverlayProps {
  visible: boolean;
  scanMode: ScanMode;
  front: SideSummary;
  back?: SideSummary | null;
  submitting?: boolean;
  onEditFront: () => void;
  onEditBack?: () => void;
  onContinue: () => void;
}

function sourceLabel(source: CaptureSource): string {
  return source === 'gallery' ? 'Uploaded from device' : 'Scanned with camera';
}

function SummaryCard({
  label,
  capture,
  onEdit,
}: {
  label: string;
  capture: SideSummary;
  onEdit?: () => void;
}) {
  const Icon = capture.source === 'gallery' ? ImageUp : Camera;

  return (
    <View className="flex-1 rounded-xl border border-border bg-white p-3">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-text-primary">{label}</Text>
        {onEdit ? (
          <Pressable onPress={onEdit}>
            <Text className="text-xs font-medium text-primary">Change</Text>
          </Pressable>
        ) : null}
      </View>
      <Image source={{ uri: capture.uri }} className="mb-2 h-28 w-full rounded-lg" resizeMode="cover" />
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color="#1E2F28" />
        <Text className="text-xs text-text-secondary">{sourceLabel(capture.source)}</Text>
      </View>
    </View>
  );
}

export function CaptureSummaryOverlay({
  visible,
  scanMode,
  front,
  back,
  submitting = false,
  onEditFront,
  onEditBack,
  onContinue,
}: CaptureSummaryOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 bg-black/85 px-5 pt-6">
      <View className="rounded-[20px] bg-white px-5 py-6 shadow-lg">
        <Text className="text-lg font-bold text-text-primary">Review Captured Images</Text>
        <Text className="mt-2 mb-4 text-sm text-text-secondary">
          {scanMode === 'both'
            ? 'Front and back sides are ready. Continue when everything looks correct.'
            : 'Your tag image is ready. Continue when everything looks correct.'}
        </Text>

        <View className="mb-5 flex-row gap-3">
          <SummaryCard label="Front Side" capture={front} onEdit={onEditFront} />
          {scanMode === 'both' && back ? (
            <SummaryCard label="Back Side" capture={back} onEdit={onEditBack} />
          ) : null}
        </View>

        <Pressable
          onPress={onContinue}
          disabled={submitting}
          className="items-center rounded-button bg-primary py-3.5 active:opacity-90 disabled:opacity-60"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-semibold text-white">Continue to Processing</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
