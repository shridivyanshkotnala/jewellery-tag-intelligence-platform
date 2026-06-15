import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export const MOCK_SCAN_IMAGE_URI = 'mock://local-scan-image';

export async function prepareImageForUpload(uri: string): Promise<string> {
  if (uri.startsWith('mock://') || uri.startsWith('file://')) {
    return uri;
  }

  const extension = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const destination = `${FileSystem.cacheDirectory}scan-${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

async function ensureMediaLibraryPermission(): Promise<boolean> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.granted) {
    return true;
  }

  Alert.alert(
    'Photo Access Required',
    'Please allow access to your photos to upload a jewellery tag image.',
  );
  return false;
}

async function ensureCameraPermission(): Promise<boolean> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (permission.granted) {
    return true;
  }

  Alert.alert(
    'Camera Access Required',
    'Please allow camera access to scan jewellery tags, or upload a photo from your device.',
  );
  return false;
}

export async function pickImageFromGallery(): Promise<string | null> {
  const allowed = await ensureMediaLibraryPermission();
  if (!allowed) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/** Opens the device camera via image picker (fallback when live preview is unavailable). */
export async function captureWithDeviceCamera(): Promise<string | null> {
  const allowed = await ensureCameraPermission();
  if (!allowed) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}

/** Fallback capture for web or when the live camera preview is not ready. */
export async function captureScanImageFallback(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return pickImageFromGallery();
  }

  try {
    return await captureWithDeviceCamera();
  } catch {
    return pickImageFromGallery();
  }
}
