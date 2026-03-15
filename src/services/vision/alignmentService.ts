import { Point, Calibration } from '../../types';

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
export function calculateAffineTransform(cal: Calibration): AffineTransform {
  const { topLeft, topRight } = cal;

  const dx = topRight.x - topLeft.x;
  const dy = topRight.y - topLeft.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return {
    tx: -topLeft.x,
    ty: -topLeft.y,
    rotation: -Math.atan2(dy, dx),
    scale: 1 / (dist || 1),
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
