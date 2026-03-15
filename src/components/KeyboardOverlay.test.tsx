/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KeyboardOverlay } from './KeyboardOverlay';
import { Calibration, KeyboardConfig } from '../types';
import '@testing-library/jest-dom/vitest';

// Mock the alignment service
vi.mock('../services/vision/alignmentService', () => ({
  calculateKeyboardToCameraTransform: vi.fn().mockReturnValue({
    tx: 0.1,
    ty: 0.5,
    rotation: 0,
    scale: 0.8
  }),
  mapCameraToKeyboard: vi.fn().mockReturnValue({ x: 0.5, y: 0.5 })
}));

describe('KeyboardOverlay', () => {
  const mockConfig: KeyboardConfig = { totalKeys: 88, startMidi: 21 };
  const mockCalibration: Calibration = {
    topLeft: { x: 0.1, y: 0.5 },
    topRight: { x: 0.9, y: 0.5 },
    bottomLeft: { x: 0.1, y: 0.7 },
    bottomRight: { x: 0.9, y: 0.7 }
  };

  it('renders a canvas element', () => {
    const { container } = render(
      <KeyboardOverlay 
        activeNotes={[]} 
        hoveredNotes={[]} 
        targetNote={null} 
        handResults={null} 
        config={mockConfig} 
      />
    );
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '1280');
    expect(canvas).toHaveAttribute('height', '720');
  });

  it('accepts calibration prop', () => {
    const { rerender } = render(
      <KeyboardOverlay 
        activeNotes={[]} 
        hoveredNotes={[]} 
        targetNote={null} 
        handResults={null} 
        config={mockConfig} 
        calibration={null}
      />
    );
    
    rerender(
      <KeyboardOverlay 
        activeNotes={[]} 
        hoveredNotes={[]} 
        targetNote={null} 
        handResults={null} 
        config={mockConfig} 
        calibration={mockCalibration}
      />
    );
    
    // Check that it doesn't crash with calibration
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });
});
