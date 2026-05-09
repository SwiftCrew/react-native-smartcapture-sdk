import { useCallback, useState } from 'react';
/**
 * Tiny state machine driving the picker UI when source is chosen by parent app:
 *   camera  → preview → done
 *   gallery → preview → done
 */
export function usePickerFlow(initial = {
  kind: 'camera'
}) {
  const [step, setStep] = useState(initial);
  const goCamera = useCallback(() => setStep({
    kind: 'camera'
  }), []);
  const goGalleryLoading = useCallback(() => setStep({
    kind: 'gallery-loading'
  }), []);
  const goPreview = useCallback(uri => setStep({
    kind: 'preview',
    uri
  }), []);
  return {
    step,
    goCamera,
    goGalleryLoading,
    goPreview,
    setStep
  };
}
//# sourceMappingURL=usePickerFlow.js.map