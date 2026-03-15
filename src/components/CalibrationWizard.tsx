import React, { useState, useEffect } from 'react';
import { MidiSelector } from './MidiSelector';
import { midiService } from '../services/midiService';

type CalibrationStep = 'midi' | 'detection' | 'config' | 'corners';

interface Props {
  onComplete: (config: any) => void;
}

export const CalibrationWizard: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<CalibrationStep>('midi');
  const [selectedMidiId, setSelectedMidiId] = useState<string>('');
  const [detectedPitch, setDetectedPitch] = useState<number | null>(null);

  useEffect(() => {
    if (step === 'detection') {
      midiService.setCallbacks(
        (pitch) => {
          setDetectedPitch(pitch);
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
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => onComplete({})}
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
