import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface NotationViewProps {
  xmlUrl: string;
  currentNoteIndex: number;
  isFingerOver: boolean;
  onNoteMatch?: () => void;
}

export const NotationView: React.FC<NotationViewProps> = ({ xmlUrl, currentNoteIndex, isFingerOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initAndLoad = async () => {
      if (!containerRef.current || !xmlUrl) return;

      try {
        setError(null);
        
        // Initialize if not already done
        if (!osmdRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: true,
            drawTitle: false,
            followCursor: true,
          });
        }

        await osmdRef.current.load(xmlUrl);
        
        if (isMounted) {
          osmdRef.current.render();
          osmdRef.current.cursor.show();
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load MusicXML:", err);
          setError("Failed to load sheet music. Please check your connection.");
        }
      }
    };

    initAndLoad();

    return () => {
      isMounted = false;
    };
  }, [xmlUrl]);

  useEffect(() => {
    if (osmdRef.current && osmdRef.current.cursor) {
      const cursor = osmdRef.current.cursor;
      cursor.reset();
      for (let i = 0; i < currentNoteIndex; i++) {
        cursor.next();
      }

      const notes = cursor.GNotesUnderCursor();
      if (notes) {
        notes.forEach(note => {
          const svgElement = note.getSVGGElement();
          if (svgElement) {
            const color = isFingerOver ? "#22c55e" : "#ef4444"; // Green if over, Red otherwise
            
            // Find notehead and stem within the SVG group
            const noteheads = svgElement.querySelectorAll('.vf-notehead path');
            const stems = svgElement.querySelectorAll('.vf-stem rect, .vf-stem path');
            
            noteheads.forEach(nh => (nh as SVGPathElement).style.fill = color);
            stems.forEach(s => (s as SVGElement).style.fill = color);
            
            // Also update OSMD internal state so it persists on resize/re-render
            note.NoteheadColor = color;
            note.StemColor = color;
          }
        });
      }
    }
  }, [currentNoteIndex, isFingerOver]);

  return (
    <div className="w-full h-full bg-white relative">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 p-6 text-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" id="osmd-container" />
    </div>
  );
};
