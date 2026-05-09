export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export type PermissionResult = {
  camera: PermissionStatus;
  gallery: PermissionStatus;
  allGranted: boolean;
};
