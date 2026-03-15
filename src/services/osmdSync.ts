// OpenSheetMusicDisplay typings are complex, we'll use a loose interface for the cursor
export interface Cursor {
  reset(): void;
  next(): void;
  show(): void;
  hide(): void;
  GNotesUnderCursor(): any[];
}

export class OSMDSyncManager {
  private currentCursorIndex: number = -1;

  public syncCursor(cursor: Cursor, targetIndex: number) {
    if (this.currentCursorIndex === -1 || targetIndex < this.currentCursorIndex) {
      // Need a full reset if it's the first time or we moved backwards
      cursor.reset();
      for (let i = 0; i < targetIndex; i++) {
        cursor.next();
      }
      this.currentCursorIndex = targetIndex;
    } else if (targetIndex > this.currentCursorIndex) {
      // Efficiently advance without resetting
      const difference = targetIndex - this.currentCursorIndex;
      for (let i = 0; i < difference; i++) {
        cursor.next();
      }
      this.currentCursorIndex = targetIndex;
    }
    // If targetIndex === this.currentCursorIndex, do nothing
  }

  public updateNoteColor(cursor: Cursor, isFingerOver: boolean) {
    const notes = cursor.GNotesUnderCursor();
    if (notes) {
      notes.forEach((note: any) => {
        const svgElement = note.getSVGGElement();
        if (svgElement) {
          const color = isFingerOver ? "#22c55e" : "#ef4444"; // Green or Red
          
          const noteheads = svgElement.querySelectorAll('.vf-notehead path');
          const stems = svgElement.querySelectorAll('.vf-stem rect, .vf-stem path');
          
          noteheads.forEach((nh: any) => nh.style.fill = color);
          stems.forEach((s: any) => s.style.fill = color);
          
          note.NoteheadColor = color;
          note.StemColor = color;
        }
      });
    }
    }

    public getVerticalOffset(cursor: Cursor, container: HTMLElement): number | null {
      const notes = cursor.GNotesUnderCursor();
      if (notes && notes.length > 0) {
        // Use the first note under the cursor to find the vertical position
        const firstNote = notes[0];
        const svgElement = firstNote.getSVGGElement();
        if (svgElement) {
          const noteRect = svgElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // Calculate relative position + current scroll to get absolute position in content
          return noteRect.top - containerRect.top + container.scrollTop;
        }
      }
      return null;
    }

    }