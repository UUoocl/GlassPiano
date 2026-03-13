import React, { useRef, useEffect } from 'react';
import { Results } from '@mediapipe/hands';
import { KeyboardConfig } from '../types';

interface KeyboardOverlayProps {
  activeNotes: number[];
  hoveredNotes: number[];
  targetNote: number | null;
  handResults: Results | null;
  hideKeyboard?: boolean;
  config: KeyboardConfig;
}

export const KeyboardOverlay: React.FC<KeyboardOverlayProps> = ({ activeNotes, hoveredNotes, targetNote, handResults, hideKeyboard, config }) => {
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

      // Debug: Draw a small indicator to show the canvas is active
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(10, 10, 5, 0, Math.PI * 2);
      ctx.fill();

      if (!hideKeyboard) {
        // Draw Virtual Keyboard
        const { totalKeys, startMidi } = config;
        const endMidi = startMidi + totalKeys - 1;
        
        let numWhiteKeys = 0;
        for (let pitch = startMidi; pitch <= endMidi; pitch++) {
          if (![1, 3, 6, 8, 10].includes(pitch % 12)) numWhiteKeys++;
        }
        
        const whiteKeyWidth = width / numWhiteKeys;
        let whiteKeyIndex = 0;
        
        ctx.globalAlpha = 0.4;
        for (let pitch = startMidi; pitch <= endMidi; pitch++) {
          const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
          if (!isBlack) {
            const x = whiteKeyIndex * whiteKeyWidth;
            
            let color = '#fff';
            if (activeNotes.includes(pitch)) color = '#22c55e'; // Pressed: Green
            else if (pitch === targetNote) color = '#ef4444'; // Target: Red
            else if (hoveredNotes.includes(pitch)) color = '#fde047'; // Hover: Yellow
            
            ctx.fillStyle = color;
            ctx.fillRect(x, height - 120, whiteKeyWidth - 1, 120);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.strokeRect(x, height - 120, whiteKeyWidth - 1, 120);
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
            if (activeNotes.includes(pitch)) color = '#16a34a'; // Pressed: Dark Green
            else if (pitch === targetNote) color = '#dc2626'; // Target: Dark Red
            else if (hoveredNotes.includes(pitch)) color = '#eab308'; // Hover: Dark Yellow
            
            ctx.fillStyle = color;
            ctx.fillRect(x, height - 120, whiteKeyWidth * 0.6, 75);
          } else {
            whiteKeyIndex++;
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Draw Hands
      if (handResults && handResults.multiHandLandmarks && handResults.multiHandLandmarks.length > 0) {
        handResults.multiHandLandmarks.forEach((landmarks, handIndex) => {
          // Draw connections with high visibility
          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
          ];

          ctx.strokeStyle = handIndex === 0 ? '#00ff00' : '#00ffff';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          connections.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
          });
          ctx.stroke();

          // Draw joints
          landmarks.forEach((p) => {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(p.x * width, p.y * height, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          // Draw fingertip glow
          const fingerTips = [4, 8, 12, 16, 20];
          fingerTips.forEach((i) => {
            const p = landmarks[i];
            const gradient = ctx.createRadialGradient(
              p.x * width, p.y * height, 0,
              p.x * width, p.y * height, 15
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x * width, p.y * height, 15, 0, Math.PI * 2);
            ctx.fill();
          });
        });
      }
    };

    render();
  }, [activeNotes, hoveredNotes, targetNote, handResults, hideKeyboard, config]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1280} 
      height={720} 
      className="w-full h-full object-contain pointer-events-none"
    />
  );
};
