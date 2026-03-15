import React, { useState, useEffect } from 'react';
import { MidiSelector } from './MidiSelector';
import { midiService } from '../services/midiService';
import { KeyboardConfig } from '../types';

type CalibrationStep = 'midi' | 'detection' | 'config' | 'corners';

interface Props {
  onComplete: (config: { midiId: string, keyboard: KeyboardConfig }) => void;
}

export const CalibrationWizard: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<CalibrationStep>('midi');
  const [selectedMidiId, setSelectedMidiId] = useState<string>('');
  const [detectedPitch, setDetectedPitch] = useState<number | null>(null);
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({ totalKeys: 88, startMidi: 21 });

  useEffect(() => {
    if (step === 'detection') {
      midiService.setCallbacks(
        (pitch) => {
          setDetectedPitch(pitch);
          // Set startMidi to the detected pitch automatically
          setKeyboardConfig(prev => ({ ...prev, startMidi: pitch }));
        },
        () => {}
      );
    }
  }, [step]);

  return (
    <div className="calibration-wizard fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white p-8 border-2 border-[#141414] shadow-[12px_12px_0px_0px_#141414] w-full max-w-lg">
        {step === 'midi' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Step 1: Select MIDI Device</h2>
            <MidiSelector onDeviceSelect={(id) => setSelectedMidiId(id)} />
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setStep('detection')}
                disabled={!selectedMidiId}
                className={`px-8 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
                  selectedMidiId 
                    ? 'bg-[#141414] text-[#E4E3E0] hover:scale-105' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 'detection' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Step 2: Press the leftmost key</h2>
            <p className="opacity-70 text-sm">Please press the lowest key on your physical keyboard. This helps us understand your piano's layout.</p>
            
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-[#141414]/20 rounded-lg">
              {detectedPitch !== null ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <div className="text-green-500 font-bold uppercase text-xs mb-1">Key Detected!</div>
                  <div className="text-4xl font-mono font-bold tracking-tighter">
                    MIDI {detectedPitch}
                  </div>
                </div>
              ) : (
                <div className="text-sm opacity-40 italic animate-pulse">Waiting for key press...</div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setStep('config')}
                disabled={detectedPitch === null}
                className={`px-8 py-3 font-bold uppercase tracking-widest text-sm transition-all ${
                  detectedPitch !== null 
                    ? 'bg-[#141414] text-[#E4E3E0] hover:scale-105' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 'config' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Step 3: Keyboard Configuration</h2>
            
            <div className="flex flex-col gap-4 text-sm">
              <label className="flex flex-col gap-1">
                <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Number of Keys (Presets)</span>
                <select 
                  className="border-2 border-[#141414] p-2 rounded-none bg-white font-mono text-xs cursor-pointer"
                  value={keyboardConfig.totalKeys}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'custom') {
                      setKeyboardConfig(prev => ({ ...prev, totalKeys: parseInt(val) }));
                    }
                  }}
                >
                  <option value="88">88 Keys (Standard)</option>
                  <option value="76">76 Keys</option>
                  <option value="61">61 Keys</option>
                  <option value="49">49 Keys</option>
                  <option value="25">25 Keys</option>
                  <option value="custom">Custom...</option>
                </select>
              </label>

              {![88, 76, 61, 49, 25].includes(keyboardConfig.totalKeys) && (
                <label className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-300">
                  <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">Custom Total Keys</span>
                  <input 
                    type="number" 
                    className="border-2 border-[#141414] p-2 rounded-none bg-white font-mono text-xs"
                    value={keyboardConfig.totalKeys}
                    onChange={e => setKeyboardConfig(prev => ({...prev, totalKeys: parseInt(e.target.value) || 0}))}
                  />
                </label>
              )}

              <label className="flex flex-col gap-1">
                <span className="opacity-70 text-[10px] font-bold uppercase tracking-widest">First Group of Upper Keys</span>
                <select 
                  className="border-2 border-[#141414] p-2 rounded-none bg-white font-mono text-xs cursor-pointer"
                  value={[1, 3].includes((keyboardConfig.startMidi + 1) % 12) ? '2' : '3'}
                  onChange={e => {
                    const val = e.target.value;
                    const octave = Math.floor(keyboardConfig.startMidi / 12);
                    if (val === '2') setKeyboardConfig(prev => ({...prev, startMidi: (octave * 12) + 0})); // C
                    if (val === '3') setKeyboardConfig(prev => ({...prev, startMidi: (octave * 12) + 5})); // F
                  }}
                >
                  <option value="2">Group of 2 (e.g. Starts near C)</option>
                  <option value="3">Group of 3 (e.g. Starts near F)</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setStep('corners')}
                className="px-8 py-3 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 'corners' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Step 4: Piano Calibration</h2>
            <p className="opacity-70 text-sm">Now, please select the 4 corners of your piano keyboard in the camera view.</p>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => onComplete({ midiId: selectedMidiId, keyboard: keyboardConfig })}
                className="px-8 py-3 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
