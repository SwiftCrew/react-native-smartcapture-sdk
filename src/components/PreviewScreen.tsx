import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SmartCaptureError, toSmartCaptureError } from '../errors';
import { radius, spacing } from '../theme';
import type { ProfileImageResult, ProfileImagePickerOptions } from '../types';
import { resolveUIConfig, type ResolvedUIConfig } from '../uiConfig';
import { cropImage, getImageSize, normalizeUri } from '../utils/imageEditor';
import { ImageCropper, type ImageCropperHandle } from './ImageCropper';

const CROP_AREA_VERTICAL_PADDING = 30;

export type PreviewScreenProps = {
  uri: string;
  options: Required<
    Pick<
      ProfileImagePickerOptions,
      'compression' | 'maxOutputSize' | 'enableBase64' | 'cropShape'
    >
  >;
  onConfirm: (result: ProfileImageResult) => void;
  onRetake: () => void;
  onCancel: () => void;
  onError: (error: Error) => void;
  ui?: ResolvedUIConfig;
};

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  uri,
  options,
  onConfirm,
  onRetake,
  onCancel,
  onError,
  ui,
}) => {
  const resolvedUI = useMemo(() => ui ?? resolveUIConfig(), [ui]);
  const cropperRef = useRef<ImageCropperHandle>(null);
  const mountedRef = useRef(true);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const initialScreen = useMemo(() => Dimensions.get('window'), []);
  const [cropAreaSize, setCropAreaSize] = useState({
    width: initialScreen.width,
    height: Math.max(1, initialScreen.height * 0.5),
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
    getImageSize(normalizeUri(uri))
      .then((size) => {
        if (!cancelled) setImageSize(size);
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof SmartCaptureError
              ? err.message
              : err instanceof Error
                ? err.message
                : resolvedUI.strings.previewLoadFailed;
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
        includeBase64: options.enableBase64,
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

  const handleCropAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCropAreaSize({
        width,
        height: Math.max(1, height - CROP_AREA_VERTICAL_PADDING * 2),
      });
    }
  }, []);

  const dim = resolvedUI.dimensions;

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.iconPlaceholder} />
        <Text style={styles.title}>{resolvedUI.strings.previewTitle}</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      {/* Cropper */}
      <View style={styles.cropArea} onLayout={handleCropAreaLayout}>
        {loadError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable
              onPress={onRetake}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel={resolvedUI.strings.previewTryAgain}
              testID="profile-image-preview-retry"
            >
              <Text style={styles.secondaryButtonLabel}>
                {resolvedUI.strings.previewTryAgain}
              </Text>
            </Pressable>
          </View>
        ) : !imageSize ? (
          <View style={styles.center}>
            <ActivityIndicator color={resolvedUI.colors.textInverse} />
            <Text style={styles.muted}>{resolvedUI.strings.previewLoading}</Text>
          </View>
        ) : (
          <ImageCropper
            ref={cropperRef}
            uri={normalizeUri(uri)}
            imageWidth={imageSize.width}
            imageHeight={imageSize.height}
            viewportWidth={cropAreaSize.width}
            viewportHeight={cropAreaSize.height}
            shape={options.cropShape}
            overlayColor={resolvedUI.colors.overlay}
            strokeColor={resolvedUI.colors.overlayStroke}
            strokeWidth={dim.overlayStrokeWidth}
            backgroundColor={resolvedUI.colors.background}
            rectangleAspectRatio={dim.rectangleAspectRatio}
            rectangleHorizontalInset={dim.rectangleHorizontalInset}
            circleDiameterRatio={dim.circleDiameterRatio}
          />
        )}
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed ? styles.cancelButtonPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={resolvedUI.strings.previewCancel}
          testID="profile-image-preview-cancel"
        >
          <Text style={styles.cancelButtonLabel}>
            {resolvedUI.strings.previewCancel}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleConfirm}
          disabled={!imageSize || busy}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed ? styles.primaryButtonPressed : null,
            !imageSize || busy ? styles.primaryButtonDisabled : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={resolvedUI.strings.previewUsePhoto}
          accessibilityState={{ busy, disabled: !imageSize || busy }}
          testID="profile-image-preview-confirm"
        >
          {busy ? (
            <ActivityIndicator color={resolvedUI.colors.textInverse} />
          ) : (
            <Text style={styles.primaryButtonLabel}>
              {resolvedUI.strings.previewUsePhoto}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

function createStyles(ui: ResolvedUIConfig) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: ui.colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    muted: {
      marginTop: spacing.md,
      color: ui.colors.textInverse,
      opacity: 0.7,
      fontFamily: ui.fonts.regular,
    },
    errorText: {
      color: ui.colors.textInverse,
      marginBottom: spacing.lg,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      fontFamily: ui.fonts.regular,
    },
    topBar: {
      paddingTop: spacing.xxl + spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconPlaceholder: {
      width: 84,
    },
    title: {
      color: ui.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: ui.fonts.medium,
    },
    cropArea: {
      flex: 1,
      paddingVertical: CROP_AREA_VERTICAL_PADDING,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomBar: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: ui.colors.textInverse,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonPressed: {
      opacity: 0.75,
    },
    cancelButtonLabel: {
      color: ui.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: ui.fonts.medium,
    },
    secondaryButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.overlay,
    },
    secondaryButtonLabel: {
      color: ui.colors.textInverse,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: ui.fonts.medium,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonPressed: {
      opacity: 0.8,
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },
    primaryButtonLabel: {
      color: ui.colors.textInverse,
      fontSize: 16,
      fontWeight: '700',
      fontFamily: ui.fonts.bold ?? ui.fonts.medium,
    },
  });
}
