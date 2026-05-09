"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cropImage = cropImage;
exports.getImageSize = getImageSize;
exports.normalizeUri = normalizeUri;
var _reactNative = require("react-native");
var _imageEditor = _interopRequireDefault(require("@react-native-community/image-editor"));
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/** Default timeout for `Image.getSize` so unreachable URIs can't hang. */
const GET_SIZE_TIMEOUT_MS = 10_000;

/**
 * Get the natural pixel size of an image at the given URI.
 *
 * Wraps `Image.getSize` with:
 *  - a {@link SmartCaptureError} for the failure path, and
 *  - a configurable timeout so that a network image without internet
 *    can't leave the picker stuck on the loading spinner forever.
 */
function getImageSize(uri, timeoutMs = GET_SIZE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new _errors.SmartCaptureError('image_load_timeout', `Loading image dimensions timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
    _reactNative.Image.getSize(uri, (width, height) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (!isFiniteSize(width) || !isFiniteSize(height)) {
        reject(new _errors.SmartCaptureError('image_load_failed', `Image reported invalid size (${width}x${height}).`));
        return;
      }
      resolve({
        width,
        height
      });
    }, err => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject((0, _errors.toSmartCaptureError)(err, 'image_load_failed', 'Could not load image.'));
    });
  });
}
function isFiniteSize(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}
/**
 * Native-side crop using `@react-native-community/image-editor`.
 *
 * The cropper UI shows a circular or rectangular overlay; the *exported file*
 * is a tight rectangle covering that overlay. Profile images are then
 * displayed with `borderRadius: width / 2` to render circular — the standard
 * pattern used by Instagram / Twitter / WhatsApp (smaller files than a
 * transparent PNG, faster to encode).
 */
async function cropImage(args) {
  const {
    uri,
    rect,
    imageWidth,
    imageHeight,
    outputSize,
    quality,
    includeBase64
  } = args;

  // ----- Validate / normalise the crop rect -----
  const safeImageW = Math.max(1, Math.floor(imageWidth));
  const safeImageH = Math.max(1, Math.floor(imageHeight));
  const x = clampInt(rect.x, 0, safeImageW - 1);
  const y = clampInt(rect.y, 0, safeImageH - 1);
  const cropW = clampInt(rect.width, 1, safeImageW - x);
  const cropH = clampInt(rect.height, 1, safeImageH - y);
  const aspect = cropW / cropH;

  // Cap the *longest* side at `outputSize` so portrait rectangles
  // honour the consumer-supplied limit (previously only width was
  // capped, which produced over-sized output for tall crops).
  const safeOutput = Math.max(1, Math.floor(outputSize));
  let outputW;
  let outputH;
  if (aspect >= 1) {
    outputW = safeOutput;
    outputH = Math.max(1, Math.round(outputW / aspect));
  } else {
    outputH = safeOutput;
    outputW = Math.max(1, Math.round(outputH * aspect));
  }

  // Clamp `quality` defensively — image-editor quietly accepts NaN
  // and produces an unreadable JPEG.
  const safeQuality = clamp01(quality);

  // The image-editor API uses a literal `true`/`false` discriminant on
  // `includeBase64` to type-narrow the return value. Branching keeps
  // the overloads happy.
  const baseArgs = {
    offset: {
      x,
      y
    },
    size: {
      width: cropW,
      height: cropH
    },
    displaySize: {
      width: outputW,
      height: outputH
    },
    resizeMode: 'cover',
    format: 'jpeg',
    quality: safeQuality
  };
  let cropResult;
  try {
    cropResult = includeBase64 ? await _imageEditor.default.cropImage(uri, {
      ...baseArgs,
      includeBase64: true
    }) : await _imageEditor.default.cropImage(uri, {
      ...baseArgs,
      includeBase64: false
    });
  } catch (e) {
    throw (0, _errors.toSmartCaptureError)(e, 'crop_failed', 'Failed to crop image.');
  }

  // image-editor v4 returns `{ uri, base64?, width?, height? }`,
  // older versions returned a plain `string`. Support both shapes.
  const outUri = typeof cropResult === 'string' ? cropResult : cropResult.uri;
  if (!outUri || typeof outUri !== 'string') {
    throw new _errors.SmartCaptureError('crop_failed', 'Image editor returned no URI.', cropResult);
  }
  const base64 = typeof cropResult === 'string' ? undefined : cropResult.base64;
  return {
    uri: outUri,
    base64: includeBase64 ? base64 : undefined,
    fileName: deriveFileName(outUri),
    type: 'image/jpeg',
    width: outputW,
    height: outputH
  };
}
function deriveFileName(uri) {
  try {
    const last = uri.split('/').pop();
    if (!last) return `profile-${Date.now()}.jpg`;
    return last.includes('.') ? last : `${last}.jpg`;
  } catch {
    return `profile-${Date.now()}.jpg`;
  }
}
function clamp01(n) {
  if (!Number.isFinite(n)) return 0.85;
  return Math.min(1, Math.max(0, n));
}
function clampInt(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Normalize a content:// URI from the Android camera-roll picker to one
 * that `Image.getSize` and `ImageEditor` can both read on every device.
 *
 * On Android 11+ the picker often returns `content://` URIs which are
 * fine for both APIs. On some OEM builds (Xiaomi, older Samsung) the
 * URI uses an asset library scheme; this helper is the central place
 * to add device-specific tweaks if needed.
 */
function normalizeUri(uri) {
  if (_reactNative.Platform.OS === 'ios' && uri.startsWith('ph://')) {
    // ph:// URIs work with ImageEditor.cropImage but not with all
    // Image components — the consumer should use `Image.resolveAssetSource`
    // separately if they need a renderable URI.
    return uri;
  }
  return uri;
}
//# sourceMappingURL=imageEditor.js.map