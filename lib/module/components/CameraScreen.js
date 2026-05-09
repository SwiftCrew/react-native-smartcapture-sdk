import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Svg, { Path } from 'react-native-svg';
import { SmartCaptureError, toSmartCaptureError } from '../errors';
import { radius, spacing } from '../theme';
import { resolveUIConfig } from '../uiConfig';
const ZOOM_OPTIONS = [1, 2];
/**
 * Front/back switch — camera body with curved swap arrows
 * (the standard iOS / Android "switch camera" affordance).
 */
function FlipCameraIcon({
  color,
  size
}) {
  return /*#__PURE__*/React.createElement(Svg, {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants"
  }, /*#__PURE__*/React.createElement(Path, {
    d: "M9 8 L10.2 6 H13.8 L15 8 H18 A2 2 0 0 1 20 10 V15 A2 2 0 0 1 18 17 H6 A2 2 0 0 1 4 15 V10 A2 2 0 0 1 6 8 Z",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement(Path, {
    d: "M9 13 A3 3 0 0 1 14 11",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement(Path, {
    d: "M15 13 A3 3 0 0 1 10 15",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement(Path, {
    d: "M14 11 L14 9.4 M14 11 L15.5 11",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement(Path, {
    d: "M10 15 L10 16.6 M10 15 L8.5 15",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }));
}
export const CameraScreen = ({
  onCapture,
  onCancel,
  onError,
  ui,
  initialPosition = 'front',
  enableFlipCamera = true,
  enableZoomToggle = true,
  flashMode = 'off'
}) => {
  const resolvedUI = useMemo(() => ui ?? resolveUIConfig(), [ui]);
  const cameraRef = useRef(null);
  const mountedRef = useRef(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Try the requested position first; if no device exists for it,
  // try the other side. This covers emulators / kiosks that have only
  // one physical camera.
  const primary = useCameraDevice(position);
  const fallbackPosition = position === 'front' ? 'back' : 'front';
  const secondary = useCameraDevice(fallbackPosition);
  const device = primary ?? secondary;
  const effectivePosition = primary ? position : secondary ? fallbackPosition : position;
  const flipAvailable = !!primary && !!secondary;
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const zoom = useMemo(() => {
    if (!device) return 1;
    const min = device.minZoom ?? 1;
    const max = device.maxZoom ?? 1;
    const target = zoomLevel * (device.neutralZoom ?? 1);
    return Math.min(Math.max(target, min), max);
  }, [device, zoomLevel]);
  const styles = useMemo(() => createStyles(resolvedUI), [resolvedUI]);
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash: flashMode,
        enableShutterSound: false
      });
      if (!mountedRef.current) return;
      const path = photo?.path;
      if (!path) {
        onError(new SmartCaptureError('camera_capture_failed', 'Camera returned no file path.'));
        return;
      }
      const uri = path.startsWith('file://') ? path : `file://${path}`;
      onCapture(uri);
    } catch (e) {
      if (!mountedRef.current) return;
      onError(toSmartCaptureError(e, 'camera_capture_failed', 'Failed to capture photo.'));
    } finally {
      if (mountedRef.current) setIsCapturing(false);
    }
  }, [isCapturing, flashMode, onCapture, onError]);
  const handleFlip = useCallback(() => {
    if (isCapturing || !flipAvailable) return;
    setPosition(p => p === 'front' ? 'back' : 'front');
  }, [isCapturing, flipAvailable]);

  // No device at all (and nothing on the other side either) — surface
  // the unavailable state instead of spinning forever.
  if (!device) {
    return /*#__PURE__*/React.createElement(View, {
      style: [styles.root, styles.center]
    }, /*#__PURE__*/React.createElement(ActivityIndicator, {
      color: resolvedUI.colors.textInverse
    }), /*#__PURE__*/React.createElement(Text, {
      style: styles.muted
    }, resolvedUI.strings.cameraPreparing), /*#__PURE__*/React.createElement(Text, {
      style: [styles.muted, styles.subtle]
    }, resolvedUI.strings.cameraDeviceUnavailable), /*#__PURE__*/React.createElement(Pressable, {
      onPress: onCancel,
      hitSlop: 12,
      style: styles.iconButton,
      accessibilityRole: "button",
      accessibilityLabel: resolvedUI.strings.cameraCancel,
      testID: "profile-image-camera-cancel-fallback"
    }, /*#__PURE__*/React.createElement(Text, {
      style: styles.iconText
    }, resolvedUI.strings.cameraCancel)));
  }
  const showFlip = enableFlipCamera && flipAvailable;
  const dim = resolvedUI.dimensions;
  return /*#__PURE__*/React.createElement(View, {
    style: styles.root
  }, /*#__PURE__*/React.createElement(Camera, {
    ref: cameraRef,
    style: StyleSheet.absoluteFill,
    device: device,
    isActive: true,
    photo: true,
    zoom: zoom
  }), /*#__PURE__*/React.createElement(View, {
    style: styles.topBar
  }, /*#__PURE__*/React.createElement(Pressable, {
    onPress: onCancel,
    hitSlop: 12,
    style: styles.iconButton,
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.cameraCancel,
    testID: "profile-image-camera-cancel"
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.iconText
  }, resolvedUI.strings.cameraCancel))), enableZoomToggle ? /*#__PURE__*/React.createElement(View, {
    style: styles.zoomRow
  }, ZOOM_OPTIONS.map(z => {
    const active = z === zoomLevel;
    return /*#__PURE__*/React.createElement(Pressable, {
      key: z,
      onPress: () => setZoomLevel(z),
      disabled: isCapturing,
      accessibilityRole: "button",
      accessibilityLabel: `${resolvedUI.strings.cameraZoom} ${z}x`,
      accessibilityState: {
        selected: active
      },
      style: [styles.zoomChip, active ? styles.zoomChipActive : null]
    }, /*#__PURE__*/React.createElement(Text, {
      style: [styles.zoomLabel, active ? styles.zoomLabelActive : null]
    }, z, "x"));
  })) : null, /*#__PURE__*/React.createElement(View, {
    style: styles.bottomBar
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.bottomSlot
  }), /*#__PURE__*/React.createElement(Pressable, {
    onPress: handleCapture,
    disabled: isCapturing,
    style: ({
      pressed
    }) => [{
      width: dim.shutterSize,
      height: dim.shutterSize,
      borderRadius: dim.shutterSize / 2
    }, styles.shutter, pressed ? styles.shutterPressed : null, isCapturing ? styles.shutterDisabled : null],
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.cameraShutter,
    accessibilityState: {
      busy: isCapturing
    },
    testID: "profile-image-camera-shutter"
  }, /*#__PURE__*/React.createElement(View, {
    style: [styles.shutterInner, {
      width: dim.shutterSize - 16,
      height: dim.shutterSize - 16,
      borderRadius: (dim.shutterSize - 16) / 2
    }]
  })), /*#__PURE__*/React.createElement(View, {
    style: styles.bottomSlot
  }, showFlip ? /*#__PURE__*/React.createElement(Pressable, {
    onPress: handleFlip,
    hitSlop: 12,
    disabled: isCapturing,
    style: [styles.flipButton, {
      width: dim.iconButtonSize,
      height: dim.iconButtonSize,
      opacity: isCapturing ? 0.4 : 1
    }],
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.cameraFlip,
    accessibilityState: {
      disabled: isCapturing,
      selected: effectivePosition === 'front'
    },
    testID: "profile-image-camera-flip"
  }, /*#__PURE__*/React.createElement(FlipCameraIcon, {
    color: resolvedUI.colors.textInverse,
    size: dim.iconSize
  })) : null)), isCapturing ? /*#__PURE__*/React.createElement(View, {
    style: styles.loaderOverlay,
    pointerEvents: "none"
  }, /*#__PURE__*/React.createElement(ActivityIndicator, {
    color: resolvedUI.colors.textInverse,
    size: "large"
  })) : null);
};
function createStyles(ui) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: ui.colors.background
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    muted: {
      marginTop: spacing.md,
      color: ui.colors.textInverse,
      opacity: 0.7,
      fontFamily: ui.fonts.regular
    },
    subtle: {
      marginTop: spacing.xs,
      opacity: 0.55,
      fontSize: 13
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: spacing.xxl + spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    iconButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.overlay
    },
    flipButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      minWidth: 44,
      minHeight: 44,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconText: {
      color: ui.colors.textInverse,
      fontSize: 15,
      fontWeight: '600',
      fontFamily: ui.fonts.medium
    },
    zoomRow: {
      position: 'absolute',
      bottom: 160,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm
    },
    zoomChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: ui.colors.overlay,
      minWidth: 44,
      alignItems: 'center'
    },
    zoomChipActive: {
      backgroundColor: ui.colors.surface
    },
    zoomLabel: {
      color: ui.colors.textInverse,
      fontWeight: '600',
      fontSize: 13,
      fontFamily: ui.fonts.medium
    },
    zoomLabelActive: {
      color: ui.colors.text
    },
    bottomBar: {
      position: 'absolute',
      bottom: spacing.xxl,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl
    },
    bottomSlot: {
      width: 64,
      alignItems: 'center'
    },
    shutter: {
      borderWidth: 4,
      borderColor: ui.colors.textInverse,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent'
    },
    shutterPressed: {
      transform: [{
        scale: 0.95
      }]
    },
    shutterDisabled: {
      opacity: 0.6
    },
    shutterInner: {
      backgroundColor: ui.colors.textInverse
    },
    loaderOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ui.colors.loaderOverlay
    }
  });
}
//# sourceMappingURL=CameraScreen.js.map