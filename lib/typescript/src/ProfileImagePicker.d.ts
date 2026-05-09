import React from 'react';
import type { ProfileImageResult, ProfileImagePickerOptions, SmartCaptureSource } from './types';
export type ProfileImagePickerProps = {
    /** Whether the picker is currently open. */
    visible: boolean;
    /** Called whenever the user closes / cancels the picker. */
    onClose: () => void;
    /** Called when the user has captured & cropped an image. */
    onImageSelected: (image: ProfileImageResult) => void;
    /** Called when the picker fails (camera, gallery, crop, etc.). */
    onError?: (error: Error) => void;
    /** Picker options — see {@link ProfileImagePickerOptions}. */
    options?: ProfileImagePickerOptions;
    /**
     * Parent app owns source selection.
     *  - `'camera'`: open camera directly
     *  - `'gallery'`: open gallery directly, then preview
     */
    source?: SmartCaptureSource;
};
export declare const ProfileImagePicker: React.FC<ProfileImagePickerProps>;
//# sourceMappingURL=ProfileImagePicker.d.ts.map