import { describe, test, expect, beforeEach } from 'vitest';
import { mapPointToPiano, getPitchFromX, isKeyPress, KeystrokeDetector } from './index';

describe('Vision Service - Mapping & MIDI', () => {
  const mockCalibration = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 1, y: 0 },
    bottomLeft: { x: 0, y: 1 },
    bottomRight: { x: 1, y: 1 }
  };

  test('mapPointToPiano maps correctly within normalized bounds', () => {
    const p = { x: 0.5, y: 0.5 };
    const mapped = mapPointToPiano(p, mockCalibration);
    expect(mapped.x).toBeCloseTo(0.5);
    expect(mapped.y).toBeCloseTo(0.5);
  });

  test('getPitchFromX returns correct MIDI pitch', () => {
    const config = { totalKeys: 88, startMidi: 21, keyWidth: 10 };
    expect(getPitchFromX(0, config)).toBe(21);
    expect(getPitchFromX(0.5, config)).toBe(21 + 44);
  });
});

describe('Vision Service - Gesture Detection', () => {
  test('isKeyPress detects deep Y presses (legacy)', () => {
    expect(isKeyPress({ x: 0.5, y: 0.7 })).toBe(false);
    expect(isKeyPress({ x: 0.5, y: 0.85 })).toBe(true);
  });

  describe('KeystrokeDetector', () => {
    let detector: KeystrokeDetector;

    beforeEach(() => {
      detector = new KeystrokeDetector();
    });

    test('applies hysteresis to prevent flickering', () => {
      const pitch = 60;
      
      // Not pressed yet (y is below press threshold 0.85)
      expect(detector.processPoint({ x: 0.5, y: 0.8 }, pitch)).toBe(false);
      
      // Pressed (y crosses press threshold 0.85)
      expect(detector.processPoint({ x: 0.5, y: 0.86 }, pitch)).toBe(true);
      
      // Still pressed (y drops below 0.85 but stays above release threshold 0.75)
      expect(detector.processPoint({ x: 0.5, y: 0.8 }, pitch)).toBe(true);
      
      // Released (y drops below release threshold 0.75)
      expect(detector.processPoint({ x: 0.5, y: 0.7 }, pitch)).toBe(false);
    });
  });
});