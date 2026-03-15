export interface Point {
  x: number;
  y: number;
}

export interface Calibration {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface FineTune {
  rotation: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface KeyboardConfig {
  totalKeys: number;
  startMidi: number;
}

export interface PianoKey {
  pitch: number; // MIDI pitch
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isBlack: boolean;
}

export interface HandData {
  landmarks: Point[];
  handedness: 'Left' | 'Right';
}
