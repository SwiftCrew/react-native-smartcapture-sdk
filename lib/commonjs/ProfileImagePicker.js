"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProfileImagePicker = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _components = require("./components");
var _hooks = require("./hooks");
var _uiConfig = require("./uiConfig");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
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
const ProfileImagePicker = ({
  visible,
  onClose,
  onImageSelected,
  onError,
  options,
  source = 'camera'
}) => {
  const resolved = (0, _react.useMemo)(() => ({
    ...DEFAULTS,
    ...(options ?? {})
  }), [options]);
  const ui = (0, _react.useMemo)(() => (0, _uiConfig.resolveUIConfig)(resolved.ui), [resolved.ui]);
  const {
    step,
    goPreview,
    setStep
  } = (0, _hooks.usePickerFlow)(source === 'gallery' ? {
    kind: 'gallery-loading'
  } : {
    kind: 'camera'
  });
  const mountedRef = (0, _react.useRef)(true);
  const galleryRequestedRef = (0, _react.useRef)(false);
  // Tracks the latest `visible` value so async callbacks (e.g. the
  // gallery picker promise) can detect when the consumer has already
  // closed the picker and avoid firing duplicate `onClose` events.
  const visibleRef = (0, _react.useRef)(visible);
  (0, _react.useEffect)(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  (0, _react.useEffect)(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Reset when modal closes; initialize step when it opens.
  (0, _react.useEffect)(() => {
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
  const handleError = (0, _react.useCallback)(err => {
    onError?.(err);
    onClose();
  }, [onError, onClose]);
  const handleGalleryPick = (0, _react.useCallback)(async () => {
    const result = await (0, _components.pickFromGallery)();
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
  (0, _react.useEffect)(() => {
    if (!visible) return;
    if (step.kind !== 'gallery-loading') return;
    if (galleryRequestedRef.current) return;
    galleryRequestedRef.current = true;
    void handleGalleryPick();
  }, [visible, step.kind, handleGalleryPick]);
  const handleConfirm = (0, _react.useCallback)(img => {
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

  return /*#__PURE__*/_react.default.createElement(_reactNative.Modal, {
    visible: visible,
    transparent: true,
    animationType: "fade",
    statusBarTranslucent: true,
    onRequestClose: onClose
  }, /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureHandlerRootView, {
    style: styles.root
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.fullscreen, {
      backgroundColor: ui.colors.background
    }]
  }, step.kind === 'camera' ? /*#__PURE__*/_react.default.createElement(_components.CameraScreen, {
    onCapture: uri => goPreview(uri),
    onCancel: onClose,
    onError: handleError,
    ui: ui,
    initialPosition: resolved.initialCameraPosition,
    enableFlipCamera: resolved.enableFlipCamera,
    enableZoomToggle: resolved.enableZoomToggle,
    flashMode: resolved.flashMode
  }) : step.kind === 'gallery-loading' ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.loadingWrap
  }, /*#__PURE__*/_react.default.createElement(_reactNative.ActivityIndicator, {
    color: ui.colors.textInverse
  })) : /*#__PURE__*/_react.default.createElement(_components.PreviewScreen, {
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
exports.ProfileImagePicker = ProfileImagePicker;
const styles = _reactNative.StyleSheet.create({
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