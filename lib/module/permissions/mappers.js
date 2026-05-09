import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
/**
 * Map react-native-permissions native statuses to our public 4-state enum.
 * iOS "limited" (e.g. limited photo library access) is treated as `granted`
 * because the user *has* granted access — just to a subset.
 */
export function mapStatus(status) {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
    default:
      return 'unavailable';
  }
}

/**
 * Resolve the platform-specific camera permission constant.
 */
export function getCameraPermission() {
  if (Platform.OS === 'ios') return PERMISSIONS.IOS.CAMERA;
  if (Platform.OS === 'android') return PERMISSIONS.ANDROID.CAMERA;
  return null;
}

/**
 * Resolve the platform-specific gallery / photo-library permission.
 *
 * - iOS:    PHOTO_LIBRARY (read+write) — limited access surfaces as `granted`
 * - Android 33+ (API 33, Tiramisu): READ_MEDIA_IMAGES (scoped storage)
 * - Android 32 and below: READ_EXTERNAL_STORAGE
 */
export function getGalleryPermission() {
  if (Platform.OS === 'ios') return PERMISSIONS.IOS.PHOTO_LIBRARY;
  if (Platform.OS === 'android') {
    const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
    if (apiLevel >= 33) {
      return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
    }
    return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  }
  return null;
}
//# sourceMappingURL=mappers.js.map