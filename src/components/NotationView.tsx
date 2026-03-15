import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { OSMDSyncManager } from '../services/osmdSync';

interface NotationViewProps {
  xmlUrl: string;
  currentNoteIndex: number;
  isFingerOver: boolean;
  onNoteMatch?: () => void;
}

export const NotationView: React.FC<NotationViewProps> = ({ xmlUrl, currentNoteIndex, isFingerOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const syncManagerRef = useRef(new OSMDSyncManager());

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
      syncManagerRef.current.syncCursor(cursor as any, currentNoteIndex);
      syncManagerRef.current.updateNoteColor(cursor as any, isFingerOver);
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
