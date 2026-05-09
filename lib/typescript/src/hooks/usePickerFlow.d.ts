export type PickerStep = {
    kind: 'camera';
} | {
    kind: 'gallery-loading';
} | {
    kind: 'preview';
    uri: string;
};
/**
 * Tiny state machine driving the picker UI when source is chosen by parent app:
 *   camera  → preview → done
 *   gallery → preview → done
 */
export declare function usePickerFlow(initial?: PickerStep): {
    step: PickerStep;
    goCamera: () => void;
    goGalleryLoading: () => void;
    goPreview: (uri: string) => void;
    setStep: import("react").Dispatch<import("react").SetStateAction<PickerStep>>;
};
//# sourceMappingURL=usePickerFlow.d.ts.map