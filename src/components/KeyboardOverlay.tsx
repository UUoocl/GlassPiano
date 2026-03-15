import React, { useRef, useEffect } from 'react';
import { Results } from '@mediapipe/hands';
import { KeyboardConfig, Calibration, FineTune } from '../types';
import { mapCameraToKeyboard } from '../services/vision/alignmentService';

interface KeyboardOverlayProps {
  activeNotes: number[];
  hoveredNotes: number[];
  targetNote: number | null;
  handResults: Results | null;
  hideKeyboard?: boolean;
  config: KeyboardConfig;
  calibration?: Calibration | null;
  fineTune?: FineTune | null;
}

export const KeyboardOverlay: React.FC<KeyboardOverlayProps> = ({ 
  activeNotes, 
  hoveredNotes, 
  targetNote, 
  handResults, 
  hideKeyboard, 
  config,
  calibration,
  fineTune
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Setup Transformation
      // We use UNIFORM scale (based on width) to maintain aspect ratio of hands.
      ctx.save();
      
      const kbdHeightPixels = height * 0.15;
      // Move it up more from the bottom to allow hands to be visible "below" it too
      const kbdY = height - kbdHeightPixels - 100; 
      
      // Translate to keyboard origin
      ctx.translate(0, kbdY);
      
      // We scale X by 'width' so 0-1 covers the screen width.
      // We MUST scale Y by 'width' as well to keep aspect ratio 1:1.
      ctx.scale(width, width);

      // The virtual keyboard height in this UNIFORM space:
      const kbdHeightInUniformSpace = kbdHeightPixels / width;

      if (!hideKeyboard) {
        // Draw Virtual Keyboard
        const { totalKeys, startMidi } = config;
        const endMidi = startMidi + totalKeys - 1;
        
        let numWhiteKeys = 0;
        for (let pitch = startMidi; pitch <= endMidi; pitch++) {
          if (![1, 3, 6, 8, 10].includes(pitch % 12)) numWhiteKeys++;
        }
        
        const whiteKeyWidth = 1 / numWhiteKeys;
        let whiteKeyIndex = 0;
        
        ctx.globalAlpha = 0.6;
        for (let pitch = startMidi; pitch <= endMidi; pitch++) {
          const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
          if (!isBlack) {
            const x = whiteKeyIndex * whiteKeyWidth;
            
            let color = '#fff';
            if (activeNotes.includes(pitch)) color = '#22c55e';
            else if (pitch === targetNote) color = '#ef4444';
            else if (hoveredNotes.includes(pitch)) color = '#fde047';
            
            ctx.fillStyle = color;
            ctx.fillRect(x, 0, whiteKeyWidth, kbdHeightInUniformSpace);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1 / width; // 1 pixel wide
            ctx.strokeRect(x, 0, whiteKeyWidth, kbdHeightInUniformSpace);
            whiteKeyIndex++;
          }
        }

        // Second pass: Black keys
        whiteKeyIndex = 0;
        for (let pitch = startMidi; pitch <= endMidi; pitch++) {
          const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
          if (isBlack) {
            const x = (whiteKeyIndex * whiteKeyWidth) - (whiteKeyWidth * 0.3);
            
            let color = '#000';
            if (activeNotes.includes(pitch)) color = '#16a34a';
            else if (pitch === targetNote) color = '#dc2626';
            else if (hoveredNotes.includes(pitch)) color = '#eab308';
            
            ctx.fillStyle = color;
            ctx.fillRect(x, 0, whiteKeyWidth * 0.6, kbdHeightInUniformSpace * 0.6);
          } else {
            whiteKeyIndex++;
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Draw Hands (Hand landmarks are now in uniform keyboard space)
      if (handResults && handResults.multiHandLandmarks && handResults.multiHandLandmarks.length > 0) {
        handResults.multiHandLandmarks.forEach((rawLandmarks, handIndex) => {
          // Map to horizontal keyboard space
          const landmarks = calibration 
            ? rawLandmarks.map(p => mapCameraToKeyboard(p, calibration, fineTune || undefined))
            : rawLandmarks.map(p => ({ x: p.x, y: p.y }));

          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
          ];

          ctx.strokeStyle = handIndex === 0 ? '#00ff00' : '#00ffff';
          ctx.lineWidth = 5 / width; // Constant pixel width
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          });
          ctx.stroke();

          // Draw joints
          landmarks.forEach((p) => {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6 / width, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 / width;
            ctx.stroke();
          });
        });
      }
      
      ctx.restore();
    };

    render();
  }, [activeNotes, hoveredNotes, targetNote, handResults, hideKeyboard, config, calibration, fineTune]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1280} 
      height={720} 
      className="w-full h-full object-contain pointer-events-none"
    />
  );
};
