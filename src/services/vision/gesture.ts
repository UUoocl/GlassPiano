import { Point } from '../../types';

/**
 * Checks if a fingertip is "pressing" a key.
 * In a real app, we'd use Z-depth or visual change detection.
 * For this demo, we use a Y-threshold in the calibrated space.
 */
export function isKeyPress(p: Point): boolean {
  return p.y > 0.8; // Pressing near the bottom of the mapped keyboard area
}