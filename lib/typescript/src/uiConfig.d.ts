import type { SmartCaptureColors, SmartCaptureDimensions, SmartCaptureFonts, SmartCaptureStrings, SmartCaptureUIConfig } from './types';
export declare const DEFAULT_COLORS: SmartCaptureColors;
export declare const DEFAULT_STRINGS: SmartCaptureStrings;
export declare const DEFAULT_FONTS: SmartCaptureFonts;
export declare const DEFAULT_DIMENSIONS: SmartCaptureDimensions;
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
export declare function resolveUIConfig(config?: SmartCaptureUIConfig): ResolvedUIConfig;
//# sourceMappingURL=uiConfig.d.ts.map