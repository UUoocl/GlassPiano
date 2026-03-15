/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotationView } from './NotationView';
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(function() {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };
});

// Mock OSMD
vi.mock('opensheetmusicdisplay', () => {
  return {
    OpenSheetMusicDisplay: vi.fn().mockImplementation(function() {
      return {
        load: vi.fn().mockResolvedValue(undefined),
        render: vi.fn(),
        cursor: {
          show: vi.fn(),
          hide: vi.fn(),
          reset: vi.fn(),
          next: vi.fn(),
          GNotesUnderCursor: vi.fn().mockReturnValue([]),
        },
      };
    }),
  };
});

describe('NotationView Resizing', () => {
  it('renders a container that fills its parent', () => {
    const { container } = render(
      <NotationView 
        xmlUrl="test.xml" 
        currentNoteIndex={0} 
        isFingerOver={false} 
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('w-full');
    expect(wrapper).toHaveClass('h-full');
    
    const osmdContainer = wrapper.querySelector('#osmd-container');
    expect(osmdContainer).toHaveClass('w-full');
    expect(osmdContainer).toHaveClass('h-full');
  });
});
