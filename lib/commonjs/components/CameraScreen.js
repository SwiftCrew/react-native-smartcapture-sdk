"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CameraScreen = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeVisionCamera = require("react-native-vision-camera");
var _reactNativeSvg = _interopRequireWildcard(require("react-native-svg"));
var _errors = require("../errors");
var _theme = require("../theme");
var _uiConfig = require("../uiConfig");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ZOOM_OPTIONS = [1, 2];
/**
 * Front/back switch — camera body with curved swap arrows
 * (the standard iOS / Android "switch camera" affordance).
 */
function FlipCameraIcon({
  color,
  size
}) {
  return /*#__PURE__*/_react.default.createElement(_reactNativeSvg.default, {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants"
  }, /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
    d: "M9 8 L10.2 6 H13.8 L15 8 H18 A2 2 0 0 1 20 10 V15 A2 2 0 0 1 18 17 H6 A2 2 0 0 1 4 15 V10 A2 2 0 0 1 6 8 Z",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
    d: "M9 13 A3 3 0 0 1 14 11",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }), /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
    d: "M15 13 A3 3 0 0 1 10 15",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }), /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
    d: "M14 11 L14 9.4 M14 11 L15.5 11",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }), /*#__PURE__*/_react.default.createElement(_reactNativeSvg.Path, {
    d: "M10 15 L10 16.6 M10 15 L8.5 15",
    fill: "none",
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round"
  }));
}
const CameraScreen = ({
  onCapture,
  onCancel,
  onError,
  ui,
  initialPosition = 'front',
  enableFlipCamera = true,
  enableZoomToggle = true,
  flashMode = 'off'
}) => {
  const resolvedUI = (0, _react.useMemo)(() => ui ?? (0, _uiConfig.resolveUIConfig)(), [ui]);
  const cameraRef = (0, _react.useRef)(null);
  const mountedRef = (0, _react.useRef)(true);
  const [isCapturing, setIsCapturing] = (0, _react.useState)(false);
  const [position, setPosition] = (0, _react.useState)(initialPosition);
  const [zoomLevel, setZoomLevel] = (0, _react.useState)(1);

  // Try the requested position first; if no device exists for it,
  // try the other side. This covers emulators / kiosks that have only
  // one physical camera.
  const primary = (0, _reactNativeVisionCamera.useCameraDevice)(position);
  const fallbackPosition = position === 'front' ? 'back' : 'front';
  const secondary = (0, _reactNativeVisionCamera.useCameraDevice)(fallbackPosition);
  const device = primary ?? secondary;
  const effectivePosition = primary ? position : secondary ? fallbackPosition : position;
  const flipAvailable = !!primary && !!secondary;
  (0, _react.useEffect)(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const zoom = (0, _react.useMemo)(() => {
    if (!device) return 1;
    const min = device.minZoom ?? 1;
    const max = device.maxZoom ?? 1;
    const target = zoomLevel * (device.neutralZoom ?? 1);
    return Math.min(Math.max(target, min), max);
  }, [device, zoomLevel]);
  const styles = (0, _react.useMemo)(() => createStyles(resolvedUI), [resolvedUI]);
  const handleCapture = (0, _react.useCallback)(async () => {
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
        onError(new _errors.SmartCaptureError('camera_capture_failed', 'Camera returned no file path.'));
        return;
      }
      const uri = path.startsWith('file://') ? path : `file://${path}`;
      onCapture(uri);
    } catch (e) {
      if (!mountedRef.current) return;
      onError((0, _errors.toSmartCaptureError)(e, 'camera_capture_failed', 'Failed to capture photo.'));
    } finally {
      if (mountedRef.current) setIsCapturing(false);
    }
  }, [isCapturing, flashMode, onCapture, onError]);
  const handleFlip = (0, _react.useCallback)(() => {
    if (isCapturing || !flipAvailable) return;
    setPosition(p => p === 'front' ? 'back' : 'front');
  }, [isCapturing, flipAvailable]);

  // No device at all (and nothing on the other side either) — surface
  // the unavailable state instead of spinning forever.
  if (!device) {
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: [styles.root, styles.center]
    }, /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
      color: resolvedUI.colors.textInverse
    }), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.muted
    }, resolvedUI.strings.cameraPreparing), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: [styles.muted, styles.subtle]
    }, resolvedUI.strings.cameraDeviceUnavailable), /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
      onPress: onCancel,
      hitSlop: 12,
      style: styles.iconButton,
      accessibilityRole: "button",
      accessibilityLabel: resolvedUI.strings.cameraCancel,
      testID: "profile-image-camera-cancel-fallback"
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.iconText
    }, resolvedUI.strings.cameraCancel)));
  }
  const showFlip = enableFlipCamera && flipAvailable;
  const dim = resolvedUI.dimensions;
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.root
  }, /*#__PURE__*/_react.default.createElement(_reactNativeVisionCamera.Camera, {
    ref: cameraRef,
    style: _reactNative.StyleSheet.absoluteFill,
    device: device,
    isActive: true,
    photo: true,
    zoom: zoom
  }), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.topBar
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    onPress: onCancel,
    hitSlop: 12,
    style: styles.iconButton,
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.cameraCancel,
    testID: "profile-image-camera-cancel"
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.iconText
  }, resolvedUI.strings.cameraCancel))), enableZoomToggle ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.zoomRow
  }, ZOOM_OPTIONS.map(z => {
    const active = z === zoomLevel;
    return /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
      key: z,
      onPress: () => setZoomLevel(z),
      disabled: isCapturing,
      accessibilityRole: "button",
      accessibilityLabel: `${resolvedUI.strings.cameraZoom} ${z}x`,
      accessibilityState: {
        selected: active
      },
      style: [styles.zoomChip, active ? styles.zoomChipActive : null]
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: [styles.zoomLabel, active ? styles.zoomLabelActive : null]
    }, z, "x"));
  })) : null, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.bottomBar
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.bottomSlot
  }), /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
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
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.shutterInner, {
      width: dim.shutterSize - 16,
      height: dim.shutterSize - 16,
      borderRadius: (dim.shutterSize - 16) / 2
    }]
  })), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.bottomSlot
  }, showFlip ? /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
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
  }, /*#__PURE__*/_react.default.createElement(FlipCameraIcon, {
    color: resolvedUI.colors.textInverse,
    size: dim.iconSize
  })) : null)), isCapturing ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.loaderOverlay,
    pointerEvents: "none"
  }, /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: resolvedUI.colors.textInverse,
    size: "large"
  })) : null);
};
exports.CameraScreen = CameraScreen;
function createStyles(ui) {
  return _reactNative.StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: ui.colors.background
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    muted: {
      marginTop: _theme.spacing.md,
      color: ui.colors.textInverse,
      opacity: 0.7,
      fontFamily: ui.fonts.regular
    },
    subtle: {
      marginTop: _theme.spacing.xs,
      opacity: 0.55,
      fontSize: 13
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: _theme.spacing.xxl + _theme.spacing.md,
      paddingHorizontal: _theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    iconButton: {
      paddingVertical: _theme.spacing.sm,
      paddingHorizontal: _theme.spacing.md,
      borderRadius: _theme.radius.pill,
      backgroundColor: ui.colors.overlay
    },
    flipButton: {
      paddingVertical: _theme.spacing.sm,
      paddingHorizontal: _theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      borderRadius: _theme.radius.pill,
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
      gap: _theme.spacing.sm
    },
    zoomChip: {
      paddingHorizontal: _theme.spacing.md,
      paddingVertical: _theme.spacing.xs,
      borderRadius: _theme.radius.pill,
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
      bottom: _theme.spacing.xxl,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: _theme.spacing.xl
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
      ..._reactNative.StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ui.colors.loaderOverlay
    }
  });
}
//# sourceMappingURL=CameraScreen.js.map