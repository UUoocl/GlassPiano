/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import '@testing-library/jest-dom/vitest';

// Mock components that might be problematic or unnecessary for layout tests
vi.mock('./components/CameraView', () => ({
  CameraView: () => <div data-testid="camera-view" />
}));
vi.mock('./components/NotationView', () => ({
  NotationView: () => <div data-testid="notation-view" />
}));
vi.mock('./components/CalibrationWizard', () => ({
  CalibrationWizard: () => <div data-testid="calibration-wizard" />
}));
vi.mock('./components/MidiSelector', () => ({
  MidiSelector: () => <div data-testid="midi-selector" />
}));

describe('App Layout', () => {
  it('main container has h-screen and overflow-hidden for viewport fit', () => {
    const { container } = render(<App />);
    const mainContainer = container.firstChild as HTMLElement;
    
    expect(mainContainer).toHaveClass('h-screen');
    expect(mainContainer).toHaveClass('overflow-hidden');
    
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-1');
    expect(main).toHaveClass('min-h-0');
  });
});
