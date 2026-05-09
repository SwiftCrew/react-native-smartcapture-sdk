import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Mask, Rect } from 'react-native-svg';

import { DEFAULT_COLORS, DEFAULT_DIMENSIONS } from '../uiConfig';
import { clamp } from '../utils/clamp';
import type { CropRect } from '../utils/imageEditor';

/**
 * Imperative handle exposed to the parent, returned via `ref`.
 *
 * `getCropRect()` snapshots the *current* gesture state and translates it
 * into source-image pixel coordinates ready for native cropping.
 */
export type ImageCropperHandle = {
  getCropRect: () => CropRect;
};

export type ImageCropperProps = {
  /** Source image URI. */
  uri: string;
  /** Source image natural pixel size — required to compute crop rect. */
  imageWidth: number;
  /** Source image natural pixel size — required to compute crop rect. */
  imageHeight: number;
  /** The total available width for the cropper viewport. */
  viewportWidth: number;
  /** The total available height for the cropper viewport. */
  viewportHeight: number;
  /** Diameter of the circle when `shape === 'circle'`.
   *  Defaults to `min(viewportWidth, viewportHeight) * circleDiameterRatio`. */
  circleDiameter?: number;
  /** Min zoom relative to base "cover" scale. Default: `1`. */
  minZoom?: number;
  /** Max zoom relative to base "cover" scale. Default: `5`. */
  maxZoom?: number;
  /** Crop overlay shape. Default: `'circle'`. */
  shape?: 'circle' | 'rectangle';

  /* -------- Visual -------- */
  /** Dim overlay color outside the cut-out. */
  overlayColor?: string;
  /** Stroke around the cut-out edge. Set to `'transparent'` to hide. */
  strokeColor?: string;
  /** Stroke width in viewport pixels. */
  strokeWidth?: number;
  /** Background color behind the image. */
  backgroundColor?: string;

  /* -------- Layout (rectangle shape) -------- */
  /** height / width ratio for the rectangle window. Default `1.2`. */
  rectangleAspectRatio?: number;
  /** Horizontal inset for the rectangle window in viewport pixels. */
  rectangleHorizontalInset?: number;
  /** Fraction `0..1` of the smaller viewport side used as circle diameter. */
  circleDiameterRatio?: number;
};

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 5;
const MAX_RECT_HEIGHT_RATIO = 0.9;

/**
 * Interactive image cropper.
 *
 * - The image is laid out with `resizeMode: 'cover'` over the viewport
 *   so the crop window is always fully covered at scale=1.
 * - The user can pan + pinch the image; gestures are clamped so the
 *   crop window never reveals empty space.
 * - On confirm, `getCropRect()` returns a rect in *source-image* pixels
 *   that bounds the crop window — that rect is then handed off to
 *   `@react-native-community/image-editor` for the actual native crop.
 */
export const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(
  function ImageCropper(props, ref) {
    const {
      uri,
      imageWidth,
      imageHeight,
      viewportWidth,
      viewportHeight,
      minZoom = DEFAULT_MIN,
      maxZoom = DEFAULT_MAX,
      shape = 'circle',
      overlayColor = DEFAULT_COLORS.overlay,
      strokeColor = DEFAULT_COLORS.overlayStroke,
      strokeWidth = DEFAULT_DIMENSIONS.overlayStrokeWidth,
      backgroundColor = DEFAULT_COLORS.background,
      rectangleAspectRatio = DEFAULT_DIMENSIONS.rectangleAspectRatio,
      rectangleHorizontalInset = DEFAULT_DIMENSIONS.rectangleHorizontalInset,
      circleDiameterRatio = DEFAULT_DIMENSIONS.circleDiameterRatio,
    } = props;

    /* ----------------------------------------------------------------- *
     *  Derived geometry                                                 *
     * ----------------------------------------------------------------- */
    const safeImageW = Math.max(1, imageWidth);
    const safeImageH = Math.max(1, imageHeight);
    const isCircle = shape === 'circle';

    // Resolve circle diameter (prop > ratio of viewport).
    const circleDiameter =
      props.circleDiameter ??
      Math.min(viewportWidth, viewportHeight) * circleDiameterRatio;

    // Resolve rectangle dimensions.
    const rectangleWidth = Math.max(
      120,
      viewportWidth - rectangleHorizontalInset * 2,
    );
    const rectangleHeight = Math.min(
      viewportHeight * MAX_RECT_HEIGHT_RATIO,
      rectangleWidth * rectangleAspectRatio,
    );

    const overlayWidth = isCircle ? circleDiameter : rectangleWidth;
    const overlayHeight = isCircle ? circleDiameter : rectangleHeight;

    // Crop window is always centered in the viewport (consistent with
    // common photo cropper UX — Photos.app, Instagram, etc.).
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    /* ----------------------------------------------------------------- *
     *  Cover-scale layout — image fills the viewport with overflow on  *
     *  the longer axis.                                                *
     * ----------------------------------------------------------------- */
    const layout = useMemo(() => {
      const aspect = safeImageW / safeImageH;
      const viewportAspect = viewportWidth / viewportHeight;
      let coverW: number;
      let coverH: number;
      if (aspect > viewportAspect) {
        coverH = viewportHeight;
        coverW = viewportHeight * aspect;
      } else {
        coverW = viewportWidth;
        coverH = viewportWidth / aspect;
      }
      return {
        coverW,
        coverH,
        pixelsPerViewportUnitX: safeImageW / coverW,
        pixelsPerViewportUnitY: safeImageH / coverH,
      };
    }, [safeImageW, safeImageH, viewportHeight, viewportWidth]);

    /* ----------------------------------------------------------------- *
     *  Shared values — driven by gestures.                              *
     *                                                                   *
     *  Reading `.value` from JS inside `getCropRect()` is a synchronous *
     *  lock-free read of the latest worklet-thread value, so the        *
     *  imperative handle always sees the freshest state.                *
     * ----------------------------------------------------------------- */
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const savedTx = useSharedValue(0);
    const savedTy = useSharedValue(0);

    // Reset gesture state when the source image changes (e.g. retake).
    useEffect(() => {
      scale.value = 1;
      savedScale.value = 1;
      tx.value = 0;
      ty.value = 0;
      savedTx.value = 0;
      savedTy.value = 0;
      // We intentionally depend ONLY on uri — shared values themselves
      // are stable refs so adding them here is a no-op for the linter.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri]);

    /* ----------------------------------------------------------------- *
     *  Clamping logic (worklet) — keep the crop window covered.         *
     * ----------------------------------------------------------------- */
    const clampTranslation = (
      nextScale: number,
      nextTx: number,
      nextTy: number,
    ) => {
      'worklet';
      const scaledW = layout.coverW * nextScale;
      const scaledH = layout.coverH * nextScale;
      const slackX = (scaledW - overlayWidth) / 2;
      const slackY = (scaledH - overlayHeight) / 2;
      const maxTx = Math.max(0, slackX);
      const maxTy = Math.max(0, slackY);
      return {
        tx: clamp(nextTx, -maxTx, maxTx),
        ty: clamp(nextTy, -maxTy, maxTy),
      };
    };

    /* ----------------------------------------------------------------- *
     *  Gestures                                                         *
     * ----------------------------------------------------------------- */
    const panGesture = Gesture.Pan()
      .averageTouches(true)
      .onStart(() => {
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      })
      .onUpdate((e) => {
        const next = clampTranslation(
          scale.value,
          savedTx.value + e.translationX,
          savedTy.value + e.translationY,
        );
        tx.value = next.tx;
        ty.value = next.ty;
      });

    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        savedScale.value = scale.value;
        savedTx.value = tx.value;
        savedTy.value = ty.value;
      })
      .onUpdate((e) => {
        const nextScale = clamp(savedScale.value * e.scale, minZoom, maxZoom);
        scale.value = nextScale;
        const next = clampTranslation(nextScale, savedTx.value, savedTy.value);
        tx.value = next.tx;
        ty.value = next.ty;
      })
      .onEnd(() => {
        // Spring back if user somehow exceeded bounds.
        const next = clampTranslation(scale.value, tx.value, ty.value);
        tx.value = withTiming(next.tx, { duration: 120 });
        ty.value = withTiming(next.ty, { duration: 120 });
      });

    const composed = Gesture.Simultaneous(panGesture, pinchGesture);

    /* ----------------------------------------------------------------- *
     *  Animated transform                                               *
     * ----------------------------------------------------------------- */
    const imageStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { scale: scale.value },
      ],
    }));

    /* ----------------------------------------------------------------- *
     *  Imperative API — final crop rect in source-image pixels.         *
     * ----------------------------------------------------------------- */
    useImperativeHandle(
      ref,
      () => ({
        getCropRect(): CropRect {
          const s = scale.value || 1;
          const x = tx.value;
          const y = ty.value;

          // Where is the overlay (in *image-local viewport* pixels)?
          // The image is centered in the viewport; (tx, ty) shifts it.
          // ⇒ in image-local space (before scaling), the overlay's
          //   center is at `imageCenter - (tx, ty) / s` and its
          //   half-extents scale with `1 / s`.
          const imgLocalHalfW = overlayWidth / 2 / s;
          const imgLocalHalfH = overlayHeight / 2 / s;
          const imgLocalCenterX = layout.coverW / 2 - x / s;
          const imgLocalCenterY = layout.coverH / 2 - y / s;

          const localX = imgLocalCenterX - imgLocalHalfW;
          const localY = imgLocalCenterY - imgLocalHalfH;
          const localW = imgLocalHalfW * 2;
          const localH = imgLocalHalfH * 2;

          // Convert from "viewport pixels" to "source-image pixels"
          // and clamp to image bounds (defensive — gesture clamping
          // should already prevent over-shoot).
          const px = localX * layout.pixelsPerViewportUnitX;
          const py = localY * layout.pixelsPerViewportUnitY;
          const pw = localW * layout.pixelsPerViewportUnitX;
          const ph = localH * layout.pixelsPerViewportUnitY;
          return {
            x: clamp(px, 0, Math.max(0, safeImageW - 1)),
            y: clamp(py, 0, Math.max(0, safeImageH - 1)),
            width: clamp(pw, 1, safeImageW),
            height: clamp(ph, 1, safeImageH),
          };
        },
      }),
      [
        layout,
        overlayWidth,
        overlayHeight,
        safeImageW,
        safeImageH,
        scale,
        tx,
        ty,
      ],
    );

    /* ----------------------------------------------------------------- *
     *  Render                                                           *
     * ----------------------------------------------------------------- */
    return (
      <View
        style={[
          styles.viewport,
          { width: viewportWidth, height: viewportHeight, backgroundColor },
        ]}
      >
        <GestureDetector gesture={composed}>
          <Animated.View
            style={[
              styles.imageWrap,
              { width: layout.coverW, height: layout.coverH },
              imageStyle,
            ]}
          >
            <Image
              source={{ uri }}
              style={{ width: layout.coverW, height: layout.coverH }}
              resizeMode="cover"
              fadeDuration={0}
            />
          </Animated.View>
        </GestureDetector>

        {/* Dim overlay with cut-out + visible stroke around the crop window */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={viewportWidth} height={viewportHeight}>
            <Defs>
              <Mask id="hole">
                <Rect
                  x={0}
                  y={0}
                  width={viewportWidth}
                  height={viewportHeight}
                  fill="white"
                />
                {isCircle ? (
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r={overlayWidth / 2}
                    fill="black"
                  />
                ) : (
                  <Rect
                    x={centerX - overlayWidth / 2}
                    y={centerY - overlayHeight / 2}
                    width={overlayWidth}
                    height={overlayHeight}
                    fill="black"
                  />
                )}
              </Mask>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={viewportWidth}
              height={viewportHeight}
              fill={overlayColor}
              mask="url(#hole)"
            />

            {/* Visible stroke around the cut-out (so the user sees a
                clear crop boundary). Opt out by passing
                `strokeColor="transparent"` or `strokeWidth={0}`. */}
            {strokeWidth > 0 && strokeColor !== 'transparent' ? (
              isCircle ? (
                <Circle
                  cx={centerX}
                  cy={centerY}
                  r={overlayWidth / 2}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              ) : (
                <Rect
                  x={centerX - overlayWidth / 2}
                  y={centerY - overlayHeight / 2}
                  width={overlayWidth}
                  height={overlayHeight}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              )
            ) : null}
          </Svg>
        </View>
      </View>
    );
  },
);
ImageCropper.displayName = 'ImageCropper';

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    // Centered by parent's flex centering. We avoid `position: 'absolute'`
    // so flex-centering applies; `overflow: 'hidden'` on the viewport
    // clips the cover-sized image.
  },
});
