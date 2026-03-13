import React, { useState } from 'react';
import { Point, Calibration } from '../types';
import { motion } from 'motion/react';
import { Crosshair } from 'lucide-react';

interface CalibrationOverlayProps {
  onComplete: (calibration: Calibration) => void;
}

export const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({ onComplete }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const labels = ['Top Left', 'Top Right', 'Bottom Right', 'Bottom Left'];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const newPoints = [...points, { x, y }];
    if (newPoints.length === 4) {
      onComplete({
        topLeft: newPoints[0],
        topRight: newPoints[1],
        bottomRight: newPoints[2],
        bottomLeft: newPoints[3],
      });
      setPoints([]);
    } else {
      setPoints(newPoints);
    }
  };

  return (
    <div 
      className="absolute inset-0 z-50 cursor-crosshair bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center"
      onClick={handleClick}
    >
      <div className="bg-white p-6 border-2 border-[#141414] shadow-[8px_8px_0px_0px_#141414] max-w-md text-center pointer-events-none">
        <h2 className="text-xl font-bold uppercase tracking-tighter mb-2">Piano Calibration</h2>
        <p className="text-sm opacity-70 mb-4">
          Click the four corners of your piano keyboard in order:
          <br />
          <span className="font-bold text-[#141414]">
            {labels[points.length] || 'Done!'}
          </span>
        </p>
        <div className="flex justify-center gap-2">
          {labels.map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full border border-[#141414] ${i < points.length ? 'bg-[#141414]' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>

      {points.map((p, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute w-8 h-8 -ml-4 -mt-4 text-[#141414] pointer-events-none"
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
        >
          <Crosshair className="w-full h-full" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 bg-[#141414] text-[#E4E3E0] text-[10px] px-1 font-bold">
            {labels[i]}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
