import type { PermissionResult, PermissionStatus } from './types';
export type { PermissionStatus, PermissionResult } from './types';
/**
 * Returns the *current* status of the camera permission without prompting
 * the user. Safe to call from JS at any point (e.g. on screen mount).
 */
export declare function checkCameraPermission(): Promise<PermissionStatus>;
/**
 * Requests the camera permission. If the user has previously selected
 * "Don't ask again" / blocked the permission, the OS will not show a
 * prompt and `'blocked'` is returned — the parent app should then
 * deep-link to settings via {@link openSettings}.
 */
export declare function requestCameraPermission(): Promise<PermissionStatus>;
/**
 * Returns the *current* status of the gallery / photo-library permission
 * without prompting the user.
 *
 * - iOS *limited* photo access surfaces as `'granted'`.
 * - Android <33 uses `READ_EXTERNAL_STORAGE`.
 * - Android  33+ uses `READ_MEDIA_IMAGES`.
 */
export declare function checkGalleryPermission(): Promise<PermissionStatus>;
/** Requests the gallery / photo-library permission. */
export declare function requestGalleryPermission(): Promise<PermissionStatus>;
/**
 * Convenience helper that:
 *  1. Checks both camera & gallery permissions in **parallel**.
 *  2. Sequentially requests any that are still in `'denied'` state
 *     (first-time prompt) — sequential so the OS dialogs don't stack.
 *  3. Returns the final per-permission status plus a global
 *     `allGranted` flag.
 *
 * It will NOT re-prompt for `'blocked'` or `'unavailable'` permissions —
 * the parent app should surface a "Open Settings" CTA in those cases.
 */
export declare function ensureAllPermissions(): Promise<PermissionResult>;
/**
 * Deep-link to the OS settings page for this app so users can manually
 * grant a permission that is currently `'blocked'`.
 *
 * Resolves silently if the user cancels — call sites should always
 * follow up by re-checking permissions when the app returns to the
 * foreground.
 */
export declare function openSettings(): Promise<void>;
//# sourceMappingURL=index.d.ts.map