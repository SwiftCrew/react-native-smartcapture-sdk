import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { radius, spacing } from '../theme';
import { resolveUIConfig } from '../uiConfig';
const ANIM_DURATION = 220;
export const BottomSheet = ({
  visible,
  title,
  actions,
  cancelLabel = 'Cancel',
  onClose,
  embedded = false,
  ui
}) => {
  const resolvedUI = React.useMemo(() => ui ?? resolveUIConfig(), [ui]);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.cubic)
    });
  }, [visible, progress]);
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: (1 - progress.value) * 320
    }]
  }));
  const styles = React.useMemo(() => createStyles(resolvedUI), [resolvedUI]);
  const overlay = /*#__PURE__*/React.createElement(View, {
    style: styles.root
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.scrim, scrimStyle]
  }, /*#__PURE__*/React.createElement(Pressable, {
    style: StyleSheet.absoluteFill,
    onPress: onClose
  })), /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.sheet, sheetStyle]
  }, title ? /*#__PURE__*/React.createElement(View, {
    style: styles.header
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.title
  }, title)) : null, actions.map((action, idx) => /*#__PURE__*/React.createElement(Pressable, {
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
  }, /*#__PURE__*/React.createElement(Text, {
    style: [styles.actionLabel, action.destructive ? styles.actionDestructive : null]
  }, action.label))), /*#__PURE__*/React.createElement(Pressable, {
    style: ({
      pressed
    }) => [styles.cancel, pressed ? styles.actionPressed : null],
    onPress: onClose,
    android_ripple: {
      color: resolvedUI.colors.surfaceMuted
    },
    testID: "profile-image-bottomsheet-cancel"
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.cancelLabel
  }, cancelLabel))));
  if (embedded) {
    return overlay;
  }
  return /*#__PURE__*/React.createElement(Modal, {
    visible: visible,
    transparent: true,
    animationType: "none",
    statusBarTranslucent: true,
    onRequestClose: onClose
  }, overlay);
};
function createStyles(ui) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end'
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: ui.colors.scrim
    },
    sheet: {
      backgroundColor: ui.colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: spacing.xl,
      paddingTop: spacing.sm
    },
    header: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center'
    },
    title: {
      fontSize: 14,
      color: ui.colors.textMuted,
      fontWeight: '500',
      fontFamily: ui.fonts.medium
    },
    action: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      alignItems: 'center'
    },
    actionDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
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
      marginTop: spacing.sm,
      marginHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      backgroundColor: ui.colors.surfaceMuted,
      borderRadius: radius.md
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