import { SmartCaptureError } from '../errors';
export type PickedAsset = {
    uri: string;
    width?: number;
    height?: number;
    fileName?: string;
    type?: string;
};
export type PickFromGalleryResult = {
    kind: 'picked';
    asset: PickedAsset;
} | {
    kind: 'cancelled';
} | {
    kind: 'error';
    error: SmartCaptureError;
};
/**
 * Thin wrapper around `react-native-image-picker` that:
 *  - Always asks for a single image
 *  - Skips the lib's built-in permission dialog (we manage permissions
 *    centrally via `react-native-permissions` for a unified API)
 *  - Normalizes the result into our internal shape
 *  - Wraps every error as {@link SmartCaptureError} for consistent
 *    consumer-side error handling
 */
export declare function pickFromGallery(): Promise<PickFromGalleryResult>;
//# sourceMappingURL=GalleryHandler.d.ts.map