import React, { useRef, useEffect, useState } from 'react';
import { Calibration, KeyboardConfig } from '../types';

interface Props {
  calibration: Calibration;
  onChange: (cal: Calibration) => void;
  hoveredNotes: number[];
  activeNotes: number[];
  config: KeyboardConfig;
}

export const CalibrationAdjuster: React.FC<Props> = ({ calibration, onChange, hoveredNotes, activeNotes, config }) => {
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

    const { topLeft, topRight, bottomLeft, bottomRight } = calibration;
    const { totalKeys, startMidi } = config;
    const endMidi = startMidi + totalKeys - 1;

    const whiteKeys: number[] = [];
    for (let pitch = startMidi; pitch <= endMidi; pitch++) {
      if (![1, 3, 6, 8, 10].includes(pitch % 12)) {
        whiteKeys.push(pitch);
      }
    }
    const numWhiteKeys = whiteKeys.length;

    // Draw white keys
    whiteKeys.forEach((pitch, i) => {
      const t1 = i / numWhiteKeys;
      const t2 = (i + 1) / numWhiteKeys;

      const tl = { x: topLeft.x + (topRight.x - topLeft.x) * t1, y: topLeft.y + (topRight.y - topLeft.y) * t1 };
      const tr = { x: topLeft.x + (topRight.x - topLeft.x) * t2, y: topLeft.y + (topRight.y - topLeft.y) * t2 };
      const br = { x: bottomLeft.x + (bottomRight.x - bottomLeft.x) * t2, y: bottomLeft.y + (bottomRight.y - bottomLeft.y) * t2 };
      const bl = { x: bottomLeft.x + (bottomRight.x - bottomLeft.x) * t1, y: bottomLeft.y + (bottomRight.y - bottomLeft.y) * t1 };

      ctx.beginPath();
      ctx.moveTo(tl.x * width, tl.y * height);
      ctx.lineTo(tr.x * width, tr.y * height);
      ctx.lineTo(br.x * width, br.y * height);
      ctx.lineTo(bl.x * width, bl.y * height);
      ctx.closePath();

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
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw black keys
    let currentWhiteIndex = 0;
    for (let pitch = startMidi; pitch <= endMidi; pitch++) {
      const isBlack = [1, 3, 6, 8, 10].includes(pitch % 12);
      
      if (isBlack) {
        const tCenter = currentWhiteIndex / numWhiteKeys;
        const blackKeyWidth = (1 / numWhiteKeys) * 0.6;
        const t1 = tCenter - blackKeyWidth / 2;
        const t2 = tCenter + blackKeyWidth / 2;
        
        // Black keys go about 60% down the keyboard
        const midY = 0.6;
        
        const tl = { x: topLeft.x + (topRight.x - topLeft.x) * t1, y: topLeft.y + (topRight.y - topLeft.y) * t1 };
        const tr = { x: topLeft.x + (topRight.x - topLeft.x) * t2, y: topLeft.y + (topRight.y - topLeft.y) * t2 };
        
        const mlLeft = { x: topLeft.x + (bottomLeft.x - topLeft.x) * midY, y: topLeft.y + (bottomLeft.y - topLeft.y) * midY };
        const mlRight = { x: topRight.x + (bottomRight.x - topRight.x) * midY, y: topRight.y + (bottomRight.y - topRight.y) * midY };
        
        const bl = { x: mlLeft.x + (mlRight.x - mlLeft.x) * t1, y: mlLeft.y + (mlRight.y - mlLeft.y) * t1 };
        const br = { x: mlLeft.x + (mlRight.x - mlLeft.x) * t2, y: mlLeft.y + (mlRight.y - mlLeft.y) * t2 };

        ctx.beginPath();
        ctx.moveTo(tl.x * width, tl.y * height);
        ctx.lineTo(tr.x * width, tr.y * height);
        ctx.lineTo(br.x * width, br.y * height);
        ctx.lineTo(bl.x * width, bl.y * height);
        ctx.closePath();

        if (activeNotes.includes(pitch)) {
          ctx.fillStyle = 'rgba(22, 163, 74, 0.8)'; // Dark Green
        } else if (hoveredNotes.includes(pitch)) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.8)'; // Dark Yellow
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();
      } else {
        currentWhiteIndex++;
      }
    }
  }, [calibration, hoveredNotes, activeNotes, config]);

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
