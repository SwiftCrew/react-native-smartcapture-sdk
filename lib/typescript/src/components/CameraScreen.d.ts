import React from 'react';
import type { CameraFlashMode, CameraPosition } from '../types';
import { type ResolvedUIConfig } from '../uiConfig';
export type CameraScreenProps = {
    onCapture: (uri: string) => void;
    onCancel: () => void;
    onError: (error: Error) => void;
    ui?: ResolvedUIConfig;
    /** Initial camera position. Default: `'back'`. */
    initialPosition?: CameraPosition;
    /** Show the front/back flip button. Default: `true`. */
    enableFlipCamera?: boolean;
    /** Show the 1x / 2x zoom toggle. Default: `true`. */
    enableZoomToggle?: boolean;
    /** Flash mode for `takePhoto`. Default: `'off'`. */
    flashMode?: CameraFlashMode;
};
export declare const CameraScreen: React.FC<CameraScreenProps>;
//# sourceMappingURL=CameraScreen.d.ts.map