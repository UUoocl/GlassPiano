import { KeyboardConfig } from '../../types';

/**
 * Determines the MIDI pitch based on the normalized X coordinate on the piano.
 * Uses the provided keyboard configuration.
 */
export function getPitchFromX(x: number, config: KeyboardConfig): number {
  return Math.floor(x * config.totalKeys) + config.startMidi;
}