import { describe, test, expect } from 'vitest';
import { mapPointToPiano, getPitchFromX, isKeyPress } from './index';

describe('Vision Service', () => {
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

  test('isKeyPress detects deep Y presses', () => {
    expect(isKeyPress({ x: 0.5, y: 0.7 })).toBe(false);
    expect(isKeyPress({ x: 0.5, y: 0.85 })).toBe(true);
  });
});