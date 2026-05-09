import { useCallback, useState } from 'react';

export type PickerStep =
  | { kind: 'camera' }
  | { kind: 'gallery-loading' }
  | { kind: 'preview'; uri: string };

/**
 * Tiny state machine driving the picker UI when source is chosen by parent app:
 *   camera  → preview → done
 *   gallery → preview → done
 */
export function usePickerFlow(initial: PickerStep = { kind: 'camera' }) {
  const [step, setStep] = useState<PickerStep>(initial);

  const goCamera = useCallback(() => setStep({ kind: 'camera' }), []);
  const goGalleryLoading = useCallback(
    () => setStep({ kind: 'gallery-loading' }),
    [],
  );
  const goPreview = useCallback(
    (uri: string) => setStep({ kind: 'preview', uri }),
    [],
  );

  return { step, goCamera, goGalleryLoading, goPreview, setStep };
}
