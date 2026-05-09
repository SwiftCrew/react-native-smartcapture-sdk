import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CameraScreen, PreviewScreen, pickFromGallery } from './components';
import { usePickerFlow } from './hooks';
import { resolveUIConfig } from './uiConfig';

/**
 * Default options applied when the consumer omits a field. Single
 * source of truth so `CameraScreen` / `PreviewScreen` never have to
 * branch on `undefined`.
 */
const DEFAULTS = {
  enableBase64: false,
  cropShape: 'circle',
  compression: 0.85,
  maxOutputSize: 1024,
  initialCameraPosition: 'front',
  enableFlipCamera: true,
  enableZoomToggle: true,
  flashMode: 'off'
};
export const ProfileImagePicker = ({
  visible,
  onClose,
  onImageSelected,
  onError,
  options,
  source = 'camera'
}) => {
  const resolved = useMemo(() => ({
    ...DEFAULTS,
    ...(options ?? {})
  }), [options]);
  const ui = useMemo(() => resolveUIConfig(resolved.ui), [resolved.ui]);
  const {
    step,
    goPreview,
    setStep
  } = usePickerFlow(source === 'gallery' ? {
    kind: 'gallery-loading'
  } : {
    kind: 'camera'
  });
  const mountedRef = useRef(true);
  const galleryRequestedRef = useRef(false);
  // Tracks the latest `visible` value so async callbacks (e.g. the
  // gallery picker promise) can detect when the consumer has already
  // closed the picker and avoid firing duplicate `onClose` events.
  const visibleRef = useRef(visible);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Reset when modal closes; initialize step when it opens.
  useEffect(() => {
    if (!visible) {
      galleryRequestedRef.current = false;
      setStep(source === 'gallery' ? {
        kind: 'gallery-loading'
      } : {
        kind: 'camera'
      });
      return;
    }
    setStep(source === 'gallery' ? {
      kind: 'gallery-loading'
    } : {
      kind: 'camera'
    });
  }, [visible, source, setStep]);
  const handleError = useCallback(err => {
    onError?.(err);
    onClose();
  }, [onError, onClose]);
  const handleGalleryPick = useCallback(async () => {
    const result = await pickFromGallery();
    if (!mountedRef.current || !visibleRef.current) return;
    if (result.kind === 'picked') {
      goPreview(result.asset.uri);
    } else if (result.kind === 'error') {
      handleError(result.error);
    } else {
      onClose();
    }
  }, [goPreview, handleError, onClose]);

  // Launch gallery picker once on gallery flow open.
  useEffect(() => {
    if (!visible) return;
    if (step.kind !== 'gallery-loading') return;
    if (galleryRequestedRef.current) return;
    galleryRequestedRef.current = true;
    void handleGalleryPick();
  }, [visible, step.kind, handleGalleryPick]);
  const handleConfirm = useCallback(img => {
    onImageSelected(img);
    onClose();
  }, [onClose, onImageSelected]);

  /* ------------------------------------------------------------------ *
   *  Render                                                            *
   *                                                                    *
   *  IMPORTANT: We use a SINGLE outer Modal for the entire flow and    *
   *  swap the content inside. Mounting/unmounting separate Modals      *
   *  per step caused iOS to throw                                      *
   *    "Attempt to present <RCTModalHostViewController...>             *
   *     which is already presenting <RCTModalHostViewController...>"   *
   *  whenever the iOS photo picker dismissed and we tried to swap      *
   *  the BottomSheet Modal for a Preview Modal in the same tick —      *
   *  blocking the preview screen from appearing.                       *
   * ------------------------------------------------------------------ */

  return /*#__PURE__*/React.createElement(Modal, {
    visible: visible,
    transparent: true,
    animationType: "fade",
    statusBarTranslucent: true,
    onRequestClose: onClose
  }, /*#__PURE__*/React.createElement(GestureHandlerRootView, {
    style: styles.root
  }, /*#__PURE__*/React.createElement(View, {
    style: [styles.fullscreen, {
      backgroundColor: ui.colors.background
    }]
  }, step.kind === 'camera' ? /*#__PURE__*/React.createElement(CameraScreen, {
    onCapture: uri => goPreview(uri),
    onCancel: onClose,
    onError: handleError,
    ui: ui,
    initialPosition: resolved.initialCameraPosition,
    enableFlipCamera: resolved.enableFlipCamera,
    enableZoomToggle: resolved.enableZoomToggle,
    flashMode: resolved.flashMode
  }) : step.kind === 'gallery-loading' ? /*#__PURE__*/React.createElement(View, {
    style: styles.loadingWrap
  }, /*#__PURE__*/React.createElement(ActivityIndicator, {
    color: ui.colors.textInverse
  })) : /*#__PURE__*/React.createElement(PreviewScreen, {
    uri: step.uri,
    options: {
      compression: resolved.compression,
      maxOutputSize: resolved.maxOutputSize,
      enableBase64: resolved.enableBase64,
      cropShape: resolved.cropShape
    },
    onConfirm: handleConfirm,
    onRetake: onClose,
    onCancel: onClose,
    onError: handleError,
    ui: ui
  }))));
};
const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  fullscreen: {
    flex: 1
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
//# sourceMappingURL=ProfileImagePicker.js.map