import { describe, it, expect } from 'vitest';
import { 
  calculateAffineTransform, 
  transformPoint, 
  mapCameraToKeyboard,
  calculateKeyboardToCameraTransform,
  transformKeyboardToCamera
} from './alignmentService';
import { Calibration, Point, FineTune } from '../../types';

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

  describe('inverse transform', () => {
    it('should map (0,0) in keyboard space to topLeft in camera space', () => {
      const calibration: Calibration = {
        topLeft: { x: 0.1, y: 0.1 },
        topRight: { x: 0.9, y: 0.1 },
        bottomLeft: { x: 0.1, y: 0.5 },
        bottomRight: { x: 0.9, y: 0.5 },
      };

      const transform = calculateKeyboardToCameraTransform(calibration);
      const mapped = transformKeyboardToCamera({ x: 0, y: 0 }, transform);

      expect(mapped.x).toBeCloseTo(0.1);
      expect(mapped.y).toBeCloseTo(0.1);
    });

    it('should map (1,0) in keyboard space to topRight in camera space', () => {
      const calibration: Calibration = {
        topLeft: { x: 0.1, y: 0.1 },
        topRight: { x: 0.9, y: 0.1 },
        bottomLeft: { x: 0.1, y: 0.5 },
        bottomRight: { x: 0.9, y: 0.5 },
      };

      const transform = calculateKeyboardToCameraTransform(calibration);
      const mapped = transformKeyboardToCamera({ x: 1, y: 0 }, transform);

      expect(mapped.x).toBeCloseTo(0.9);
      expect(mapped.y).toBeCloseTo(0.1);
    });

    it('should be the inverse of the camera-to-keyboard transform', () => {
      const calibration: Calibration = {
        topLeft: { x: 0.1, y: 0.2 },
        topRight: { x: 0.8, y: 0.3 },
        bottomLeft: { x: 0.15, y: 0.6 },
        bottomRight: { x: 0.85, y: 0.7 },
      };

      const p: Point = { x: 0.5, y: 0.4 };
      
      const camToKbd = calculateAffineTransform(calibration);
      const kbdToCam = calculateKeyboardToCameraTransform(calibration);

      const pKbd = transformPoint(p, camToKbd);
      const pCam = transformKeyboardToCamera(pKbd, kbdToCam);

      expect(pCam.x).toBeCloseTo(p.x);
      expect(pCam.y).toBeCloseTo(p.y);
    });
  });

  describe('fine-tuning', () => {
    const calibration: Calibration = {
      topLeft: { x: 0.1, y: 0.1 },
      topRight: { x: 0.9, y: 0.1 },
      bottomLeft: { x: 0.1, y: 0.5 },
      bottomRight: { x: 0.9, y: 0.5 },
    };

    it('should apply rotation offset', () => {
      const fineTune: FineTune = { rotation: Math.PI / 2, scale: 1, offsetX: 0, offsetY: 0 };
      const transform = calculateKeyboardToCameraTransform(calibration, fineTune);
      
      // With 90 deg rotation, (1,0) should move to (0,1) relative to topLeft
      const p = transformKeyboardToCamera({ x: 1, y: 0 }, transform);
      expect(p.x).toBeCloseTo(calibration.topLeft.x);
      expect(p.y).toBeCloseTo(calibration.topLeft.y + 0.8); // 0.1 + scale(0.8)
    });

    it('should apply scale multiplier', () => {
      const fineTune: FineTune = { rotation: 0, scale: 2, offsetX: 0, offsetY: 0 };
      const transform = calculateKeyboardToCameraTransform(calibration, fineTune);
      
      const p = transformKeyboardToCamera({ x: 1, y: 0 }, transform);
      expect(p.x).toBeCloseTo(0.1 + 0.8 * 2);
    });

    it('should apply translation offsets', () => {
      const fineTune: FineTune = { rotation: 0, scale: 1, offsetX: 0.05, offsetY: 0.05 };
      const transform = calculateKeyboardToCameraTransform(calibration, fineTune);
      
      const p = transformKeyboardToCamera({ x: 0, y: 0 }, transform);
      expect(p.x).toBeCloseTo(0.15);
      expect(p.y).toBeCloseTo(0.15);
    });
  });
});
