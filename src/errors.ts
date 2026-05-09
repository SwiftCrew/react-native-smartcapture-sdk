/**
 * Stable error codes surfaced by the SDK. Consumers should branch on
 * `error.code` rather than `error.message` so we can iterate on the
 * human text without breaking integrations.
 */
export type SmartCaptureErrorCode =
  /** No `react-native-vision-camera` device is available for the requested
   *  position (front / back), and no fallback could be resolved. */
  | 'camera_unavailable'
  /** The native `takePhoto` call failed (hardware error, memory, etc.). */
  | 'camera_capture_failed'
  /** The gallery picker returned an error or unreadable asset. */
  | 'gallery_pick_failed'
  /** `Image.getSize` could not load the source image. */
  | 'image_load_failed'
  /** `Image.getSize` did not respond within the timeout window. */
  | 'image_load_timeout'
  /** `@react-native-community/image-editor` could not crop the image. */
  | 'crop_failed'
  /** Caller-supplied options (compression, sizes, etc.) were invalid. */
  | 'invalid_options'
  /** Catch-all for anything else. */
  | 'unknown';

/**
 * The single error type produced by every public API in this SDK.
 *
 * @example
 * ```ts
 * try {
 *   await openProfileImageCapture({ ... });
 * } catch (e) {
 *   if (e instanceof SmartCaptureError && e.code === 'camera_unavailable') {
 *     // graceful fallback
 *   }
 * }
 * ```
 */
export class SmartCaptureError extends Error {
  readonly code: SmartCaptureErrorCode;
  /** Original error / value that triggered this one, if any. */
  readonly cause?: unknown;

  constructor(code: SmartCaptureErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'SmartCaptureError';
    this.code = code;
    this.cause = cause;
    // Preserve V8 stack traces (Hermes/JSC silently no-op).
    const ErrorCtor = Error as unknown as {
      captureStackTrace?: (target: object, ctor: unknown) => void;
    };
    if (typeof ErrorCtor.captureStackTrace === 'function') {
      ErrorCtor.captureStackTrace(this, SmartCaptureError);
    }
  }
}

/**
 * Coerce any thrown value into a {@link SmartCaptureError}. Pass-through
 * if it's already one.
 */
export function toSmartCaptureError(
  err: unknown,
  fallbackCode: SmartCaptureErrorCode,
  fallbackMessage: string,
): SmartCaptureError {
  if (err instanceof SmartCaptureError) return err;
  const message =
    err instanceof Error
      ? err.message || fallbackMessage
      : typeof err === 'string'
        ? err
        : fallbackMessage;
  return new SmartCaptureError(fallbackCode, message, err);
}
