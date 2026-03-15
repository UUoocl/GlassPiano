/**
 * @vitest-environment jsdom
 */
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { CalibrationWizard } from './CalibrationWizard';
import '@testing-library/jest-dom/vitest';

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

  it('advances to step 2 when Next is clicked from step 1', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    render(<CalibrationWizard onComplete={() => {}} />);
    
    await user.click(screen.getByText(/Next/i));
    expect(screen.getByText(/Press the leftmost key/i)).toBeInTheDocument();
  });
});
