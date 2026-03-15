import { Point } from '../../types';

/**
 * Checks if a fingertip is "pressing" a key.
 * Legacy function.
 */
export function isKeyPress(p: Point): boolean {
  return p.y > 0.8;
}

/**
 * Stateful detector for keystrokes to prevent flickering.
 * Uses a hysteresis threshold mechanism.
 */
export class KeystrokeDetector {
  private activePitches = new Set<number>();

  public processPoint(p: Point, pitch: number): boolean {
    const isCurrentlyActive = this.activePitches.has(pitch);
    
    // Hysteresis logic
    if (!isCurrentlyActive && p.y > 0.85) {
      this.activePitches.add(pitch);
      return true;
    } else if (isCurrentlyActive && p.y < 0.75) {
      this.activePitches.delete(pitch);
      return false;
    }
    
    return isCurrentlyActive;
  }

  /**
   * Returns true only for the first frame a pitch is detected as pressed.
   */
  public wasJustPressed(p: Point, pitch: number): boolean {
    const isCurrentlyActive = this.activePitches.has(pitch);
    
    if (!isCurrentlyActive && p.y > 0.85) {
      this.activePitches.add(pitch);
      return true;
    } else if (isCurrentlyActive && p.y < 0.75) {
      this.activePitches.delete(pitch);
    }
    
    return false;
  }
}