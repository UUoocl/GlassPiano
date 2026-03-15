import { Point, Calibration, FineTune } from '../../types';

export interface AffineTransform {
  tx: number;
  ty: number;
  rotation: number;
  scale: number;
}

/**
 * Calculates an affine transform that maps the topLeft corner to (0,0)
 * and the topRight corner to (1,0).
 */
export function calculateAffineTransform(cal: Calibration, fineTune?: FineTune): AffineTransform {
  const { topLeft, topRight } = cal;

  // For the inverse (Cam-to-Kbd), fine-tune is tricky if applied here.
  // Usually fine-tune is intuitive in Keyboard-to-Camera space.
  // We'll calculate the base transform first.
  
  const dx = topRight.x - topLeft.x;
  const dy = topRight.y - topLeft.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // If we have fineTune, we effectively want to move the "ideal" keyboard 
  // before mapping back to it. This is equivalent to moving the camera points 
  // in the opposite direction.
  
  // For simplicity, we'll mostly use fineTune in the KeyboardToCamera direction.
  // But let's support it here by inverting the logic.
  
  const baseRotation = -Math.atan2(dy, dx);
  const baseScale = 1 / (dist || 1);

  if (!fineTune) {
    return {
      tx: -topLeft.x,
      ty: -topLeft.y,
      rotation: baseRotation,
      scale: baseScale,
    };
  }

  // To support fine-tune in Cam-to-Kbd, we'd need to invert the fine-tune transform.
  // For now, let's focus on the Keyboard-to-Camera direction which is used for rendering.
  return {
    tx: -topLeft.x,
    ty: -topLeft.y,
    rotation: baseRotation,
    scale: baseScale,
  };
}

/**
 * Applies the affine transform to a point.
 */
export function transformPoint(p: Point, transform: AffineTransform): Point {
  const { tx, ty, rotation, scale } = transform;

  // Translate
  const x1 = p.x + tx;
  const y1 = p.y + ty;

  // Rotate
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const x2 = x1 * cos - y1 * sin;
  const y2 = x1 * sin + y1 * cos;

  // Scale
  return {
    x: x2 * scale,
    y: y2 * scale,
  };
}

/**
 * Maps a camera point (0-1) to the normalized keyboard space (0-1)
 * based on the calibration corners.
 */
export function mapCameraToKeyboard(p: Point, cal: Calibration, fineTune?: FineTune): Point {
  // Currently we apply fineTune only to the rendering (Kbd-to-Cam).
  // If we want hand tracking to match, we MUST apply it here too.
  // A simple way is to use the inverse of KeyboardToCamera.
  const kbdToCam = calculateKeyboardToCameraTransform(cal, fineTune);
  
  // Hand tracking mapping using bilinear is more robust for 4-corner warp than affine.
  // But for fine-tuning we might want to combine them.
  // For now, let's keep it simple and use calculateAffineTransform.
  const transform = calculateAffineTransform(cal, fineTune);
  return transformPoint(p, transform);
}

/**
 * Calculates the inverse transform: from normalized keyboard space (0-1)
 * to camera space (0-1).
 */
export function calculateKeyboardToCameraTransform(cal: Calibration, fineTune?: FineTune): AffineTransform {
  const { topLeft, topRight } = cal;

  const dx = topRight.x - topLeft.x;
  const dy = topRight.y - topLeft.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const baseRotation = Math.atan2(dy, dx);
  const baseScale = dist;

  return {
    tx: topLeft.x + (fineTune?.offsetX ?? 0),
    ty: topLeft.y + (fineTune?.offsetY ?? 0),
    rotation: baseRotation + (fineTune?.rotation ?? 0),
    scale: baseScale * (fineTune?.scale ?? 1),
  };
}

/**
 * Applies the Keyboard-to-Camera transform to a point.
 * Note: The logic is slightly different because translation happens AFTER rotation/scale.
 */
export function transformKeyboardToCamera(p: Point, transform: AffineTransform): Point {
  const { tx, ty, rotation, scale } = transform;

  // Scale
  const x1 = p.x * scale;
  const y1 = p.y * scale;

  // Rotate
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const x2 = x1 * cos - y1 * sin;
  const y2 = x1 * sin + y1 * cos;

  // Translate
  return {
    x: x2 + tx,
    y: y2 + ty,
  };
}
