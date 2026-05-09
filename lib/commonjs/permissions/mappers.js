"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCameraPermission = getCameraPermission;
exports.getGalleryPermission = getGalleryPermission;
exports.mapStatus = mapStatus;
var _reactNative = require("react-native");
var _reactNativePermissions = require("react-native-permissions");
/**
 * Map react-native-permissions native statuses to our public 4-state enum.
 * iOS "limited" (e.g. limited photo library access) is treated as `granted`
 * because the user *has* granted access — just to a subset.
 */
function mapStatus(status) {
  switch (status) {
    case _reactNativePermissions.RESULTS.GRANTED:
    case _reactNativePermissions.RESULTS.LIMITED:
      return 'granted';
    case _reactNativePermissions.RESULTS.DENIED:
      return 'denied';
    case _reactNativePermissions.RESULTS.BLOCKED:
      return 'blocked';
    case _reactNativePermissions.RESULTS.UNAVAILABLE:
    default:
      return 'unavailable';
  }
}

/**
 * Resolve the platform-specific camera permission constant.
 */
function getCameraPermission() {
  if (_reactNative.Platform.OS === 'ios') return _reactNativePermissions.PERMISSIONS.IOS.CAMERA;
  if (_reactNative.Platform.OS === 'android') return _reactNativePermissions.PERMISSIONS.ANDROID.CAMERA;
  return null;
}

/**
 * Resolve the platform-specific gallery / photo-library permission.
 *
 * - iOS:    PHOTO_LIBRARY (read+write) — limited access surfaces as `granted`
 * - Android 33+ (API 33, Tiramisu): READ_MEDIA_IMAGES (scoped storage)
 * - Android 32 and below: READ_EXTERNAL_STORAGE
 */
function getGalleryPermission() {
  if (_reactNative.Platform.OS === 'ios') return _reactNativePermissions.PERMISSIONS.IOS.PHOTO_LIBRARY;
  if (_reactNative.Platform.OS === 'android') {
    const apiLevel = typeof _reactNative.Platform.Version === 'number' ? _reactNative.Platform.Version : parseInt(String(_reactNative.Platform.Version), 10);
    if (apiLevel >= 33) {
      return _reactNativePermissions.PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
    }
    return _reactNativePermissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
  }
  return null;
}
//# sourceMappingURL=mappers.js.map