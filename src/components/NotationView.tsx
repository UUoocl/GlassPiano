import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface NotationViewProps {
  xmlUrl: string;
  currentNoteIndex: number;
  onNoteMatch?: () => void;
}

export const NotationView: React.FC<NotationViewProps> = ({ xmlUrl, currentNoteIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        drawTitle: false,
      });
    }
  }, []);

  useEffect(() => {
    const loadScore = async () => {
      if (osmdRef.current && xmlUrl) {
        await osmdRef.current.load(xmlUrl);
        osmdRef.current.render();
      }
    };
    loadScore();
  }, [xmlUrl]);

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden p-4">
      <div ref={containerRef} className="w-full h-full" id="osmd-container" />
    </div>
  );
};
