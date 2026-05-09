"use strict";
'worklet';

/**
 * Clamp `value` between `min` and `max` (inclusive).
 *
 * Marked as a worklet so it can be used inside reanimated `useAnimatedStyle`
 * and gesture handlers without a JS-thread roundtrip.
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = clamp;
function clamp(value, min, max) {
  'worklet';

  return Math.min(Math.max(value, min), max);
}
//# sourceMappingURL=clamp.js.map