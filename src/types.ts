/* -------------------------------------------------------------------------- *
 *                          Result returned to parent                         *
 * -------------------------------------------------------------------------- */

/**
 * The result returned to the parent application when an image has been
 * successfully captured / selected and cropped.
 */
export type ProfileImageResult = {
  /** Local file URI, e.g. `file:///.../cropped-1700000000.jpg`. */
  uri: string;
  /** Optional base64 string (no `data:` prefix). Only present when
   *  `enableBase64: true` was passed in options. */
  base64?: string;
  /** Best-effort filename, derived from URI when source did not provide one. */
  fileName?: string;
  /** MIME type. Always `image/jpeg` — the SDK encodes JPEG for compactness. */
  type?: string;
  /** Width of the cropped output, in pixels. Always honors the cropped
   *  aspect ratio, capped by `maxOutputSize`. */
  width?: number;
  /** Height of the cropped output, in pixels. */
  height?: number;
};

/* -------------------------------------------------------------------------- *
 *                                 Strings                                    *
 *                                                                            *
 *  Every visible label and accessibility hint shown by the SDK lives here.   *
 *  Pass `Partial<SmartCaptureStrings>` via `options.ui.strings` to localize  *
 *  or override individual entries.                                           *
 * -------------------------------------------------------------------------- */

export type SmartCaptureStrings = {
  /** Shown while waiting for `useCameraDevice` to resolve. */
  cameraPreparing: string;
  /** Shown when no camera device is available for the requested position
   *  even after the SDK tried to fall back to the other side. */
  cameraDeviceUnavailable: string;
  /** Camera screen "Cancel" button label. */
  cameraCancel: string;
  /** Accessibility label for the camera flip icon button. */
  cameraFlip: string;
  /** Accessibility label for the shutter button. */
  cameraShutter: string;
  /** Accessibility label / template for the zoom toggle. */
  cameraZoom: string;
  /** Title shown above the crop preview. */
  previewTitle: string;
  /** Shown while the source image is being measured. */
  previewLoading: string;
  /** Shown when the source image cannot be measured / loaded. */
  previewLoadFailed: string;
  /** Retry button label on the preview-load-failed state. */
  previewTryAgain: string;
  /** Preview screen "Cancel" button label. */
  previewCancel: string;
  /** Preview screen primary CTA label. */
  previewUsePhoto: string;
};

/* -------------------------------------------------------------------------- *
 *                                  Colors                                    *
 * -------------------------------------------------------------------------- */

export type SmartCaptureColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textInverse: string;
  textMuted: string;
  divider: string;
  primary: string;
  danger: string;
  scrim: string;
  /** Dim layer outside the crop window. */
  overlay: string;
  /** Stroke drawn around the crop cut-out. Set to `'transparent'` to hide. */
  overlayStroke: string;
  /** Translucent layer rendered while a long-running action is in flight. */
  loaderOverlay: string;
};

/* -------------------------------------------------------------------------- *
 *                                  Fonts                                     *
 * -------------------------------------------------------------------------- */

export type SmartCaptureFonts = {
  regular?: string;
  medium?: string;
  bold?: string;
};

/* -------------------------------------------------------------------------- *
 *                               Dimensions                                   *
 *                                                                            *
 *  Pixel sizes for the most-tweaked UI elements. Pass partial overrides      *
 *  via `options.ui.dimensions`.                                              *
 * -------------------------------------------------------------------------- */

export type SmartCaptureDimensions = {
  /** Outer diameter of the shutter button. Default `76`. */
  shutterSize: number;
  /** Min hit-target for the flip / cancel buttons. Default `44`. */
  iconButtonSize: number;
  /** Visual size of the flip icon glyph. Default `22`. */
  iconSize: number;
  /** Stroke width drawn around the crop cut-out. Default `2`. */
  overlayStrokeWidth: number;
  /** `circle` shape: diameter as a fraction of the smaller viewport side.
   *  Range `0..1`. Default `0.88`. */
  circleDiameterRatio: number;
  /** `rectangle` shape: height / width ratio of the crop window.
   *  e.g. `1` = square, `1.2` = portrait card, `1.586` = ID card.
   *  Default `1.2`. */
  rectangleAspectRatio: number;
  /** `rectangle` shape: horizontal padding from viewport edges. Default `24`. */
  rectangleHorizontalInset: number;
};

/* -------------------------------------------------------------------------- *
 *                              UI Configuration                              *
 * -------------------------------------------------------------------------- */

export type SmartCaptureUIConfig = {
  strings?: Partial<SmartCaptureStrings>;
  colors?: Partial<SmartCaptureColors>;
  fonts?: SmartCaptureFonts;
  dimensions?: Partial<SmartCaptureDimensions>;
};

/* -------------------------------------------------------------------------- *
 *                              Picker Options                                *
 * -------------------------------------------------------------------------- */

export type CameraFlashMode = 'off' | 'on' | 'auto';
export type CameraPosition = 'front' | 'back';
export type CropShape = 'circle' | 'rectangle';

/**
 * Options accepted by the imperative API and the `<ProfileImagePicker />`
 * component. All fields are optional with sensible defaults.
 */
export type ProfileImagePickerOptions = {
  /* -------- Output -------- */
  /** Include a base64 representation of the cropped image in the
   *  result. Default: `false`. Heavy — leave off unless required. */
  enableBase64?: boolean;
  /** JPEG compression quality, `0..1`. Default: `0.85`. */
  compression?: number;
  /** Maximum output dimension in pixels (longest side).
   *  Default: `1024`. The cropped image is downscaled if larger. */
  maxOutputSize?: number;

  /* -------- Crop -------- */
  /** Shape of the crop overlay and exported crop region.
   *  Default: `'circle'`. */
  cropShape?: CropShape;

  /* -------- Camera -------- */
  /** Initial camera facing. Default: `'front'` (typical for profile / selfie flows). */
  initialCameraPosition?: CameraPosition;
  /** Show the front/back flip button. Default: `true`. */
  enableFlipCamera?: boolean;
  /** Show the 1x / 2x zoom toggle. Default: `true`. */
  enableZoomToggle?: boolean;
  /** Flash mode for `takePhoto`. Default: `'off'`. */
  flashMode?: CameraFlashMode;

  /* -------- UI -------- */
  /** Customize SDK labels and visual appearance without forking the component. */
  ui?: SmartCaptureUIConfig;
};

/* -------------------------------------------------------------------------- *
 *                              Imperative API                                *
 * -------------------------------------------------------------------------- */

export type OpenProfileImagePickerArgs = {
  onSuccess: (image: ProfileImageResult) => void;
  /** User dismissed the flow without producing an image. */
  onCancel?: () => void;
  /** Something failed (camera, gallery, crop, etc.).
   *  The error is always a {@link SmartCaptureError} with a `code`. */
  onError?: (error: Error) => void;
  options?: ProfileImagePickerOptions;
};

export type SmartCaptureSource = 'camera' | 'gallery';
