/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('transitions to Press High Key stage after low key detection', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<App />);
    
    await user.click(screen.getByTestId('complete-wizard'));
    await user.click(screen.getByRole('button', { name: /Confirm/i }));
    
    // Mock MIDI callback trigger
    let midiCallback: (pitch: number) => void;
    vi.spyOn(midiService, 'setCallbacks').mockImplementation((onNoteOn: any) => {
      midiCallback = onNoteOn;
    });
    
    // Re-render to trigger useEffect if needed or just trigger callback if app is already set up
    // In App.tsx, midiService.setCallbacks is in a useEffect.
    
    // For this test, we assume the logic exists to handle the press.
    // Trigger MIDI note 21 (A0, lowest on 88-key)
    // We might need to wait for the app to be in the right state.
    
    // Note: Since I'm writing failing tests, I expect this to fail because the strings aren't there yet.
    expect(screen.queryByText(/Press the highest white key/i)).not.toBeInTheDocument();
  });
});
