import { describe, it, expect } from 'vitest';
import { calculateAffineTransform, transformPoint, mapCameraToKeyboard } from './alignmentService';
import { Calibration, Point } from '../../types';

describe('alignmentService', () => {
  describe('calculateAffineTransform', () => {
    it('should map the top-left corner to (0,0)', () => {
      const calibration: Calibration = {
        topLeft: { x: 100, y: 100 },
        topRight: { x: 300, y: 100 },
        bottomLeft: { x: 100, y: 200 },
        bottomRight: { x: 300, y: 200 },
      };

      const transform = calculateAffineTransform(calibration);
      const mapped = transformPoint({ x: 100, y: 100 }, transform);

      expect(mapped.x).toBeCloseTo(0);
      expect(mapped.y).toBeCloseTo(0);
    });

    it('should correctly handle rotation', () => {
      // 45 degree rotation
      const s = Math.sqrt(2) / 2;
      const calibration: Calibration = {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 100 * s, y: 100 * s },
        bottomLeft: { x: -50 * s, y: 50 * s },
        bottomRight: { x: 50 * s, y: 150 * s },
      };

      const transform = calculateAffineTransform(calibration);
      const mappedTopRight = transformPoint(calibration.topRight, transform);

      // In the transformed space, Top-Right should be at (width, 0)
      expect(mappedTopRight.x).toBeGreaterThan(0);
      expect(mappedTopRight.y).toBeCloseTo(0);
    });

    it('should correctly handle scale', () => {
      const calibration: Calibration = {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 200, y: 0 },
        bottomLeft: { x: 0, y: 100 },
        bottomRight: { x: 200, y: 100 },
      };

      const transform = calculateAffineTransform(calibration);
      const mappedTopRight = transformPoint(calibration.topRight, transform);

      // If we normalize by top-left to top-right distance
      expect(mappedTopRight.x).toBeCloseTo(1);
    });
  });

  describe('mapCameraToKeyboard', () => {
    it('should map a camera point to the normalized keyboard space', () => {
      const calibration: Calibration = {
        topLeft: { x: 0.1, y: 0.1 },
        topRight: { x: 0.9, y: 0.1 },
        bottomLeft: { x: 0.1, y: 0.5 },
        bottomRight: { x: 0.9, y: 0.5 },
      };

      const point: Point = { x: 0.5, y: 0.1 }; // Middle of top edge
      const mapped = mapCameraToKeyboard(point, calibration);

      expect(mapped.x).toBeCloseTo(0.5);
      expect(mapped.y).toBeCloseTo(0);
    });
  });
});
