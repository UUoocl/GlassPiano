import React, { useRef, useEffect } from 'react';
import { Results } from '@mediapipe/hands';
import { KeyboardConfig, Calibration } from '../types';
import { calculateKeyboardToCameraTransform, mapCameraToKeyboard } from '../services/vision/alignmentService';

interface KeyboardOverlayProps {
  activeNotes: number[];
  hoveredNotes: number[];
  targetNote: number | null;
  handResults: Results | null;
  hideKeyboard?: boolean;
  config: KeyboardConfig;
  calibration?: Calibration | null;
}

export const KeyboardOverlay: React.FC<KeyboardOverlayProps> = ({ 
  activeNotes, 
  hoveredNotes, 
  targetNote, 
  handResults, 
  hideKeyboard, 
  config,
  calibration 
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

      // Debug: Draw a small indicator to show the canvas is active
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(10, 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // Setup Transformation
      ctx.save();
      if (calibration) {
        const transform = calculateKeyboardToCameraTransform(calibration);
        const { tx, ty, rotation, scale } = transform;
        ctx.translate(tx * width, ty * height);
        ctx.rotate(rotation);
        ctx.scale(scale * width, scale * width);
      } else {
        ctx.translate(0, height - 120);
        ctx.scale(width, 1);
      }

      if (!hideKeyboard) {
        // Draw Virtual Keyboard in normalized (0-1) X-space
        const { totalKeys, startMidi } = config;
        const endMidi = startMidi + totalKeys - 1;
        
        let numWhiteKeys = 0;
        for (let pitch = startMidi; pitch <= endMidi; pitch++) {
          if (![1, 3, 6, 8, 10].includes(pitch % 12)) numWhiteKeys++;
        }
        
        const whiteKeyWidth = 1 / numWhiteKeys;
        const keyHeight = calibration ? 0.3 : 120; // Height in transformed units
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
            ctx.fillRect(x, 0, whiteKeyWidth, keyHeight);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 0.002;
            ctx.strokeRect(x, 0, whiteKeyWidth, keyHeight);
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
            ctx.fillRect(x, 0, whiteKeyWidth * 0.6, keyHeight * 0.6);
          } else {
            whiteKeyIndex++;
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // Draw Hands in the same transformed context
      if (handResults && handResults.multiHandLandmarks && handResults.multiHandLandmarks.length > 0) {
        handResults.multiHandLandmarks.forEach((rawLandmarks, handIndex) => {
          // Map landmarks to keyboard space if calibration exists
          const landmarks = calibration 
            ? rawLandmarks.map(p => mapCameraToKeyboard(p, calibration))
            : rawLandmarks.map(p => ({ x: p.x, y: (p.y * height - (height - 120)) / 1 })); // Simple fallback mapping

          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
          ];

          ctx.strokeStyle = handIndex === 0 ? '#00ff00' : '#00ffff';
          ctx.lineWidth = 0.005; // Line width in normalized units
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
            ctx.arc(p.x, p.y, 0.008, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.002;
            ctx.stroke();
          });
        });
      }
      
      ctx.restore();
    };

    render();
  }, [activeNotes, hoveredNotes, targetNote, handResults, hideKeyboard, config, calibration]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1280} 
      height={720} 
      className="w-full h-full object-contain pointer-events-none"
    />
  );
};
