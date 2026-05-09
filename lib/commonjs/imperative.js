"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProfileImagePickerHost = void 0;
exports.openProfileImageCapture = openProfileImageCapture;
exports.openProfileImageGallery = openProfileImageGallery;
exports.openProfileImagePicker = openProfileImagePicker;
var _react = _interopRequireWildcard(require("react"));
var _ProfileImagePicker = require("./ProfileImagePicker");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const TAG = '[react-native-smartcapture-sdk]';
/**
 * Singleton registry. We use the host *handle* itself as a token so that
 * a stale unmount cleanup cannot null out a freshly-registered new host
 * (which can happen during HMR, fast-refresh, or if a consumer
 * accidentally mounts two hosts).
 */
let activeHost = null;
let queuedRequest = null;
function registerHost(host) {
  if (activeHost && activeHost !== host) {
    if (__DEV__) {
      console.warn(`${TAG} Multiple <ProfileImagePickerHost /> instances detected. ` + 'Only one is supported per app — the most recently mounted host ' + 'will receive imperative calls.');
    }
  }
  activeHost = host;
  if (queuedRequest) {
    const next = queuedRequest;
    queuedRequest = null;
    host.open(next);
  }
}
function unregisterHost(host) {
  if (activeHost === host) {
    activeHost = null;
  }
}
function dispatch(payload, label) {
  if (activeHost) {
    activeHost.open(payload);
    return;
  }
  if (__DEV__) {
    console.warn(`${TAG} ${label}() was called before <ProfileImagePickerHost /> ` + 'was mounted. The request will be queued until a host registers. ' + 'If a previous request was still queued, it will be replaced.');
    if (queuedRequest) {
      console.warn(`${TAG} A queued request was overwritten — the previous ` + "callbacks (onSuccess/onCancel/onError) will not be fired.");
    }
  }
  queuedRequest = payload;
}

/**
 * Imperative API — opens the profile image picker (camera flow) programmatically.
 *
 * Requires `<ProfileImagePickerHost />` to be mounted somewhere in the
 * tree (typically near the root, alongside your navigation provider).
 *
 * If the host is not yet mounted (e.g. very early in app startup), the
 * call is queued and fired as soon as a host registers.
 */
function openProfileImagePicker(args) {
  openProfileImageCapture(args);
}

/** Open camera flow directly. */
function openProfileImageCapture(args) {
  dispatch({
    ...args,
    source: 'camera'
  }, 'openProfileImageCapture');
}

/** Open gallery flow directly. */
function openProfileImageGallery(args) {
  dispatch({
    ...args,
    source: 'gallery'
  }, 'openProfileImageGallery');
}

/**
 * Mount this once near the root of your app to enable
 * {@link openProfileImageCapture} / {@link openProfileImageGallery}.
 *
 * If you only ever use the `<ProfileImagePicker />` component directly
 * with a `visible` prop, you do NOT need this host.
 */
const ProfileImagePickerHost = () => {
  const [visible, setVisible] = (0, _react.useState)(false);
  const argsRef = (0, _react.useRef)(null);
  const open = (0, _react.useCallback)(args => {
    if (argsRef.current && __DEV__) {
      console.warn(`${TAG} A new open() request arrived while a previous picker ` + 'flow was still active. The previous callbacks will be ignored.');
    }
    argsRef.current = args;
    setVisible(true);
  }, []);

  // Keep a stable handle reference so register/unregister can identify
  // this host instance precisely.
  const handleRef = (0, _react.useRef)({
    open
  });
  handleRef.current.open = open;
  (0, _react.useEffect)(() => {
    const handle = handleRef.current;
    registerHost(handle);
    return () => {
      unregisterHost(handle);
    };
  }, []);
  const handleClose = (0, _react.useCallback)(() => {
    const a = argsRef.current;
    argsRef.current = null;
    setVisible(false);
    a?.onCancel?.();
  }, []);
  const handleSelected = (0, _react.useCallback)(image => {
    const a = argsRef.current;
    argsRef.current = null;
    setVisible(false);
    a?.onSuccess(image);
  }, []);
  const handleError = (0, _react.useCallback)(err => {
    const a = argsRef.current;
    argsRef.current = null;
    setVisible(false);
    a?.onError?.(err);
  }, []);
  return /*#__PURE__*/_react.default.createElement(_ProfileImagePicker.ProfileImagePicker, {
    visible: visible,
    onClose: handleClose,
    onImageSelected: handleSelected,
    onError: handleError,
    options: argsRef.current?.options,
    source: argsRef.current?.source
  });
};
exports.ProfileImagePickerHost = ProfileImagePickerHost;
//# sourceMappingURL=imperative.js.map