"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreviewScreen = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _errors = require("../errors");
var _theme = require("../theme");
var _uiConfig = require("../uiConfig");
var _imageEditor = require("../utils/imageEditor");
var _ImageCropper = require("./ImageCropper");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const CROP_AREA_VERTICAL_PADDING = 30;
const PreviewScreen = ({
  uri,
  options,
  onConfirm,
  onRetake,
  onCancel,
  onError,
  ui
}) => {
  const resolvedUI = (0, _react.useMemo)(() => ui ?? (0, _uiConfig.resolveUIConfig)(), [ui]);
  const cropperRef = (0, _react.useRef)(null);
  const mountedRef = (0, _react.useRef)(true);
  const [imageSize, setImageSize] = (0, _react.useState)(null);
  const [busy, setBusy] = (0, _react.useState)(false);
  const [loadError, setLoadError] = (0, _react.useState)(null);
  const initialScreen = (0, _react.useMemo)(() => _reactNative.Dimensions.get('window'), []);
  const [cropAreaSize, setCropAreaSize] = (0, _react.useState)({
    width: initialScreen.width,
    height: Math.max(1, initialScreen.height * 0.5)
  });
  const styles = (0, _react.useMemo)(() => createStyles(resolvedUI), [resolvedUI]);
  (0, _react.useEffect)(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Resolve natural pixel size first — required to compute crop math.
  (0, _react.useEffect)(() => {
    let cancelled = false;
    setLoadError(null);
    setImageSize(null);
    (0, _imageEditor.getImageSize)((0, _imageEditor.normalizeUri)(uri)).then(size => {
      if (!cancelled) setImageSize(size);
    }).catch(err => {
      if (!cancelled) {
        const message = err instanceof _errors.SmartCaptureError ? err.message : err instanceof Error ? err.message : resolvedUI.strings.previewLoadFailed;
        setLoadError(message || resolvedUI.strings.previewLoadFailed);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [uri, resolvedUI.strings.previewLoadFailed]);
  const handleConfirm = (0, _react.useCallback)(async () => {
    if (!cropperRef.current || !imageSize || busy) return;
    try {
      setBusy(true);
      const rect = cropperRef.current.getCropRect();
      const result = await (0, _imageEditor.cropImage)({
        uri: (0, _imageEditor.normalizeUri)(uri),
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
      onError((0, _errors.toSmartCaptureError)(e, 'crop_failed', 'Failed to crop image.'));
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, [busy, imageSize, onConfirm, onError, options, uri]);
  const handleCropAreaLayout = (0, _react.useCallback)(event => {
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
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.root
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.topBar
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.iconPlaceholder
  }), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.title
  }, resolvedUI.strings.previewTitle), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.iconPlaceholder
  })), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.cropArea,
    onLayout: handleCropAreaLayout
  }, loadError ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.center
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.errorText
  }, loadError), /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    onPress: onRetake,
    style: styles.secondaryButton,
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.previewTryAgain,
    testID: "profile-image-preview-retry"
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.secondaryButtonLabel
  }, resolvedUI.strings.previewTryAgain))) : !imageSize ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.center
  }, /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: resolvedUI.colors.textInverse
  }), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.muted
  }, resolvedUI.strings.previewLoading)) : /*#__PURE__*/_react.default.createElement(_ImageCropper.ImageCropper, {
    ref: cropperRef,
    uri: (0, _imageEditor.normalizeUri)(uri),
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
  })), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.bottomBar
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    onPress: onCancel,
    style: ({
      pressed
    }) => [styles.cancelButton, pressed ? styles.cancelButtonPressed : null],
    accessibilityRole: "button",
    accessibilityLabel: resolvedUI.strings.previewCancel,
    testID: "profile-image-preview-cancel"
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cancelButtonLabel
  }, resolvedUI.strings.previewCancel)), /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
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
  }, busy ? /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: resolvedUI.colors.textInverse
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.primaryButtonLabel
  }, resolvedUI.strings.previewUsePhoto))));
};
exports.PreviewScreen = PreviewScreen;
function createStyles(ui) {
  return _reactNative.StyleSheet.create({
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
      marginTop: _theme.spacing.md,
      color: ui.colors.textInverse,
      opacity: 0.7,
      fontFamily: ui.fonts.regular
    },
    errorText: {
      color: ui.colors.textInverse,
      marginBottom: _theme.spacing.lg,
      textAlign: 'center',
      paddingHorizontal: _theme.spacing.lg,
      fontFamily: ui.fonts.regular
    },
    topBar: {
      paddingTop: _theme.spacing.xxl + _theme.spacing.md,
      paddingHorizontal: _theme.spacing.lg,
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
      paddingHorizontal: _theme.spacing.lg,
      paddingBottom: _theme.spacing.xxl,
      paddingTop: _theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: _theme.spacing.md
    },
    cancelButton: {
      flex: 1,
      paddingVertical: _theme.spacing.md,
      borderRadius: _theme.radius.pill,
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
      paddingVertical: _theme.spacing.md,
      paddingHorizontal: _theme.spacing.xl,
      borderRadius: _theme.radius.pill,
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
      paddingVertical: _theme.spacing.md,
      borderRadius: _theme.radius.pill,
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