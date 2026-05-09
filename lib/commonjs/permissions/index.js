"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkCameraPermission = checkCameraPermission;
exports.checkGalleryPermission = checkGalleryPermission;
exports.ensureAllPermissions = ensureAllPermissions;
exports.openSettings = openSettings;
exports.requestCameraPermission = requestCameraPermission;
exports.requestGalleryPermission = requestGalleryPermission;
var _reactNativePermissions = require("react-native-permissions");
var _mappers = require("./mappers");
/* -------------------------------------------------------------------------- */
/*                              Camera                                        */
/* -------------------------------------------------------------------------- */

/**
 * Returns the *current* status of the camera permission without prompting
 * the user. Safe to call from JS at any point (e.g. on screen mount).
 */
async function checkCameraPermission() {
  const perm = (0, _mappers.getCameraPermission)();
  if (!perm) return 'unavailable';
  return (0, _mappers.mapStatus)(await (0, _reactNativePermissions.check)(perm));
}

/**
 * Requests the camera permission. If the user has previously selected
 * "Don't ask again" / blocked the permission, the OS will not show a
 * prompt and `'blocked'` is returned — the parent app should then
 * deep-link to settings via {@link openSettings}.
 */
async function requestCameraPermission() {
  const perm = (0, _mappers.getCameraPermission)();
  if (!perm) return 'unavailable';
  return (0, _mappers.mapStatus)(await (0, _reactNativePermissions.request)(perm));
}

/* -------------------------------------------------------------------------- */
/*                              Gallery                                       */
/* -------------------------------------------------------------------------- */

/**
 * Returns the *current* status of the gallery / photo-library permission
 * without prompting the user.
 *
 * - iOS *limited* photo access surfaces as `'granted'`.
 * - Android <33 uses `READ_EXTERNAL_STORAGE`.
 * - Android  33+ uses `READ_MEDIA_IMAGES`.
 */
async function checkGalleryPermission() {
  const perm = (0, _mappers.getGalleryPermission)();
  if (!perm) return 'unavailable';
  return (0, _mappers.mapStatus)(await (0, _reactNativePermissions.check)(perm));
}

/** Requests the gallery / photo-library permission. */
async function requestGalleryPermission() {
  const perm = (0, _mappers.getGalleryPermission)();
  if (!perm) return 'unavailable';
  return (0, _mappers.mapStatus)(await (0, _reactNativePermissions.request)(perm));
}

/* -------------------------------------------------------------------------- */
/*                             Combined helper                                */
/* -------------------------------------------------------------------------- */

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
async function ensureAllPermissions() {
  // Phase 1: parallel check (~2x faster than sequential).
  const [initialCamera, initialGallery] = await Promise.all([checkCameraPermission(), checkGalleryPermission()]);

  // Phase 2: sequential request for any still in `denied` state — we
  // don't want both system dialogs queued back-to-back if only one is
  // actually needed.
  const camera = initialCamera === 'denied' ? await requestCameraPermission() : initialCamera;
  const gallery = initialGallery === 'denied' ? await requestGalleryPermission() : initialGallery;
  return {
    camera,
    gallery,
    allGranted: camera === 'granted' && gallery === 'granted'
  };
}

/**
 * Deep-link to the OS settings page for this app so users can manually
 * grant a permission that is currently `'blocked'`.
 *
 * Resolves silently if the user cancels — call sites should always
 * follow up by re-checking permissions when the app returns to the
 * foreground.
 */
async function openSettings() {
  try {
    await (0, _reactNativePermissions.openSettings)();
  } catch {
    /* user navigated away — not an error */
  }
}
//# sourceMappingURL=index.js.map