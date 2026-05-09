import type { ProfileImageResult } from '../types';
/**
 * Get the natural pixel size of an image at the given URI.
 *
 * Wraps `Image.getSize` with:
 *  - a {@link SmartCaptureError} for the failure path, and
 *  - a configurable timeout so that a network image without internet
 *    can't leave the picker stuck on the loading spinner forever.
 */
export declare function getImageSize(uri: string, timeoutMs?: number): Promise<{
    width: number;
    height: number;
}>;
export type CropRect = {
    /** X offset in source-image pixels. */
    x: number;
    /** Y offset in source-image pixels. */
    y: number;
    /** Width in source-image pixels. */
    width: number;
    /** Height in source-image pixels. */
    height: number;
};
export type CropArgs = {
    uri: string;
    rect: CropRect;
    /** Image's natural width — used to clamp the crop rect. */
    imageWidth: number;
    /** Image's natural height — used to clamp the crop rect. */
    imageHeight: number;
    /** Output edge length in pixels for the longest side. */
    outputSize: number;
    /** JPEG quality, 0–1. Will be clamped if out of range. */
    quality: number;
    /** Whether to also return base64. */
    includeBase64: boolean;
};
/**
 * Native-side crop using `@react-native-community/image-editor`.
 *
 * The cropper UI shows a circular or rectangular overlay; the *exported file*
 * is a tight rectangle covering that overlay. Profile images are then
 * displayed with `borderRadius: width / 2` to render circular — the standard
 * pattern used by Instagram / Twitter / WhatsApp (smaller files than a
 * transparent PNG, faster to encode).
 */
export declare function cropImage(args: CropArgs): Promise<ProfileImageResult>;
/**
 * Normalize a content:// URI from the Android camera-roll picker to one
 * that `Image.getSize` and `ImageEditor` can both read on every device.
 *
 * On Android 11+ the picker often returns `content://` URIs which are
 * fine for both APIs. On some OEM builds (Xiaomi, older Samsung) the
 * URI uses an asset library scheme; this helper is the central place
 * to add device-specific tweaks if needed.
 */
export declare function normalizeUri(uri: string): string;
//# sourceMappingURL=imageEditor.d.ts.map