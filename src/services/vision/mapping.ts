import { Point, Calibration } from '../../types';

/**
 * Maps a point from the camera coordinate space (0-1) 
 * to the calibrated piano keyboard space (0-1).
 * Uses a basic bilinear interpolation for the 4-point warp.
 */
export function mapPointToPiano(p: Point, cal: Calibration): Point {
  const { topLeft, topRight, bottomLeft, bottomRight } = cal;

  // Interpolate the left and right boundary X-coordinates at the point's Y level
  const leftXAtY = topLeft.x + (bottomLeft.x - topLeft.x) * ((p.y - topLeft.y) / (bottomLeft.y - topLeft.y || 1));
  const rightXAtY = topRight.x + (bottomRight.x - topRight.x) * ((p.y - topRight.y) / (bottomRight.y - topRight.y || 1));
  
  const u = (p.x - leftXAtY) / (rightXAtY - leftXAtY || 1);
  
  // Interpolate the top and bottom boundary Y-coordinates at the point's X level
  const topYAtX = topLeft.y + (topRight.y - topLeft.y) * ((p.x - topLeft.x) / (topRight.x - topLeft.x || 1));
  const bottomYAtX = bottomLeft.y + (bottomRight.y - bottomLeft.y) * ((p.x - bottomLeft.x) / (bottomRight.x - bottomLeft.x || 1));
  
  const v = (p.y - topYAtX) / (bottomYAtX - topYAtX || 1);

  return { x: u, y: v };
}