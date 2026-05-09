import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ProfileImagePickerHost,
  SmartCaptureError,
  ensureAllPermissions,
  openProfileImageCapture,
  openProfileImageGallery,
  openSettings,
  type PermissionResult,
  type ProfileImageResult,
} from 'react-native-smartcapture-sdk';

const PALETTE = {
  bg: '#F6F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#0A84FF',
  danger: '#FF3B30',
  initials: '#94A3B8',
};

const USER_NAME = 'Ada Lovelace';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function App() {
  const [image, setImage] = useState<ProfileImageResult | null>(null);
  const [perms, setPerms] = useState<PermissionResult | null>(null);
  const [shape, setShape] = useState<'circle' | 'rectangle'>('circle');

  const openSourcePicker = useCallback(() => {
    Alert.alert('Select source', 'Choose how you want to add your profile picture.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take Photo',
        onPress: () => {
          openProfileImageCapture({
            onSuccess: (img) => setImage(img),
            onCancel: () => {},
            onError: (err) => {
              const msg =
                err instanceof SmartCaptureError
                  ? `${err.message}\n(${err.code})`
                  : err.message;
              Alert.alert('Something went wrong', msg);
            },
            options: {
              enableBase64: false,
              cropShape: shape,
              compression: 0.85,
              maxOutputSize: 1024,
              ui: {
                strings: {
                  previewTitle: 'Preview Image',
                  previewUsePhoto: 'Use Photo',
                },
              },
            },
          });
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          openProfileImageGallery({
            onSuccess: (img) => setImage(img),
            onCancel: () => {},
            onError: (err) => {
              const msg =
                err instanceof SmartCaptureError
                  ? `${err.message}\n(${err.code})`
                  : err.message;
              Alert.alert('Something went wrong', msg);
            },
            options: {
              enableBase64: false,
              cropShape: shape,
              compression: 0.85,
              maxOutputSize: 1024,
              ui: {
                strings: {
                  previewTitle: 'Preview Image',
                  previewUsePhoto: 'Use Photo',
                },
              },
            },
          });
        },
      },
    ]);
  }, [shape]);

  const openPicker = useCallback(async () => {
    const result = await ensureAllPermissions();
    setPerms(result);

    if (!result.allGranted) {
      // Both denied / blocked — show a custom UI rather than auto-launching.
      const blocked =
        result.camera === 'blocked' || result.gallery === 'blocked';

      Alert.alert(
        'Permission required',
        blocked
          ? 'Camera and photo permissions are required. Please enable them in Settings.'
          : 'We need camera and photo permissions to set your profile picture.',
        blocked
          ? [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => openSettings() },
            ]
          : [{ text: 'OK' }],
      );
      return;
    }

    openSourcePicker();
  }, [openSourcePicker]);

  const removeImage = useCallback(() => setImage(null), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={PALETTE.bg} />

        <View style={styles.content}>
          <Text style={styles.heading}>Smart Capture Example</Text>
          <Text style={styles.subheading}>
            Demo of {Platform.OS === 'ios' ? 'iOS' : 'Android'} profile photo
            capture, gallery picking and circular crop.
          </Text>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {image ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>
                  {getInitials(USER_NAME)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>{USER_NAME}</Text>

          <View style={styles.shapeCard}>
            <Text style={styles.shapeTitle}>Crop shape</Text>
            <View style={styles.shapeRow}>
              <Pressable
                onPress={() => setShape('circle')}
                style={[
                  styles.shapeChip,
                  shape === 'circle' ? styles.shapeChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.shapeChipLabel,
                    shape === 'circle' ? styles.shapeChipLabelActive : null,
                  ]}
                >
                  Circle
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShape('rectangle')}
                style={[
                  styles.shapeChip,
                  shape === 'rectangle' ? styles.shapeChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.shapeChipLabel,
                    shape === 'rectangle' ? styles.shapeChipLabelActive : null,
                  ]}
                >
                  Rectangle
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Primary CTA */}
          <Pressable
            onPress={openPicker}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.primaryButtonPressed : null,
            ]}
            testID="example-upload-button"
          >
            <Text style={styles.primaryButtonLabel}>
              {image ? 'Change Profile Picture' : 'Upload Profile Picture'}
            </Text>
          </Pressable>

          {image ? (
            <Pressable
              onPress={removeImage}
              style={styles.dangerButton}
              testID="example-remove-button"
            >
              <Text style={styles.dangerButtonLabel}>Remove Profile Picture</Text>
            </Pressable>
          ) : null}

          {/* Permission status panel — useful while developing */}
          {perms ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Permission status</Text>
              <Row label="Camera" value={perms.camera} />
              <Row label="Gallery" value={perms.gallery} />
              {!perms.allGranted ? (
                <Pressable
                  onPress={() => openSettings()}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkLabel}>Open Settings →</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Text style={styles.tip}>
              Tap the button — we'll request permissions before opening the
              picker.
            </Text>
          )}

          {image ? (
            <View style={styles.metaCard}>
              <Text style={styles.metaTitle}>Last result</Text>
              <Meta label="uri" value={image.uri} />
              {image.fileName ? (
                <Meta label="fileName" value={image.fileName} />
              ) : null}
              {image.type ? <Meta label="type" value={image.type} /> : null}
              {image.width && image.height ? (
                <Meta
                  label="size"
                  value={`${image.width} × ${image.height} px`}
                />
              ) : null}
            </View>
          ) : null}
        </View>

        {/* MUST be mounted once for openProfileImagePicker() to work */}
        <ProfileImagePickerHost />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        value === 'granted' && { color: '#16A34A' },
        value === 'denied' && { color: PALETTE.danger },
        value === 'blocked' && { color: PALETTE.danger },
      ]}
    >
      {value}
    </Text>
  </View>
);

const Meta: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: PALETTE.text,
    marginTop: 16,
  },
  subheading: {
    fontSize: 14,
    color: PALETTE.muted,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  avatarWrap: {
    marginTop: 32,
    marginBottom: 12,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: PALETTE.card,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: PALETTE.initials,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: PALETTE.text,
    marginTop: 4,
    marginBottom: 24,
  },
  shapeCard: {
    width: '100%',
    backgroundColor: PALETTE.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 12,
    marginBottom: 16,
  },
  shapeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  shapeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shapeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  shapeChipActive: {
    borderColor: PALETTE.primary,
    backgroundColor: '#E8F2FF',
  },
  shapeChipLabel: {
    color: PALETTE.muted,
    fontWeight: '600',
  },
  shapeChipLabelActive: {
    color: PALETTE.primary,
  },
  primaryButton: {
    backgroundColor: PALETTE.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    minWidth: 240,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dangerButtonLabel: {
    color: PALETTE.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  tip: {
    marginTop: 20,
    color: PALETTE.muted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  statusCard: {
    marginTop: 28,
    width: '100%',
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    color: PALETTE.muted,
    fontSize: 14,
  },
  rowValue: {
    color: PALETTE.text,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    marginLeft: 12,
    textAlign: 'right',
  },
  linkButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  linkLabel: {
    color: PALETTE.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  metaCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
});
