import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProfileImagePicker } from './ProfileImagePicker';
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
export function openProfileImagePicker(args) {
  openProfileImageCapture(args);
}

/** Open camera flow directly. */
export function openProfileImageCapture(args) {
  dispatch({
    ...args,
    source: 'camera'
  }, 'openProfileImageCapture');
}

/** Open gallery flow directly. */
export function openProfileImageGallery(args) {
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
export const ProfileImagePickerHost = () => {
  const [visible, setVisible] = useState(false);
  const argsRef = useRef(null);
  const open = useCallback(args => {
    if (argsRef.current && __DEV__) {
      console.warn(`${TAG} A new open() request arrived while a previous picker ` + 'flow was still active. The previous callbacks will be ignored.');
    }
    argsRef.current = args;
    setVisible(true);
  }, []);

  // Keep a stable handle reference so register/unregister can identify
  // this host instance precisely.
  const handleRef = useRef({
    open
  });
  handleRef.current.open = open;
  useEffect(() => {
    const handle = handleRef.current;
    registerHost(handle);
    return () => {
      unregisterHost(handle);
    };
  }, []);
  const handleClose = useCallback(() => {
    const a = argsRef.current;
    argsRef.current = null;
    setVisible(false);
    a?.onCancel?.();
  }, []);
  const handleSelected = useCallback(image => {
    const a = argsRef.current;
    argsRef.current = null;
    setVisible(false);
    a?.onSuccess(image);
  }, []);
  const handleError = useCallback(err => {
    const a = argsRef.current;
    argsRef.current = null;
    setVisible(false);
    a?.onError?.(err);
  }, []);
  return /*#__PURE__*/React.createElement(ProfileImagePicker, {
    visible: visible,
    onClose: handleClose,
    onImageSelected: handleSelected,
    onError: handleError,
    options: argsRef.current?.options,
    source: argsRef.current?.source
  });
};
//# sourceMappingURL=imperative.js.map