'worklet';

/**
 * Clamp `value` between `min` and `max` (inclusive).
 *
 * Marked as a worklet so it can be used inside reanimated `useAnimatedStyle`
 * and gesture handlers without a JS-thread roundtrip.
 */
export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}
