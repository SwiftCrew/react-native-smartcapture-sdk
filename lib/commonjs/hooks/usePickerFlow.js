"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerFlow = usePickerFlow;
var _react = require("react");
/**
 * Tiny state machine driving the picker UI when source is chosen by parent app:
 *   camera  → preview → done
 *   gallery → preview → done
 */
function usePickerFlow(initial = {
  kind: 'camera'
}) {
  const [step, setStep] = (0, _react.useState)(initial);
  const goCamera = (0, _react.useCallback)(() => setStep({
    kind: 'camera'
  }), []);
  const goGalleryLoading = (0, _react.useCallback)(() => setStep({
    kind: 'gallery-loading'
  }), []);
  const goPreview = (0, _react.useCallback)(uri => setStep({
    kind: 'preview',
    uri
  }), []);
  return {
    step,
    goCamera,
    goGalleryLoading,
    goPreview,
    setStep
  };
}
//# sourceMappingURL=usePickerFlow.js.map