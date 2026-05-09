/**
 * Clamp `value` between `min` and `max` (inclusive).
 *
 * Marked as a worklet so it can be used inside reanimated `useAnimatedStyle`
 * and gesture handlers without a JS-thread roundtrip.
 */
export declare function clamp(value: number, min: number, max: number): number;
//# sourceMappingURL=clamp.d.ts.map