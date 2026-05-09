import React from 'react';
import type { ProfileImageResult, ProfileImagePickerOptions } from '../types';
import { type ResolvedUIConfig } from '../uiConfig';
export type PreviewScreenProps = {
    uri: string;
    options: Required<Pick<ProfileImagePickerOptions, 'compression' | 'maxOutputSize' | 'enableBase64' | 'cropShape'>>;
    onConfirm: (result: ProfileImageResult) => void;
    onRetake: () => void;
    onCancel: () => void;
    onError: (error: Error) => void;
    ui?: ResolvedUIConfig;
};
export declare const PreviewScreen: React.FC<PreviewScreenProps>;
//# sourceMappingURL=PreviewScreen.d.ts.map