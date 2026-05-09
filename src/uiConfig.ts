import type {
  SmartCaptureColors,
  SmartCaptureDimensions,
  SmartCaptureFonts,
  SmartCaptureStrings,
  SmartCaptureUIConfig,
} from './types';

export const DEFAULT_COLORS: SmartCaptureColors = {
  background: '#000000',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F2F2',
  text: '#111111',
  textInverse: '#FFFFFF',
  textMuted: '#666666',
  divider: '#E5E5E5',
  primary: '#0A84FF',
  danger: '#FF3B30',
  scrim: 'rgba(0,0,0,0.55)',
  overlay: 'rgba(0,0,0,0.55)',
  overlayStroke: 'rgba(255,255,255,0.85)',
  loaderOverlay: 'rgba(0,0,0,0.4)',
};

export const DEFAULT_STRINGS: SmartCaptureStrings = {
  cameraPreparing: 'Preparing camera...',
  cameraDeviceUnavailable: 'No camera available on this device.',
  cameraCancel: 'Cancel',
  cameraFlip: 'Flip camera',
  cameraShutter: 'Take photo',
  cameraZoom: 'Zoom',
  previewTitle: 'Preview Image',
  previewLoading: 'Loading image...',
  previewLoadFailed: 'Could not load image. Please try again.',
  previewTryAgain: 'Try again',
  previewCancel: 'Cancel',
  previewUsePhoto: 'Use Photo',
};

export const DEFAULT_FONTS: SmartCaptureFonts = {};

export const DEFAULT_DIMENSIONS: SmartCaptureDimensions = {
  shutterSize: 76,
  iconButtonSize: 44,
  iconSize: 22,
  overlayStrokeWidth: 2,
  circleDiameterRatio: 0.88,
  rectangleAspectRatio: 1.2,
  rectangleHorizontalInset: 24,
};

export type ResolvedUIConfig = {
  colors: SmartCaptureColors;
  strings: SmartCaptureStrings;
  fonts: SmartCaptureFonts;
  dimensions: SmartCaptureDimensions;
};

/**
 * Merge consumer overrides over defaults, key-by-key. Returns a fully
 * populated, frozen-shape resolved config so all UI components can
 * read fields without nullish-checking.
 */
export function resolveUIConfig(config?: SmartCaptureUIConfig): ResolvedUIConfig {
  return {
    colors: { ...DEFAULT_COLORS, ...(config?.colors ?? {}) },
    strings: { ...DEFAULT_STRINGS, ...(config?.strings ?? {}) },
    fonts: { ...DEFAULT_FONTS, ...(config?.fonts ?? {}) },
    dimensions: { ...DEFAULT_DIMENSIONS, ...(config?.dimensions ?? {}) },
  };
}
