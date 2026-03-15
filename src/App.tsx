import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { NotationView } from './components/NotationView';
import { CalibrationOverlay } from './components/CalibrationOverlay';
import { CalibrationAdjuster } from './components/CalibrationAdjuster';
import { KeyboardSettings } from './components/KeyboardSettings';
import { MidiSelector } from './components/MidiSelector';
import { KeyboardOverlay } from './components/KeyboardOverlay';
import { CalibrationWizard } from './components/CalibrationWizard';
import { Calibration, Point, KeyboardConfig, FineTune } from './types';
import { mapPointToPiano, getPitchFromX, KeystrokeDetector } from './services/vision';
import { midiService } from './services/midiService';
import { Results } from '@mediapipe/hands';
import { Piano, Music, Settings, Info, Play, Pause, RefreshCw, Keyboard, Eye, EyeOff, Layout } from 'lucide-react';
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
  const [calibrationStep, setCalibrationStep] = useState<'wizard' | 'verify' | 'complete'>('wizard');
  const [verificationStage, setVerificationStage] = useState<'adjust' | 'press-low' | 'press-high'>('adjust');
  const [lastDetectedPitch, setLastDetectedPitch] = useState<number | null>(null);
  const [fineTune, setFineTune] = useState<FineTune>({ rotation: 0, scale: 1, offsetX: 0, offsetY: 0 });
  const [keyboardConfig, setKeyboardConfig] = useState<KeyboardConfig>({ totalKeys: 88, startMidi: 21 });
  const [showMidiSettings, setShowMidiSettings] = useState(false);
  const [selectedMidiId, setSelectedMidiId] = useState<string>('');
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [showKeyboardOverlay, setShowKeyboardOverlay] = useState(true);
  const [showHUD, setShowHUD] = useState(true);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [hoveredNotes, setHoveredNotes] = useState<number[]>([]);
  const [isFingerOver, setIsFingerOver] = useState(false);
  const [handResults, setHandResults] = useState<Results | null>(null);
  
  const keystrokeDetector = useRef(new KeystrokeDetector());

  // Auto-compact mode on small heights
  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < 700) {
        setIsCompact(true);
      } else {
        setIsCompact(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerSuccess = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7']
    });
    setCurrentNoteIndex(prev => prev + 1);
  }, [currentNoteIndex]);

  useEffect(() => {
    midiService.setCallbacks(
      (pitch) => {
        setActiveNotes(prev => [...new Set([...prev, pitch])]);
        
        if (calibrationStep === 'verify') {
          setLastDetectedPitch(pitch);
          if (verificationStage === 'press-low') {
            // Check if it's the lowest white key
            if (pitch === keyboardConfig.startMidi) {
              setVerificationStage('press-high');
            }
          } else if (verificationStage === 'press-high') {
            const endMidi = keyboardConfig.startMidi + keyboardConfig.totalKeys - 1;
            // Find highest white key
            let highestWhite = endMidi;
            while ([1, 3, 6, 8, 10].includes(highestWhite % 12)) highestWhite--;
            
            if (pitch === highestWhite) {
              setCalibrationStep('complete');
            }
          }
        }

        // Advance if the correct MIDI note is hit
        const targetPitch = CLEMENTI_NOTES[currentNoteIndex % CLEMENTI_NOTES.length];
        if (pitch === targetPitch && !isPaused && calibrationStep === 'complete') {
          triggerSuccess();
        }
      },
      (pitch) => {
        setActiveNotes(prev => prev.filter(p => p !== pitch));
      }
    );
  }, [currentNoteIndex, isPaused, calibrationStep, verificationStage, keyboardConfig, triggerSuccess]);

  const handleHandUpdate = useCallback((results: Results) => {
    setHandResults(results);
    
    if (!calibration || isPaused) {
      setIsFingerOver(false);
      return;
    }

    const newActiveNotes: number[] = [];
    const newHoveredNotes: number[] = [];
    let fingerOver = false;
    const targetPitch = CLEMENTI_NOTES[currentNoteIndex % CLEMENTI_NOTES.length];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
        
        for (const tipIndex of fingerTips) {
          const tip = landmarks[tipIndex];
          // Use our mapping service which now supports fineTune
          const mapped = mapPointToPiano({ x: tip.x, y: tip.y }, calibration, fineTune);
          
          // Only process if the finger is within the calibrated area (with some margin)
          if (mapped.x >= -0.05 && mapped.x <= 1.05 && mapped.y >= -0.1 && mapped.y <= 1.1) {
            const pitch = getPitchFromX(mapped.x, keyboardConfig);
            
            if (pitch >= keyboardConfig.startMidi && pitch < keyboardConfig.startMidi + keyboardConfig.totalKeys) {
              newHoveredNotes.push(pitch);
              
              if (pitch === targetPitch) {
                fingerOver = true;
              }

              if (keystrokeDetector.current.processPoint(mapped, pitch)) {
                newActiveNotes.push(pitch);
              }

              // Advance if the correct note is just hit by the vision detector
              if (pitch === targetPitch && keystrokeDetector.current.wasJustPressed(mapped, pitch)) {
                triggerSuccess();
              }
            }
          }
        }
      }
    }
    setActiveNotes(newActiveNotes);
    setHoveredNotes(newHoveredNotes);
    setIsFingerOver(fingerOver);
  }, [calibration, isPaused, currentNoteIndex, keyboardConfig, triggerSuccess, fineTune]);

  return (
    <div className="h-screen overflow-hidden bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#141414] p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Piano className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">GlassPiano</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowKeyboardOverlay(!showKeyboardOverlay)}
            className={`p-2 transition-colors rounded-full ${!showKeyboardOverlay ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414] hover:text-[#E4E3E0]'}`}
            title={showKeyboardOverlay ? "Hide Keyboard Overlay" : "Show Keyboard Overlay"}
          >
            {showKeyboardOverlay ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setShowHUD(!showHUD)}
            className={`p-2 transition-colors rounded-full ${!showHUD ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414] hover:text-[#E4E3E0]'}`}
            title={showHUD ? "Hide HUD" : "Show HUD"}
          >
            <Layout className="w-5 h-5" />
          </button>
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

      <main className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 flex-1 min-h-0 relative">
        {/* Persistent Camera View (Hidden in practice mode, but always processing) */}
        <div className={`
          ${calibrationStep !== 'complete' 
            ? 'flex-1 flex flex-col items-center justify-center z-10' 
            : 'fixed opacity-0 pointer-events-none -z-50'}
        `}>
          <div className="w-full max-w-4xl aspect-video relative bg-black rounded-xl overflow-hidden shadow-[12px_12px_0px_0px_#141414] border-4 border-[#141414]">
            <CameraView 
              calibration={calibration} 
              onHandUpdate={handleHandUpdate} 
              showVideo={calibrationStep !== 'complete'} 
            />
            
            {calibrationStep === 'wizard' && (
              <CalibrationWizard onComplete={(config) => {
                setSelectedMidiId(config.midiId);
                setKeyboardConfig(config.keyboard);
                setCalibration(config.calibration);
                setCalibrationStep('verify');
              }} />
            )}

            {calibrationStep === 'verify' && (
              <div className="absolute inset-0">
                {verificationStage === 'adjust' && (
                  <CalibrationAdjuster 
                    calibration={calibration!}
                    fineTune={fineTune}
                    onChange={setCalibration}
                    activeNotes={activeNotes}
                    hoveredNotes={hoveredNotes}
                    config={keyboardConfig}
                  />
                )}
                <div className="absolute inset-0 pointer-events-none z-40">
                  <KeyboardOverlay 
                    activeNotes={activeNotes}
                    hoveredNotes={hoveredNotes}
                    targetNote={
                      verificationStage === 'press-low' ? keyboardConfig.startMidi :
                      verificationStage === 'press-high' ? (() => {
                        const endMidi = keyboardConfig.startMidi + keyboardConfig.totalKeys - 1;
                        let highestWhite = endMidi;
                        while ([1, 3, 6, 8, 10].includes(highestWhite % 12)) highestWhite--;
                        return highestWhite;
                      })() : null
                    }
                    handResults={handResults}
                    hideKeyboard={false}
                    config={keyboardConfig}
                    calibration={calibration}
                    fineTune={fineTune}
                  />
                </div>
                <motion.div 
                  drag
                  dragMomentum={false}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-6 border-2 border-[#141414] shadow-[8px_8px_0px_0px_#141414] w-[90%] max-w-md text-center pointer-events-auto z-[60] cursor-default"
                >
                  <div className="cursor-move mb-2 opacity-20 flex justify-center">
                    <svg className="w-6 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M7 7h10M7 12h10M7 17h10" />
                    </svg>
                  </div>
                  
                  {verificationStage === 'adjust' && (
                    <>
                      <h2 className="text-xl font-bold uppercase tracking-tighter mb-2">Adjust & Verify</h2>
                      <p className="text-sm opacity-70 mb-4">
                        Drag the blue corners to align. Use sliders for fine-tuning.
                      </p>
                      
                      {/* Fine Tuning Sliders */}
                      <div className="flex flex-col gap-2 mb-6 text-left">
                        <label className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase opacity-50">Rotation</span>
                            <span className="text-[10px] font-mono">{(fineTune.rotation * 180 / Math.PI).toFixed(1)}°</span>
                          </div>
                          <input 
                            type="range" min="-0.2" max="0.2" step="0.005" 
                            className="accent-[#141414]"
                            value={fineTune.rotation} 
                            onChange={e => setFineTune(prev => ({...prev, rotation: parseFloat(e.target.value)}))} 
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase opacity-50">Scale</span>
                            <span className="text-[10px] font-mono">{fineTune.scale.toFixed(2)}x</span>
                          </div>
                          <input 
                            type="range" min="0.8" max="1.2" step="0.005" 
                            className="accent-[#141414]"
                            value={fineTune.scale} 
                            onChange={e => setFineTune(prev => ({...prev, scale: parseFloat(e.target.value)}))} 
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase opacity-50">X Offset</span>
                            <input 
                              type="range" min="-0.1" max="0.1" step="0.002" 
                              className="accent-[#141414]"
                              value={fineTune.offsetX} 
                              onChange={e => setFineTune(prev => ({...prev, offsetX: parseFloat(e.target.value)}))} 
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase opacity-50">Y Offset</span>
                            <input 
                              type="range" min="-0.1" max="0.1" step="0.002" 
                              className="accent-[#141414]"
                              value={fineTune.offsetY} 
                              onChange={e => setFineTune(prev => ({...prev, offsetY: parseFloat(e.target.value)}))} 
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4 justify-center">
                        <button 
                          onClick={() => {
                            setCalibration(null);
                            setCalibrationStep('wizard');
                            setFineTune({ rotation: 0, scale: 1, offsetX: 0, offsetY: 0 });
                          }}
                          className="px-6 py-2 border-2 border-[#141414] font-bold uppercase tracking-widest text-sm hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                        >
                          Restart
                        </button>
                        <button 
                          onClick={() => setVerificationStage('press-low')}
                          className="px-6 py-2 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform"
                        >
                          Confirm
                        </button>
                      </div>
                    </>
                  )}

                  {verificationStage === 'press-low' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 text-red-500">Press the lowest white key</h2>
                      <p className="text-sm opacity-70 mb-6">
                        We need to confirm the alignment. Please press the key highlighted in red on the overlay.
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-bold uppercase opacity-40">Waiting for pitch: {keyboardConfig.startMidi}</div>
                        {lastDetectedPitch !== null && lastDetectedPitch !== keyboardConfig.startMidi && (
                          <div className="text-xs text-amber-600 font-bold">Detected: {lastDetectedPitch} (Try again)</div>
                        )}
                      </div>
                    </div>
                  )}

                  {verificationStage === 'press-high' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 text-red-500">Press the highest white key</h2>
                      <p className="text-sm opacity-70 mb-6">
                        Almost there! Now press the highest white key highlighted in red.
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-[10px] font-bold uppercase opacity-40">
                          Waiting for pitch: {(() => {
                            const endMidi = keyboardConfig.startMidi + keyboardConfig.totalKeys - 1;
                            let highestWhite = endMidi;
                            while ([1, 3, 6, 8, 10].includes(highestWhite % 12)) highestWhite--;
                            return highestWhite;
                          })()}
                        </div>
                        {lastDetectedPitch !== null && lastDetectedPitch !== (() => {
                          const endMidi = keyboardConfig.startMidi + keyboardConfig.totalKeys - 1;
                          let highestWhite = endMidi;
                          while ([1, 3, 6, 8, 10].includes(highestWhite % 12)) highestWhite--;
                          return highestWhite;
                        })() && (
                          <div className="text-xs text-amber-600 font-bold">Detected: {lastDetectedPitch} (Try again)</div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
            
            <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-md font-mono border border-white/20">
              {calibrationStep === 'wizard' ? 'STEP 1: SEQUENTIAL WIZARD' : 'STEP 2: VERIFY MAPPING'}
            </div>
          </div>
        </div>

        {/* Practice Mode UI */}
        {calibrationStep === 'complete' && (
          <div className={`flex-1 flex flex-col ${isCompact ? 'gap-2' : 'gap-4 md:gap-6'} min-h-0 animate-in fade-in duration-500`}>
            <div className="flex-1 relative bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_#141414] overflow-hidden rounded-xl min-h-0">
              {/* The base layer: Sheet Music */}
              <NotationView 
                xmlUrl="/OpenSheetMusic/MuzioClementi_SonatinaOp36No1_Part1.xml" 
                currentNoteIndex={currentNoteIndex}
                isFingerOver={isFingerOver}
              />
              
              {/* The overlay layer: Keyboard & Hands */}
              {showKeyboardOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                  <KeyboardOverlay 
                    activeNotes={activeNotes}
                    hoveredNotes={hoveredNotes}
                    targetNote={CLEMENTI_NOTES[currentNoteIndex % CLEMENTI_NOTES.length]}
                    handResults={handResults}
                    config={keyboardConfig}
                    calibration={calibration}
                    fineTune={fineTune}
                  />
                </div>
              )}

              {/* HUD Overlay */}
              {showHUD && (
                <div className={`absolute ${isCompact ? 'top-2 left-2 gap-1' : 'top-4 left-4 gap-2'} flex flex-col pointer-events-none`}>
                  <div className="bg-black/80 text-white px-3 py-1 rounded-md text-[10px] font-mono border border-white/20 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${handResults?.multiHandLandmarks?.length ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isCompact ? 'CAM' : `HANDS: ${handResults?.multiHandLandmarks?.length ? 'DETECTED' : 'NOT FOUND'}`}
                  </div>
                  <div className="bg-black/80 text-white px-3 py-1 rounded-md text-[10px] font-mono border border-white/20 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedMidiId ? 'bg-blue-500' : 'bg-gray-500'}`} />
                    {isCompact ? 'MIDI' : `MIDI: ${selectedMidiId ? 'CONNECTED' : 'NOT CONNECTED'}`}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? 'gap-2' : 'gap-4 md:gap-6'} items-end shrink-0`}>
              <div className={`lg:col-span-8 bg-white border-2 border-[#141414] ${isCompact ? 'p-2' : 'p-4'} flex items-center justify-between shadow-[6px_6px_0px_0px_#141414]`}>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={`flex items-center gap-2 ${isCompact ? 'px-4 py-2 text-xs' : 'px-8 py-3 text-sm'} bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest hover:scale-105 transition-transform`}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Start' : 'Pause'}
                  </button>
                  {!isCompact && (
                    <button 
                      onClick={() => {
                        setCalibration(null);
                        setCalibrationStep('wizard');
                        setFineTune({ rotation: 0, scale: 1, offsetX: 0, offsetY: 0 });
                      }}
                      className="flex items-center gap-2 px-8 py-3 border-2 border-[#141414] font-bold uppercase tracking-widest text-sm hover:bg-[#141414] hover:text-[#E4E3E0] transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Recalibrate
                    </button>
                  )}
                </div>
                <div className="text-right">
                  {!isCompact && <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Current Exercise</p>}
                  <p className={`font-serif italic ${isCompact ? 'text-sm' : 'text-xl'}`}>Clementi Sonatina Op.36 No.1</p>
                </div>
              </div>

              <div className={`lg:col-span-4 grid grid-cols-2 ${isCompact ? 'gap-2' : 'gap-4'}`}>
                <div className={`bg-white border-2 border-[#141414] ${isCompact ? 'p-2' : 'p-4'} shadow-[6px_6px_0px_0px_#141414]`}>
                  <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Accuracy</p>
                  <p className={`${isCompact ? 'text-lg' : 'text-3xl'} font-mono`}>94%</p>
                </div>
                <div className={`bg-white border-2 border-[#141414] ${isCompact ? 'p-2' : 'p-4'} shadow-[6px_6px_0px_0px_#141414]`}>
                  <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Progress</p>
                  <p className={`${isCompact ? 'text-lg' : 'text-3xl'} font-mono`}>{currentNoteIndex} / 42</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showMidiSettings && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setShowMidiSettings(false)}
            >
              <div onClick={e => e.stopPropagation()} className="w-full max-w-md">
                <MidiSelector onDeviceSelect={(id) => {
                  setSelectedMidiId(id);
                  setShowMidiSettings(false);
                }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
