/* -------------------------------------------------------------------------- *
 *                     react-native-smartcapture-sdk                          *
 *   A production-ready profile-picture capture, crop & upload SDK.           *
 * -------------------------------------------------------------------------- */

/* ------------------------------ Public types ----------------------------- */
export type {
  ProfileImageResult,
  ProfileImagePickerOptions,
  OpenProfileImagePickerArgs,
  SmartCaptureSource,
  SmartCaptureUIConfig,
  SmartCaptureStrings,
  SmartCaptureColors,
  SmartCaptureFonts,
  SmartCaptureDimensions,
  CameraFlashMode,
  CameraPosition,
  CropShape,
} from './types';

/* ------------------------------ Errors ----------------------------------- */
export { SmartCaptureError } from './errors';
export type { SmartCaptureErrorCode } from './errors';

/* ------------------------------ Permissions ------------------------------ */
export {
  checkCameraPermission,
  requestCameraPermission,
  checkGalleryPermission,
  requestGalleryPermission,
  ensureAllPermissions,
  openSettings,
} from './permissions';
export type { PermissionStatus, PermissionResult } from './permissions';

/* -------------------------------- UI APIs -------------------------------- */
export { ProfileImagePicker } from './ProfileImagePicker';
export type { ProfileImagePickerProps } from './ProfileImagePicker';

export {
  openProfileImagePicker,
  openProfileImageCapture,
  openProfileImageGallery,
  ProfileImagePickerHost,
} from './imperative';

/* ------------------------- Re-exports for power users -------------------- */
/* Useful if a consumer wants to assemble their own custom flow on top of
 * our primitives. Internal-by-default; surfaced here as a stable extension
 * point. */
export {
  BottomSheet,
  CameraScreen,
  ImageCropper,
  PreviewScreen,
  pickFromGallery,
} from './components';
export type {
  BottomSheetAction,
  BottomSheetProps,
  CameraScreenProps,
  ImageCropperHandle,
  ImageCropperProps,
  PreviewScreenProps,
  PickFromGalleryResult,
  PickedAsset,
} from './components';
