"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BottomSheet = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _theme = require("../theme");
var _uiConfig = require("../uiConfig");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ANIM_DURATION = 220;
const BottomSheet = ({
  visible,
  title,
  actions,
  cancelLabel = 'Cancel',
  onClose,
  embedded = false,
  ui
}) => {
  const resolvedUI = _react.default.useMemo(() => ui ?? (0, _uiConfig.resolveUIConfig)(), [ui]);
  const progress = (0, _reactNativeReanimated.useSharedValue)(0);
  (0, _react.useEffect)(() => {
    progress.value = (0, _reactNativeReanimated.withTiming)(visible ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.cubic)
    });
  }, [visible, progress]);
  const scrimStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    opacity: progress.value
  }));
  const sheetStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    transform: [{
      translateY: (1 - progress.value) * 320
    }]
  }));
  const styles = _react.default.useMemo(() => createStyles(resolvedUI), [resolvedUI]);
  const overlay = /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.root
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [styles.scrim, scrimStyle]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    style: _reactNative.StyleSheet.absoluteFill,
    onPress: onClose
  })), /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: [styles.sheet, sheetStyle]
  }, title ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.header
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.title
  }, title)) : null, actions.map((action, idx) => /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    key: `${action.label}-${idx}`,
    style: ({
      pressed
    }) => [styles.action, idx > 0 || title ? styles.actionDivider : null, pressed ? styles.actionPressed : null],
    onPress: () => {
      action.onPress();
    },
    android_ripple: {
      color: resolvedUI.colors.surfaceMuted
    },
    testID: action.testID
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: [styles.actionLabel, action.destructive ? styles.actionDestructive : null]
  }, action.label))), /*#__PURE__*/_react.default.createElement(_reactNative.Pressable, {
    style: ({
      pressed
    }) => [styles.cancel, pressed ? styles.actionPressed : null],
    onPress: onClose,
    android_ripple: {
      color: resolvedUI.colors.surfaceMuted
    },
    testID: "profile-image-bottomsheet-cancel"
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.cancelLabel
  }, cancelLabel))));
  if (embedded) {
    return overlay;
  }
  return /*#__PURE__*/_react.default.createElement(_reactNative.Modal, {
    visible: visible,
    transparent: true,
    animationType: "none",
    statusBarTranslucent: true,
    onRequestClose: onClose
  }, overlay);
};
exports.BottomSheet = BottomSheet;
function createStyles(ui) {
  return _reactNative.StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    scrim: {
      ..._reactNative.StyleSheet.absoluteFillObject,
      backgroundColor: ui.colors.scrim
    },
    sheet: {
      backgroundColor: ui.colors.surface,
      borderTopLeftRadius: _theme.radius.lg,
      borderTopRightRadius: _theme.radius.lg,
      paddingBottom: _theme.spacing.xl,
      paddingTop: _theme.spacing.sm
    },
    header: {
      paddingVertical: _theme.spacing.md,
      paddingHorizontal: _theme.spacing.lg,
      alignItems: 'center'
    },
    title: {
      fontSize: 14,
      color: ui.colors.textMuted,
      fontWeight: '500',
      fontFamily: ui.fonts.medium
    },
    action: {
      paddingVertical: _theme.spacing.lg,
      paddingHorizontal: _theme.spacing.lg,
      alignItems: 'center'
    },
    actionDivider: {
      borderTopWidth: _reactNative.StyleSheet.hairlineWidth,
      borderTopColor: ui.colors.divider
    },
    actionPressed: {
      backgroundColor: ui.colors.surfaceMuted
    },
    actionLabel: {
      fontSize: 17,
      color: ui.colors.primary,
      fontWeight: '500',
      fontFamily: ui.fonts.medium
    },
    actionDestructive: {
      color: ui.colors.danger
    },
    cancel: {
      marginTop: _theme.spacing.sm,
      marginHorizontal: _theme.spacing.md,
      paddingVertical: _theme.spacing.lg,
      alignItems: 'center',
      backgroundColor: ui.colors.surfaceMuted,
      borderRadius: _theme.radius.md
    },
    cancelLabel: {
      fontSize: 17,
      color: ui.colors.text,
      fontWeight: '600',
      fontFamily: ui.fonts.bold ?? ui.fonts.medium
    }
  });
}
//# sourceMappingURL=BottomSheet.js.map