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

// Mock scrollTo
HTMLElement.prototype.scrollTo = vi.fn();

// Mock OSMDSyncManager
const mockGetVerticalOffset = vi.fn().mockReturnValue(100);
vi.mock('../services/osmdSync', () => ({
    OSMDSyncManager: vi.fn().mockImplementation(function() {
        return {
            syncCursor: vi.fn(),
            updateNoteColor: vi.fn(),
            getVerticalOffset: mockGetVerticalOffset,
        };
    }),
}));

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

  it('triggers scrollTo when note index changes', async () => {
    const { rerender } = render(
      <NotationView 
        xmlUrl="test.xml" 
        currentNoteIndex={0} 
        isFingerOver={false} 
      />
    );
    
    // We need to wait for the first useEffect to run and initialize OSMD
    // Since we mocked OSMD, it should happen relatively quickly
    
    // Change note index
    rerender(
      <NotationView 
        xmlUrl="test.xml" 
        currentNoteIndex={1} 
        isFingerOver={false} 
      />
    );
    
    // Check if it was called. We might need a small delay if it's in a different tick.
    await vi.waitFor(() => {
        expect(mockGetVerticalOffset).toHaveBeenCalled();
        expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 60 })); // 100 - 40
    });
  });
});
