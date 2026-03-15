import React, { useEffect, useState } from 'react';
import { KeyboardConfig } from '../types';
import { midiService, MidiDevice } from '../services/midiService';
import { motion } from 'motion/react';
import { Keyboard, Check, AlertCircle } from 'lucide-react';

interface Props {
  config: KeyboardConfig;
  onChange: (config: KeyboardConfig) => void;
  selectedMidiId: string;
  onMidiSelect: (id: string) => void;
}

export const KeyboardSettings: React.FC<Props> = ({ config, onChange, selectedMidiId, onMidiSelect }) => {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const initMidi = async () => {
      const supported = await midiService.requestAccess();
      setIsSupported(supported);
      if (supported) {
        updateDevices();
        midiService.onStateChange(updateDevices);
      }
    };

    const updateDevices = () => {
      const inputs = midiService.getInputs();
      setDevices(inputs);
    };

    initMidi();
  }, []);

  const handleMidiSelect = (id: string) => {
    midiService.connect(id);
    onMidiSelect(id);
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="absolute top-4 right-4 bg-white p-4 border-2 border-[#141414] shadow-[4px_4px_0px_0px_#141414] z-50 pointer-events-auto w-72 cursor-default"
    >
      <div className="cursor-move mb-3 border-b border-[#141414] pb-2 flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider">Keyboard Setup</h3>
        <div className="w-4 h-4 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M7 7h10M7 12h10M7 17h10" />
          </svg>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 text-sm">
        <div className="space-y-3">
          <label className="flex flex-col gap-1">
            <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Presets</span>
            <select 
              className="border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs cursor-pointer"
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
            <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Layout Starts On</span>
            <select 
              className="border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs cursor-pointer"
              value={config.startMidi % 12}
              onChange={e => {
                const noteClass = parseInt(e.target.value);
                const octave = Math.floor(config.startMidi / 12);
                onChange({...config, startMidi: (octave * 12) + noteClass});
              }}
            >
              <option value={0}>C</option>
              <option value={2}>D</option>
              <option value={4}>E</option>
              <option value={5}>F</option>
              <option value={7}>G</option>
              <option value={9}>A</option>
              <option value={11}>B</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">First Group of Upper Keys</span>
            <select 
              className="border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs cursor-pointer"
              value={[1, 3].includes((config.startMidi + 1) % 12) ? '2' : '3'}
              onChange={e => {
                // If they pick 2, we should probably jump to the nearest C or similar.
                // But specifically the user is asking 2 or 3.
                // 2 keys group is near C, 3 keys group is near F.
                const val = e.target.value;
                const octave = Math.floor(config.startMidi / 12);
                if (val === '2') onChange({...config, startMidi: (octave * 12) + 0}); // C
                if (val === '3') onChange({...config, startMidi: (octave * 12) + 5}); // F
              }}
            >
              <option value="2">Group of 2 (e.g. Starts near C)</option>
              <option value="3">Group of 3 (e.g. Starts near F)</option>
            </select>
          </label>
        </div>

        <div className="border-t border-[#141414] pt-3">
          <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest mb-2 block">MIDI Input</span>
          {!isSupported ? (
            <div className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase">
              <AlertCircle className="w-3 h-3" />
              Not Supported
            </div>
          ) : devices.length === 0 ? (
            <p className="text-[10px] opacity-50 italic">No devices found</p>
          ) : (
            <select 
              className="w-full border-2 border-[#141414] p-1.5 rounded-none bg-white font-mono text-xs cursor-pointer"
              value={selectedMidiId}
              onChange={(e) => handleMidiSelect(e.target.value)}
            >
              <option value="">Select MIDI Device...</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </motion.div>
  );
};
