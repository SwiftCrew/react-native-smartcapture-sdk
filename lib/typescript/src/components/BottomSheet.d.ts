import React from 'react';
import { type ResolvedUIConfig } from '../uiConfig';
export type BottomSheetAction = {
    label: string;
    onPress: () => void;
    destructive?: boolean;
    testID?: string;
};
export type BottomSheetProps = {
    visible: boolean;
    title?: string;
    actions: BottomSheetAction[];
    cancelLabel?: string;
    onClose: () => void;
    /**
     * When `true`, render only the overlay (scrim + sheet) without wrapping
     * it in a `Modal`. Use this when the consumer is already inside a
     * `Modal` — wrapping in another `Modal` causes iOS to throw
     * "Attempt to present ... which is already presenting" warnings and
     * blocks the next screen from appearing. Default: `false`.
     */
    embedded?: boolean;
    ui?: ResolvedUIConfig;
};
export declare const BottomSheet: React.FC<BottomSheetProps>;
//# sourceMappingURL=BottomSheet.d.ts.map