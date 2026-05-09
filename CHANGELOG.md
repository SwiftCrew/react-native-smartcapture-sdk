# Changelog

All notable changes to **`react-native-smartcapture-sdk`** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-08

Initial public release on npm as `react-native-smartcapture-sdk`.

### Added

- **Camera capture** flow with front/back switching and 1x / 2x zoom toggle (`openProfileImageCapture`).
- **Gallery selection** flow with iOS limited-access support (`openProfileImageGallery`).
- **Interactive crop preview** with pan & pinch gestures, supporting both `circle` and `rectangle` shapes.
  - Visible stroke around the crop window so the boundary is always clear.
  - Configurable `rectangleAspectRatio` (e.g. `1` square, `1.586` ID card, etc.).
  - Configurable `circleDiameterRatio`.
- **Permission helpers** built on top of `react-native-permissions`:
  - `checkCameraPermission`, `requestCameraPermission`
  - `checkGalleryPermission`, `requestGalleryPermission`
  - `ensureAllPermissions` (parallel checks, sequential prompts)
  - `openSettings` deep-link helper
- **Component API** — `<ProfileImagePicker />` for declarative usage.
- **Imperative API** — `<ProfileImagePickerHost />` + `openProfileImageCapture` / `openProfileImageGallery` / `openProfileImagePicker`.
- **Structured errors** — every public API rejects with `SmartCaptureError` carrying a stable `code`:
  `camera_unavailable` · `camera_capture_failed` · `gallery_pick_failed` ·
  `image_load_failed` · `image_load_timeout` · `crop_failed` ·
  `invalid_options` · `unknown`.
- **Camera behavior options**:
  - `initialCameraPosition: 'front' | 'back'` (default `'front'`)
  - `enableFlipCamera: boolean` (default `true`)
  - `enableZoomToggle: boolean` (default `true`)
  - `flashMode: 'off' | 'on' | 'auto'` (default `'off'`)
- **UI customization** via `options.ui`:
  - `strings` — every label *and* accessibility label is overridable.
  - `colors` — full palette including `overlay` + `overlayStroke`.
  - `fonts` — `regular` / `medium` / `bold` font families.
  - `dimensions` — `shutterSize`, `iconButtonSize`, `iconSize`,
    `overlayStrokeWidth`, `circleDiameterRatio`, `rectangleAspectRatio`,
    `rectangleHorizontalInset`.
- **Accessibility** — `accessibilityRole`, `accessibilityLabel`, and
  `accessibilityState` on every interactive element (shutter, flip,
  zoom chips, cancel, confirm, retry).
- **Output options** — JPEG `compression` (clamped `0..1`),
  `maxOutputSize` (caps the *longest* side), optional `enableBase64`.
- **Full TypeScript types** for all public APIs.
- **Cross-platform** — iOS and Android.

### Robustness

- `Image.getSize` calls now have a **10-second timeout** so unreachable
  URIs can't leave the picker stuck on the loading spinner forever.
- Crop rect is clamped to source-image bounds before being sent to the
  native cropper (avoids off-by-one rejections in some image-editor builds).
- Camera screen falls back to the *other* camera when the requested
  position has no device (single-camera emulators / kiosks).
- Flip & zoom controls disable themselves while a capture is in flight.
- Cropper gesture state resets when the source image changes (retake).
- `mountedRef` + `visibleRef` guards on every async callback to prevent
  state updates / callbacks firing after unmount or close.
- Imperative host registry is token-based — HMR / dual-host scenarios
  no longer null-out a freshly-mounted host.

### Peer-dependency compatibility

| Peer | Range | Notes |
|---|---|---|
| `react` | `>=17.0.0` | |
| `react-native` | `>=0.70.0` | |
| `react-native-vision-camera` | `>=3.0.0 <5.0.0` | VisionCamera 5.x changed the photo-capture API and is not yet supported. |
| `react-native-image-picker` | `>=7.0.0 <9.0.0` | |
| `@react-native-community/image-editor` | `>=4.0.0 <5.0.0` | |
| `react-native-permissions` | `>=3.0.0 <6.0.0` | |
| `react-native-reanimated` | `>=3.0.0` | If on v4+, also install `react-native-worklets`. |
| `react-native-gesture-handler` | `>=2.0.0` | |
| `react-native-svg` | `>=13.0.0` | Optional. |
| `react-native-worklets` | `>=0.1.0` | Optional — required only with Reanimated 4+. |

### Notes

- Public API surface is considered **stable** going forward; breaking
  changes will follow SemVer.
- See [README.md](README.md) for setup, permissions, API reference,
  and troubleshooting.

---

[1.0.0]: https://github.com/SwiftCrew/react-native-smartcapture-sdk/releases/tag/v1.0.0
