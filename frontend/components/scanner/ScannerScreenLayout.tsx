import { type RefObject } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemSelectedBadge } from './ItemSelectedBadge';
import { ScannerBottomSheet } from './ScannerBottomSheet';
import { ScreenBackHeader } from './ScreenBackHeader';
import { TagCameraPreview, type TagCameraPreviewRef } from './TagCameraPreview';

const { width, height } = Dimensions.get('window');

interface ScannerScreenLayoutProps {
  children: React.ReactNode;
  instruction: string;
  onShutterPress: () => void;
  onUploadPress?: () => void;
  uploadDisabled?: boolean;
  cameraRef?: RefObject<TagCameraPreviewRef | null>;
  headerContent?: React.ReactNode;
  controlsHidden?: boolean;
}

export function ScannerScreenLayout({
  children,
  instruction,
  onShutterPress,
  onUploadPress,
  uploadDisabled = false,
  cameraRef,
  headerContent,
  controlsHidden = false,
}: ScannerScreenLayoutProps) {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="bg-white" edges={['top']}>
        <ScreenBackHeader />
      </SafeAreaView>

      <View className="flex-1 overflow-hidden bg-black">
        <TagCameraPreview ref={cameraRef} />
        <View className="absolute inset-0 bg-black/20" />
        <View className="mt-4">
          <ItemSelectedBadge />
          {headerContent}
        </View>

        <Pressable className="flex-1 items-center justify-center" onPress={onShutterPress}>
          {children}
        </Pressable>
      </View>

      <ScannerBottomSheet
        instruction={instruction}
        onShutterPress={onShutterPress}
        onUploadPress={onUploadPress}
        uploadDisabled={uploadDisabled || controlsHidden}
        hidden={controlsHidden}
      />
    </View>
  );
}

export const SCANNER_FRAME_WIDTH = width * 0.82;
export const SCANNER_FRAME_HEIGHT = height * 0.28;
