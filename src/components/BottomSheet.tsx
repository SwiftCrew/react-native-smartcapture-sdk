import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { radius, spacing } from '../theme';
import { resolveUIConfig, type ResolvedUIConfig } from '../uiConfig';

export type BottomSheetAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

export type BottomSheetProps = {
  visible: boolean;
  title?: string;
  actions: BottomSheetAction[];
  cancelLabel?: string;
  onClose: () => void;
  /**
   * When `true`, render only the overlay (scrim + sheet) without wrapping
   * it in a `Modal`. Use this when the consumer is already inside a
   * `Modal` — wrapping in another `Modal` causes iOS to throw
   * "Attempt to present ... which is already presenting" warnings and
   * blocks the next screen from appearing. Default: `false`.
   */
  embedded?: boolean;
  ui?: ResolvedUIConfig;
};

const ANIM_DURATION = 220;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  title,
  actions,
  cancelLabel = 'Cancel',
  onClose,
  embedded = false,
  ui,
}) => {
  const resolvedUI = React.useMemo(() => ui ?? resolveUIConfig(), [ui]);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, progress]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (1 - progress.value) * 320,
      },
    ],
  }));
  const styles = React.useMemo(() => createStyles(resolvedUI), [resolvedUI]);

  const overlay = (
    <View style={styles.root}>
      <Animated.View style={[styles.scrim, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
        ) : null}

        {actions.map((action, idx) => (
          <Pressable
            key={`${action.label}-${idx}`}
            style={({ pressed }) =>
              [
                styles.action,
                idx > 0 || title ? styles.actionDivider : null,
                pressed ? styles.actionPressed : null,
              ] as ViewStyle[]
            }
            onPress={() => {
              action.onPress();
            }}
            android_ripple={{ color: resolvedUI.colors.surfaceMuted }}
            testID={action.testID}
          >
            <Text
              style={[
                styles.actionLabel,
                action.destructive ? styles.actionDestructive : null,
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) =>
            [styles.cancel, pressed ? styles.actionPressed : null] as ViewStyle[]
          }
          onPress={onClose}
          android_ripple={{ color: resolvedUI.colors.surfaceMuted }}
          testID="profile-image-bottomsheet-cancel"
        >
          <Text style={styles.cancelLabel}>{cancelLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );

  if (embedded) {
    return overlay;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {overlay}
    </Modal>
  );
};

function createStyles(ui: ResolvedUIConfig) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: ui.colors.scrim,
    },
    sheet: {
      backgroundColor: ui.colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: spacing.xl,
      paddingTop: spacing.sm,
    },
    header: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    title: {
      fontSize: 14,
      color: ui.colors.textMuted,
      fontWeight: '500',
      fontFamily: ui.fonts.medium,
    },
    action: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    actionDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: ui.colors.divider,
    },
    actionPressed: {
      backgroundColor: ui.colors.surfaceMuted,
    },
    actionLabel: {
      fontSize: 17,
      color: ui.colors.primary,
      fontWeight: '500',
      fontFamily: ui.fonts.medium,
    },
    actionDestructive: {
      color: ui.colors.danger,
    },
    cancel: {
      marginTop: spacing.sm,
      marginHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      backgroundColor: ui.colors.surfaceMuted,
      borderRadius: radius.md,
    },
    cancelLabel: {
      fontSize: 17,
      color: ui.colors.text,
      fontWeight: '600',
      fontFamily: ui.fonts.bold ?? ui.fonts.medium,
    },
  });
}
