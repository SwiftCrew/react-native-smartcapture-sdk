import { type Permission, type PermissionStatus as RNPStatus } from 'react-native-permissions';
import type { PermissionStatus } from './types';
/**
 * Map react-native-permissions native statuses to our public 4-state enum.
 * iOS "limited" (e.g. limited photo library access) is treated as `granted`
 * because the user *has* granted access — just to a subset.
 */
export declare function mapStatus(status: RNPStatus): PermissionStatus;
/**
 * Resolve the platform-specific camera permission constant.
 */
export declare function getCameraPermission(): Permission | null;
/**
 * Resolve the platform-specific gallery / photo-library permission.
 *
 * - iOS:    PHOTO_LIBRARY (read+write) — limited access surfaces as `granted`
 * - Android 33+ (API 33, Tiramisu): READ_MEDIA_IMAGES (scoped storage)
 * - Android 32 and below: READ_EXTERNAL_STORAGE
 */
export declare function getGalleryPermission(): Permission | null;
//# sourceMappingURL=mappers.d.ts.map