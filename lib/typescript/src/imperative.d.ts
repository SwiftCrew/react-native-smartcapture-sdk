import React from 'react';
import type { OpenProfileImagePickerArgs } from './types';
/**
 * Imperative API — opens the profile image picker (camera flow) programmatically.
 *
 * Requires `<ProfileImagePickerHost />` to be mounted somewhere in the
 * tree (typically near the root, alongside your navigation provider).
 *
 * If the host is not yet mounted (e.g. very early in app startup), the
 * call is queued and fired as soon as a host registers.
 */
export declare function openProfileImagePicker(args: OpenProfileImagePickerArgs): void;
/** Open camera flow directly. */
export declare function openProfileImageCapture(args: OpenProfileImagePickerArgs): void;
/** Open gallery flow directly. */
export declare function openProfileImageGallery(args: OpenProfileImagePickerArgs): void;
/**
 * Mount this once near the root of your app to enable
 * {@link openProfileImageCapture} / {@link openProfileImageGallery}.
 *
 * If you only ever use the `<ProfileImagePicker />` component directly
 * with a `visible` prop, you do NOT need this host.
 */
export declare const ProfileImagePickerHost: React.FC;
//# sourceMappingURL=imperative.d.ts.map