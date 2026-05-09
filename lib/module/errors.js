/**
 * Stable error codes surfaced by the SDK. Consumers should branch on
 * `error.code` rather than `error.message` so we can iterate on the
 * human text without breaking integrations.
 */

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
  /** Original error / value that triggered this one, if any. */

  constructor(code, message, cause) {
    super(message);
    this.name = 'SmartCaptureError';
    this.code = code;
    this.cause = cause;
    // Preserve V8 stack traces (Hermes/JSC silently no-op).
    const ErrorCtor = Error;
    if (typeof ErrorCtor.captureStackTrace === 'function') {
      ErrorCtor.captureStackTrace(this, SmartCaptureError);
    }
  }
}

/**
 * Coerce any thrown value into a {@link SmartCaptureError}. Pass-through
 * if it's already one.
 */
export function toSmartCaptureError(err, fallbackCode, fallbackMessage) {
  if (err instanceof SmartCaptureError) return err;
  const message = err instanceof Error ? err.message || fallbackMessage : typeof err === 'string' ? err : fallbackMessage;
  return new SmartCaptureError(fallbackCode, message, err);
}
//# sourceMappingURL=errors.js.map