/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { CalibrationWizard } from './CalibrationWizard';
import '@testing-library/jest-dom/vitest';

vi.mock('../services/midiService', () => ({
  midiService: {
    requestAccess: vi.fn().mockResolvedValue(true),
    getInputs: vi.fn().mockReturnValue([
      { id: '1', name: 'Mock MIDI Device', manufacturer: 'Mock' }
    ]),
    onStateChange: vi.fn(),
    connect: vi.fn(),
    setCallbacks: vi.fn(),
  }
}));

afterEach(() => {
  cleanup();
});

describe('CalibrationWizard', () => {
  it('starts at the MIDI selection step', () => {
    render(<CalibrationWizard onComplete={() => {}} />);
    expect(screen.getByText(/Select MIDI Device/i)).toBeInTheDocument();
  });

  it('does not show subsequent steps initially', () => {
    render(<CalibrationWizard onComplete={() => {}} />);
    expect(screen.queryByText(/Press the leftmost key/i)).not.toBeInTheDocument();
  });

  it('advances to step 2 when Next is clicked from step 1 after selecting a device', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<CalibrationWizard onComplete={() => {}} />);
    
    const device = await screen.findByText(/Mock MIDI Device/i);
    await user.click(device);
    await user.click(screen.getByText(/Next/i));
    expect(screen.getByText(/Press the leftmost key/i)).toBeInTheDocument();
  });

  it('renders MidiSelector in the first step', () => {
    render(<CalibrationWizard onComplete={() => {}} />);
    expect(screen.getByText(/MIDI Input Device/i)).toBeInTheDocument();
  });

  it('captures MIDI note in step 2', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const { midiService } = await import('../services/midiService');
    
    render(<CalibrationWizard onComplete={() => {}} />);
    
    // Step 1
    const device = await screen.findByText(/Mock MIDI Device/i);
    await user.click(device);
    await user.click(screen.getByText(/Next/i));
    
    // Step 2
    expect(screen.getByText(/Step 2: Press the leftmost key/i)).toBeInTheDocument();
    
    // Simulate MIDI note on
    const midiCallback = (midiService.setCallbacks as any).mock.calls[(midiService.setCallbacks as any).mock.calls.length - 1][0];
    midiCallback(21, 64); // Note 21 (A0)
    
    expect(await screen.findByText(/Key Detected!/i)).toBeInTheDocument();
    expect(screen.getByText(/MIDI 21/i)).toBeInTheDocument();
    
    const nextButton = screen.getByText(/Next/i);
    expect(nextButton).not.toBeDisabled();
  });
});
