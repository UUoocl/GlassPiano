import { Point, Calibration } from '../types';

/**
 * Maps a point from the camera coordinate space (0-1) 
 * to the calibrated piano keyboard space (0-1).
 * Uses a basic bilinear interpolation for the 4-point warp.
 */
export function mapPointToPiano(p: Point, cal: Calibration): Point {
  // This is a simplified version of a perspective transform.
  // For a true perspective transform, we'd need a 3x3 homography matrix.
  // Here we use bilinear interpolation as a robust approximation for UI feedback.
  
  const { topLeft, topRight, bottomLeft, bottomRight } = cal;

  // Horizontal interpolation
  const topX = topLeft.x + (topRight.x - topLeft.x) * p.x;
  const bottomX = bottomLeft.x + (bottomRight.x - bottomLeft.x) * p.x;
  const mappedX = topX + (bottomX - topX) * p.y;

  // Vertical interpolation
  const leftY = topLeft.y + (bottomLeft.y - topLeft.y) * p.y;
  const rightY = topRight.y + (bottomRight.y - topRight.y) * p.y;
  const mappedY = leftY + (rightY - leftY) * p.x;

  return { x: mappedX, y: mappedY };
}

/**
 * Determines the MIDI pitch based on the normalized X coordinate on the piano.
 * Assumes a standard 88-key piano for the mapping.
 */
export function getPitchFromX(x: number): number {
  const START_MIDI = 21; // A0
  const TOTAL_KEYS = 88;
  return Math.floor(x * TOTAL_KEYS) + START_MIDI;
}

/**
 * Checks if a fingertip is "pressing" a key.
 * In a real app, we'd use Z-depth or visual change detection.
 * For this demo, we use a Y-threshold in the calibrated space.
 */
export function isKeyPress(p: Point): boolean {
  return p.y > 0.8; // Pressing near the bottom of the mapped keyboard area
}
