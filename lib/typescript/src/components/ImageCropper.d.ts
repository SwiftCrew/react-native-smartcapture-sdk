import React from 'react';
import type { CropRect } from '../utils/imageEditor';
/**
 * Imperative handle exposed to the parent, returned via `ref`.
 *
 * `getCropRect()` snapshots the *current* gesture state and translates it
 * into source-image pixel coordinates ready for native cropping.
 */
export type ImageCropperHandle = {
    getCropRect: () => CropRect;
};
export type ImageCropperProps = {
    /** Source image URI. */
    uri: string;
    /** Source image natural pixel size — required to compute crop rect. */
    imageWidth: number;
    /** Source image natural pixel size — required to compute crop rect. */
    imageHeight: number;
    /** The total available width for the cropper viewport. */
    viewportWidth: number;
    /** The total available height for the cropper viewport. */
    viewportHeight: number;
    /** Diameter of the circle when `shape === 'circle'`.
     *  Defaults to `min(viewportWidth, viewportHeight) * circleDiameterRatio`. */
    circleDiameter?: number;
    /** Min zoom relative to base "cover" scale. Default: `1`. */
    minZoom?: number;
    /** Max zoom relative to base "cover" scale. Default: `5`. */
    maxZoom?: number;
    /** Crop overlay shape. Default: `'circle'`. */
    shape?: 'circle' | 'rectangle';
    /** Dim overlay color outside the cut-out. */
    overlayColor?: string;
    /** Stroke around the cut-out edge. Set to `'transparent'` to hide. */
    strokeColor?: string;
    /** Stroke width in viewport pixels. */
    strokeWidth?: number;
    /** Background color behind the image. */
    backgroundColor?: string;
    /** height / width ratio for the rectangle window. Default `1.2`. */
    rectangleAspectRatio?: number;
    /** Horizontal inset for the rectangle window in viewport pixels. */
    rectangleHorizontalInset?: number;
    /** Fraction `0..1` of the smaller viewport side used as circle diameter. */
    circleDiameterRatio?: number;
};
/**
 * Interactive image cropper.
 *
 * - The image is laid out with `resizeMode: 'cover'` over the viewport
 *   so the crop window is always fully covered at scale=1.
 * - The user can pan + pinch the image; gestures are clamped so the
 *   crop window never reveals empty space.
 * - On confirm, `getCropRect()` returns a rect in *source-image* pixels
 *   that bounds the crop window — that rect is then handed off to
 *   `@react-native-community/image-editor` for the actual native crop.
 */
export declare const ImageCropper: React.ForwardRefExoticComponent<ImageCropperProps & React.RefAttributes<ImageCropperHandle>>;
//# sourceMappingURL=ImageCropper.d.ts.map