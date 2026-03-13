import { Point, Calibration, KeyboardConfig } from '../types';

/**
 * Maps a point from the camera coordinate space (0-1) 
 * to the calibrated piano keyboard space (0-1).
 * Uses a basic bilinear interpolation for the 4-point warp.
 */
export function mapPointToPiano(p: Point, cal: Calibration): Point {
  const { topLeft, topRight, bottomLeft, bottomRight } = cal;

  // We want to find the relative (0-1) coordinates (u, v) of point p 
  // within the quadrilateral defined by the 4 calibration points.
  
  // A simple but effective approximation for piano mapping:
  // 1. Calculate how far 'p' is between the left and right boundaries at its current vertical level.
  
  // Interpolate the left and right boundary X-coordinates at the point's Y level
  const leftXAtY = topLeft.x + (bottomLeft.x - topLeft.x) * ((p.y - topLeft.y) / (bottomLeft.y - topLeft.y || 1));
  const rightXAtY = topRight.x + (bottomRight.x - topRight.x) * ((p.y - topRight.y) / (bottomRight.y - topRight.y || 1));
  
  const u = (p.x - leftXAtY) / (rightXAtY - leftXAtY || 1);
  
  // 2. Calculate how far 'p' is between the top and bottom boundaries
  // Interpolate the top and bottom boundary Y-coordinates at the point's X level
  const topYAtX = topLeft.y + (topRight.y - topLeft.y) * ((p.x - topLeft.x) / (topRight.x - topLeft.x || 1));
  const bottomYAtX = bottomLeft.y + (bottomRight.y - bottomLeft.y) * ((p.x - bottomLeft.x) / (bottomRight.x - bottomLeft.x || 1));
  
  const v = (p.y - topYAtX) / (bottomYAtX - topYAtX || 1);

  return { x: u, y: v };
}

/**
 * Determines the MIDI pitch based on the normalized X coordinate on the piano.
 * Uses the provided keyboard configuration.
 */
export function getPitchFromX(x: number, config: KeyboardConfig): number {
  return Math.floor(x * config.totalKeys) + config.startMidi;
}

/**
 * Checks if a fingertip is "pressing" a key.
 * In a real app, we'd use Z-depth or visual change detection.
 * For this demo, we use a Y-threshold in the calibrated space.
 */
export function isKeyPress(p: Point): boolean {
  return p.y > 0.8; // Pressing near the bottom of the mapped keyboard area
}
