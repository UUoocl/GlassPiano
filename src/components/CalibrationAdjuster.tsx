import React, { useRef, useEffect, useState } from 'react';
import { Calibration, KeyboardConfig, FineTune } from '../types';
import { calculateKeyboardToCameraTransform } from '../services/vision/alignmentService';

interface Props {
  calibration: Calibration;
  fineTune?: FineTune | null;
  onChange: (cal: Calibration) => void;
  hoveredNotes: number[];
  activeNotes: number[];
  config: KeyboardConfig;
}

export const CalibrationAdjuster: React.FC<Props> = ({ calibration, fineTune, onChange, hoveredNotes, activeNotes, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<keyof Calibration | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    
    // Position parallel to frame bottom
    const kbdHeightNormalized = 0.15;
    const kbdY = height - (height * kbdHeightNormalized) - 20;
    
    ctx.translate(0, kbdY);
    ctx.scale(width, height * kbdHeightNormalized);

    // Since we applied the full transform, we now draw in normalized keyboard space (0 to 1)
    const { totalKeys, startMidi } = config;
    const endMidi = startMidi + totalKeys - 1;

    const whiteKeys: number[] = [];
    for (let pitch = startMidi; pitch <= endMidi; pitch++) {
      if (![1, 3, 6, 8, 10].includes(pitch % 12)) {
        whiteKeys.push(pitch);
      }
    }
    const numWhiteKeys = whiteKeys.length;
    const whiteKeyWidth = 1 / numWhiteKeys;

    // Draw white keys
    whiteKeys.forEach((pitch, i) => {
      const x = i * whiteKeyWidth;
      ctx.beginPath();
      ctx.rect(x, 0, whiteKeyWidth, 0.3); // Height in transformed units
      
      if (activeNotes.includes(pitch)) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)'; // Green
        ctx.fill();
      } else if (hoveredNotes.includes(pitch)) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.6)'; // Yellow
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 0.002;
      ctx.stroke();
    });

    // Draw black keys
    let whiteKeyIndex = 0;
    for (let pitch = startMidi; pitch <= endMidi; pitch++) {
      const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
      if (isBlack) {
        const x = (whiteKeyIndex * whiteKeyWidth) - (whiteKeyWidth * 0.3);
        ctx.beginPath();
        ctx.rect(x, 0, whiteKeyWidth * 0.6, 0.3 * 0.6);
        
        if (activeNotes.includes(pitch)) {
          ctx.fillStyle = 'rgba(22, 163, 74, 0.8)'; // Dark Green
        } else if (hoveredNotes.includes(pitch)) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.8)'; // Dark Yellow
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.001;
        ctx.stroke();
      } else {
        whiteKeyIndex++;
      }
    }
    
    ctx.restore();
  }, [calibration, fineTune, hoveredNotes, activeNotes, config]);

  const handlePointerDown = (point: keyof Calibration) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingPoint(point);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPoint || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    onChange({
      ...calibration,
      [draggingPoint]: { x, y }
    });
  };

  const handlePointerUp = () => {
    setDraggingPoint(null);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-50 touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      {(Object.keys(calibration) as Array<keyof Calibration>).map((key) => {
        const p = calibration[key];
        return (
          <div
            key={key}
            onPointerDown={handlePointerDown(key)}
            className="absolute w-8 h-8 -ml-4 -mt-4 bg-white border-4 border-blue-500 rounded-full cursor-move shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform flex items-center justify-center"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
};
