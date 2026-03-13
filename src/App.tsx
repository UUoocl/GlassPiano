import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { NotationView } from './components/NotationView';
import { CalibrationOverlay } from './components/CalibrationOverlay';
import { MidiSelector } from './components/MidiSelector';
import { Calibration, Point } from './types';
import { mapPointToPiano, getPitchFromX, isKeyPress } from './services/visionService';
import { midiService } from './services/midiService';
import { Results } from '@mediapipe/hands';
import { Piano, Music, Settings, Info, Play, Pause, RefreshCw, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const CLEMENTI_NOTES = [60, 64, 60, 67, 60, 72, 67, 64, 60, 64, 60, 67]; // C4, E4, C4, G4, C4, C5, G4, E4, C4, E4, C4, G4

export default function App() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Rejection:', event.reason);
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showMidiSettings, setShowMidiSettings] = useState(false);
  const [selectedMidiId, setSelectedMidiId] = useState<string>('');
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [isFingerOver, setIsFingerOver] = useState(false);

  useEffect(() => {
    midiService.setCallbacks(
      (pitch) => {
        setActiveNotes(prev => [...new Set([...prev, pitch])]);
        
        // Advance if the correct MIDI note is hit
        const targetPitch = CLEMENTI_NOTES[currentNoteIndex % CLEMENTI_NOTES.length];
        if (pitch === targetPitch && !isPaused) {
          triggerSuccess();
        }
      },
      (pitch) => {
        setActiveNotes(prev => prev.filter(p => p !== pitch));
      }
    );
  }, [currentNoteIndex, isPaused]);

  const handleHandUpdate = useCallback((results: Results) => {
    if (!calibration || isPaused) {
      setIsFingerOver(false);
      return;
    }

    const newActiveNotes: number[] = [];
    let fingerOver = false;
    const targetPitch = CLEMENTI_NOTES[currentNoteIndex % CLEMENTI_NOTES.length];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Index finger tip is landmark 8
        const tip = landmarks[8];
        const mapped = mapPointToPiano({ x: tip.x, y: tip.y }, calibration);
        
        const pitch = getPitchFromX(mapped.x);
        if (pitch === targetPitch) {
          fingerOver = true;
        }

        if (isKeyPress(mapped)) {
          newActiveNotes.push(pitch);
        }
      }
    }
    setActiveNotes(newActiveNotes);
    setIsFingerOver(fingerOver);
  }, [calibration, isPaused, currentNoteIndex]);

  const triggerSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7']
    });
    setCurrentNoteIndex(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Piano className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">GlassPiano</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowMidiSettings(!showMidiSettings)}
            className={`p-2 transition-colors rounded-full ${showMidiSettings ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414] hover:text-[#E4E3E0]'}`}
            title="MIDI Settings"
          >
            <Keyboard className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded-full">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        {/* Left Column: Vision & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex-1 relative">
            <CameraView calibration={calibration} onHandUpdate={handleHandUpdate} />
            
            {isCalibrating && (
              <CalibrationOverlay onComplete={(cal) => {
                setCalibration(cal);
                setIsCalibrating(false);
              }} />
            )}

            <AnimatePresence>
              {showMidiSettings && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-4 right-4 z-40 w-72"
                >
                  <MidiSelector onDeviceSelect={(id) => {
                    setSelectedMidiId(id);
                    // Optionally auto-close or keep open
                  }} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="bg-black/80 text-white px-3 py-1 rounded-md text-xs font-mono border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                VISION ENGINE: ACTIVE
              </div>
              <div className="bg-black/80 text-white px-3 py-1 rounded-md text-xs font-mono border border-white/20">
                LATENCY: 24ms
              </div>
              <div className="bg-black/80 text-white px-3 py-1 rounded-md text-xs font-mono border border-white/20 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedMidiId ? 'bg-blue-500' : 'bg-gray-500'}`} />
                MIDI: {selectedMidiId ? 'CONNECTED' : 'NOT CONNECTED'}
              </div>
              {activeNotes.length > 0 && (
                <div className="bg-black/80 text-white px-3 py-1 rounded-md text-xs font-mono border border-white/20 flex flex-wrap gap-1 max-w-[200px]">
                  <span className="opacity-50">KEYS:</span>
                  {activeNotes.map(n => (
                    <span key={n} className="text-green-400">MIDI-{n}</span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Controls */}
          <div className="bg-white border border-[#141414] p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#141414]">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Start Session' : 'Pause Session'}
              </button>
              <button 
                onClick={() => setIsCalibrating(true)}
                className="flex items-center gap-2 px-6 py-2 border-2 border-[#141414] font-bold uppercase tracking-widest text-sm hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Recalibrate
              </button>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Current Exercise</p>
              <p className="font-serif italic text-lg">C Major Scale - Part 1</p>
            </div>
          </div>
        </div>

        {/* Right Column: Notation */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex-1">
            <NotationView 
              xmlUrl="/OpenSheetMusic/MuzioClementi_SonatinaOp36No1_Part1.xml" 
              currentNoteIndex={currentNoteIndex}
              isFingerOver={isFingerOver}
            />
          </div>

          {/* Stats / Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#141414] p-4 shadow-[4px_4px_0px_0px_#141414]">
              <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Accuracy</p>
              <p className="text-3xl font-mono">94%</p>
            </div>
            <div className="bg-white border border-[#141414] p-4 shadow-[4px_4px_0px_0px_#141414]">
              <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Notes Played</p>
              <p className="text-3xl font-mono">{currentNoteIndex} / 42</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
