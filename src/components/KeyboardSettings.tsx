import React from 'react';
import { KeyboardConfig } from '../types';

interface Props {
  config: KeyboardConfig;
  onChange: (config: KeyboardConfig) => void;
}

export const KeyboardSettings: React.FC<Props> = ({ config, onChange }) => {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 border-2 border-[#141414] shadow-[4px_4px_0px_0px_#141414] z-50 pointer-events-auto w-64">
      <h3 className="font-bold mb-3 text-sm uppercase tracking-wider border-b border-[#141414] pb-2">Keyboard Setup</h3>
      
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Presets</span>
          <select 
            className="border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '88') onChange({ totalKeys: 88, startMidi: 21 }); // A0
              if (val === '76') onChange({ totalKeys: 76, startMidi: 28 }); // E1
              if (val === '61') onChange({ totalKeys: 61, startMidi: 36 }); // C2
              if (val === '49') onChange({ totalKeys: 49, startMidi: 36 }); // C2
            }}
            value={config.totalKeys}
          >
            <option value="88">88 Keys (Standard)</option>
            <option value="76">76 Keys</option>
            <option value="61">61 Keys</option>
            <option value="49">49 Keys</option>
            <option value="custom">Custom...</option>
          </select>
        </label>
        
        <label className="flex flex-col gap-1">
          <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Total Keys</span>
          <input 
            type="number" 
            className="border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs"
            value={config.totalKeys}
            onChange={e => onChange({...config, totalKeys: parseInt(e.target.value) || 88})}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Leftmost Black Keys</span>
          <select 
            className="border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs"
            value={config.startMidi % 12}
            onChange={e => {
              const noteClass = parseInt(e.target.value);
              const octave = Math.floor(config.startMidi / 12);
              onChange({...config, startMidi: (octave * 12) + noteClass});
            }}
          >
            <option value={0}>Group of 2 (Starts on C)</option>
            <option value={9}>Group of 3 (Starts on A)</option>
            <option value={4}>Group of 3 (Starts on E)</option>
            <option value={5}>Group of 3 (Starts on F)</option>
          </select>
        </label>
      </div>
    </div>
  );
};
