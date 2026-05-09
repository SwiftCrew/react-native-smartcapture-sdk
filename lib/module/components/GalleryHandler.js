import { launchImageLibrary } from 'react-native-image-picker';
import { SmartCaptureError, toSmartCaptureError } from '../errors';
/**
 * Thin wrapper around `react-native-image-picker` that:
 *  - Always asks for a single image
 *  - Skips the lib's built-in permission dialog (we manage permissions
 *    centrally via `react-native-permissions` for a unified API)
 *  - Normalizes the result into our internal shape
 *  - Wraps every error as {@link SmartCaptureError} for consistent
 *    consumer-side error handling
 */
export async function pickFromGallery() {
  try {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 1,
      includeBase64: false,
      includeExtra: false
    });
    if (response.didCancel) {
      return {
        kind: 'cancelled'
      };
    }
    if (response.errorCode) {
      return {
        kind: 'error',
        error: new SmartCaptureError('gallery_pick_failed', response.errorMessage ?? response.errorCode, response)
      };
    }
    const first = response.assets?.[0];
    if (!first || !first.uri) {
      // No assets selected even though `didCancel` wasn't set — treat
      // as cancellation (some Android builds report this state).
      return {
        kind: 'cancelled'
      };
    }
    return {
      kind: 'picked',
      asset: {
        uri: first.uri,
        width: first.width,
        height: first.height,
        fileName: first.fileName,
        type: first.type
      }
    };
  } catch (e) {
    return {
      kind: 'error',
      error: toSmartCaptureError(e, 'gallery_pick_failed', 'Failed to open gallery.')
    };
  }
}
//# sourceMappingURL=GalleryHandler.js.map