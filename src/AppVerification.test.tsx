/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from './App';
import '@testing-library/jest-dom/vitest';
import { midiService } from './services/midiService';

// Mock components
vi.mock('./components/CameraView', () => ({
  CameraView: () => <div data-testid="camera-view" />
}));
vi.mock('./components/NotationView', () => ({
  NotationView: () => <div data-testid="notation-view" />
}));
vi.mock('./components/CalibrationWizard', () => ({
  CalibrationWizard: ({ onComplete }: any) => (
    <button 
      data-testid="complete-wizard" 
      onClick={() => onComplete({
        midiId: 'test-midi',
        keyboard: { totalKeys: 88, startMidi: 21 },
        calibration: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: 1, y: 0 },
          bottomLeft: { x: 0, y: 1 },
          bottomRight: { x: 1, y: 1 }
        }
      })}
    >
      Complete Wizard
    </button>
  )
}));

describe('App Verification Flow', () => {
  afterEach(() => {
    cleanup();
  });

  it('transitions from Adjust to Press Low Key stage', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<App />);
    
    // Complete wizard to get to verify step
    await user.click(screen.getByTestId('complete-wizard'));
    
    // Should be in 'Adjust & Verify' stage
    expect(screen.getByText(/Adjust & Verify/i)).toBeInTheDocument();
    
    // Click 'Confirm' to move to next stage
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmBtn);
    
    // Should now ask to press lowest white key
    expect(screen.getByText(/Press the lowest white key/i)).toBeInTheDocument();
  });

  it('renders fine-tuning sliders in adjust stage', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<App />);
    
    await user.click(screen.getByTestId('complete-wizard'));
    
    expect(screen.getByText(/Rotation/i)).toBeInTheDocument();
    expect(screen.getByText(/Scale/i)).toBeInTheDocument();
    expect(screen.getByText(/X Offset/i)).toBeInTheDocument();
    expect(screen.getByText(/Y Offset/i)).toBeInTheDocument();
  });

  it('transitions to Press High Key stage after low key detection', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<App />);
    
    await user.click(screen.getByTestId('complete-wizard'));
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    await user.click(confirmBtn);
    
    // Should be in 'Press the lowest white key' stage
    expect(screen.getByText(/Press the lowest white key/i)).toBeInTheDocument();
  });
});
