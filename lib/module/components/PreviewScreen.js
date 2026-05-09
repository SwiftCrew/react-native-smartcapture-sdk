import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SmartCaptureError, toSmartCaptureError } from '../errors';
import { radius, spacing } from '../theme';
import { resolveUIConfig } from '../uiConfig';
import { cropImage, getImageSize, normalizeUri } from '../utils/imageEditor';
import { ImageCropper } from './ImageCropper';
const CROP_AREA_VERTICAL_PADDING = 30;
export const PreviewScreen = ({
  uri,
  options,
  onConfirm,
  onRetake,
  onCancel,
  onError,
  ui
}) => {
  const resolvedUI = useMemo(() => ui ?? resolveUIConfig(), [ui]);
  const cropperRef = useRef(null);
  const mountedRef = useRef(true);
  const [imageSize, setImageSize] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const initialScreen = useMemo(() => Dimensions.get('window'), []);
  const [cropAreaSize, setCropAreaSize] = useState({
    width: initialScreen.width,
    height: Math.max(1, initialScreen.height * 0.5)
  });
  const styles = useMemo(() => createStyles(resolvedUI), [resolvedUI]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Resolve natural pixel size first — required to compute crop math.
  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setImageSize(null);
    getImageSize(normalizeUri(uri)).then(size => {
      if (!cancelled) setImageSize(size);
    }).catch(err => {
      if (!cancelled) {
        const message = err instanceof SmartCaptureError ? err.message : err instanceof Error ? err.message : resolvedUI.strings.previewLoadFailed;
        setLoadError(message || resolvedUI.strings.previewLoadFailed);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [uri, resolvedUI.strings.previewLoadFailed]);
  const handleConfirm = useCallback(async () => {
    if (!cropperRef.current || !imageSize || busy) return;
    try {
      setBusy(true);
      const rect = cropperRef.current.getCropRect();
      const result = await cropImage({
        uri: normalizeUri(uri),
        rect,
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        outputSize: options.maxOutputSize,
        quality: options.compression,
        includeBase64: options.enableBase64
      });
      if (!mountedRef.current) return;
      onConfirm(result);
    } catch (e) {
      if (!mountedRef.current) return;
      onError(toSmartCaptureError(e, 'crop_failed', 'Failed to crop image.'));
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, [busy, imageSize, onConfirm, onError, options, uri]);
  const handleCropAreaLayout = useCallback(event => {
    const {
      width,
      height
    } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCropAreaSize({
        width,
        height: Math.max(1, height - CROP_AREA_VERTICAL_PADDING * 2)
      });
    }
  }, []);
  const dim = resolvedUI.dimensions;
  return /*#__PURE__*/React.createElement(View, {
    style: styles.root
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.topBar
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.iconPlaceholder
  }), /*#__PURE__*/React.createElement(Text, {
    style: styles.title
  }, resolvedUI.strings.previewTitle), /*#__PURE__*/React.createElement(View, {
    style: styles.iconPlaceholder
  })), /*#__PURE__*/React.createElement(View, {
    style: styles.cropArea,
    onLayout: handleCropAreaLayout
  }, loadError ? /*#__PURE__*/React.createElement(View, {
    style: styles.center
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.errorText
  }, loadError), /*#__PURE__*/React.createElement(Pressable, {
    onPress: onRetake,
    style: styles.secondaryButton,
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.previewTryAgain,
    testID: "profile-image-preview-retry"
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.secondaryButtonLabel
  }, resolvedUI.strings.previewTryAgain))) : !imageSize ? /*#__PURE__*/React.createElement(View, {
    style: styles.center
  }, /*#__PURE__*/React.createElement(ActivityIndicator, {
    color: resolvedUI.colors.textInverse
  }), /*#__PURE__*/React.createElement(Text, {
    style: styles.muted
  }, resolvedUI.strings.previewLoading)) : /*#__PURE__*/React.createElement(ImageCropper, {
    ref: cropperRef,
    uri: normalizeUri(uri),
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    viewportWidth: cropAreaSize.width,
    viewportHeight: cropAreaSize.height,
    shape: options.cropShape,
    overlayColor: resolvedUI.colors.overlay,
    strokeColor: resolvedUI.colors.overlayStroke,
    strokeWidth: dim.overlayStrokeWidth,
    backgroundColor: resolvedUI.colors.background,
    rectangleAspectRatio: dim.rectangleAspectRatio,
    rectangleHorizontalInset: dim.rectangleHorizontalInset,
    circleDiameterRatio: dim.circleDiameterRatio
  })), /*#__PURE__*/React.createElement(View, {
    style: styles.bottomBar
  }, /*#__PURE__*/React.createElement(Pressable, {
    onPress: onCancel,
    style: ({
      pressed
    }) => [styles.cancelButton, pressed ? styles.cancelButtonPressed : null],
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.previewCancel,
    testID: "profile-image-preview-cancel"
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.cancelButtonLabel
  }, resolvedUI.strings.previewCancel)), /*#__PURE__*/React.createElement(Pressable, {
    onPress: handleConfirm,
    disabled: !imageSize || busy,
    style: ({
      pressed
    }) => [styles.primaryButton, pressed ? styles.primaryButtonPressed : null, !imageSize || busy ? styles.primaryButtonDisabled : null],
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.previewUsePhoto,
    accessibilityState: {
      busy,
      disabled: !imageSize || busy
    },
    testID: "profile-image-preview-confirm"
  }, busy ? /*#__PURE__*/React.createElement(ActivityIndicator, {
    color: resolvedUI.colors.textInverse
  }) : /*#__PURE__*/React.createElement(Text, {
    style: styles.primaryButtonLabel
  }, resolvedUI.strings.previewUsePhoto))));
};
function createStyles(ui) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: ui.colors.background
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    muted: {
      marginTop: spacing.md,
      color: ui.colors.textInverse,
      opacity: 0.7,
      fontFamily: ui.fonts.regular
    },
    errorText: {
      color: ui.colors.textInverse,
      marginBottom: spacing.lg,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      fontFamily: ui.fonts.regular
    },
    topBar: {
      paddingTop: spacing.xxl + spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    iconPlaceholder: {
      width: 84
    },
    title: {
      color: ui.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: ui.fonts.medium
    },
    cropArea: {
      flex: 1,
      paddingVertical: CROP_AREA_VERTICAL_PADDING,
      alignItems: 'center',
      justifyContent: 'center'
    },
    bottomBar: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: ui.colors.textInverse,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cancelButtonPressed: {
      opacity: 0.75
    },
    cancelButtonLabel: {
      color: ui.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: ui.fonts.medium
    },
    secondaryButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.overlay
    },
    secondaryButtonLabel: {
      color: ui.colors.textInverse,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: ui.fonts.medium
    },
    primaryButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.primary,
      alignItems: 'center',
      justifyContent: 'center'
    },
    primaryButtonPressed: {
      opacity: 0.8
    },
    primaryButtonDisabled: {
      opacity: 0.5
    },
    primaryButtonLabel: {
      color: ui.colors.textInverse,
      fontSize: 16,
      fontWeight: '700',
      fontFamily: ui.fonts.bold ?? ui.fonts.medium
    }
  });
}
//# sourceMappingURL=PreviewScreen.js.map