import { describe, test, expect, beforeEach, vi } from 'vitest';
import { OSMDSyncManager } from './osmdSync';

describe('OSMDSyncManager', () => {
  let mockCursor: any;
  let syncManager: OSMDSyncManager;

  beforeEach(() => {
    mockCursor = {
      reset: vi.fn(),
      next: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      GNotesUnderCursor: vi.fn().mockReturnValue([]),
    };
    syncManager = new OSMDSyncManager();
  });

  test('initializes and resets cursor on first update if index is 0', () => {
    syncManager.syncCursor(mockCursor, 0);
    expect(mockCursor.reset).toHaveBeenCalledOnce();
    expect(mockCursor.next).not.toHaveBeenCalled();
  });

  test('advances cursor efficiently without full reset when index increments', () => {
    syncManager.syncCursor(mockCursor, 0); // Sets internal state to 0
    mockCursor.reset.mockClear();
    
    syncManager.syncCursor(mockCursor, 2); // Jump forward by 2
    expect(mockCursor.reset).not.toHaveBeenCalled();
    expect(mockCursor.next).toHaveBeenCalledTimes(2);
  });

  test('resets and advances if index goes backwards (e.g. restart)', () => {
    syncManager.syncCursor(mockCursor, 5); // Internal state to 5
    mockCursor.reset.mockClear();
    mockCursor.next.mockClear();

    syncManager.syncCursor(mockCursor, 1); // Jump back to 1
    expect(mockCursor.reset).toHaveBeenCalledOnce();
    expect(mockCursor.next).toHaveBeenCalledTimes(1);
  });

  test('colors notes under cursor based on finger status', () => {
    const mockNote = {
      getSVGGElement: vi.fn().mockReturnValue({
        querySelectorAll: vi.fn().mockReturnValue([]),
      }),
      NoteheadColor: '',
      StemColor: '',
    };
    mockCursor.GNotesUnderCursor.mockReturnValue([mockNote]);

    syncManager.syncCursor(mockCursor, 0);
    syncManager.updateNoteColor(mockCursor, true); // Finger over

    expect(mockNote.NoteheadColor).toBe('#22c55e');
    
    syncManager.updateNoteColor(mockCursor, false); // Finger not over
    expect(mockNote.NoteheadColor).toBe('#ef4444');
    });

    test('getVerticalOffset returns the top position relative to container', () => {
      const mockNote = {
        getSVGGElement: vi.fn().mockReturnValue({
          getBoundingClientRect: vi.fn().mockReturnValue({ top: 150 }),
        }),
      };
      const mockContainer = {
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 50 }),
        scrollTop: 10,
      };
      mockCursor.GNotesUnderCursor.mockReturnValue([mockNote]);

      // 150 (note top) - 50 (container top) + 10 (scroll) = 110
      const offset = syncManager.getVerticalOffset(mockCursor, mockContainer as any);
      expect(offset).toBe(110);
    });
    });