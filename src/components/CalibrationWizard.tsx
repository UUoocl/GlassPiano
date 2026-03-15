import React, { useState } from 'react';

type CalibrationStep = 'midi' | 'detection' | 'config' | 'corners';

interface Props {
  onComplete: (config: any) => void;
}

export const CalibrationWizard: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<CalibrationStep>('midi');

  return (
    <div className="calibration-wizard">
      {step === 'midi' && (
        <div>
          <h2>Select MIDI Device</h2>
          <button onClick={() => setStep('detection')}>Next</button>
        </div>
      )}
      {step === 'detection' && (
        <div>
          <h2>Press the leftmost key</h2>
          <button onClick={() => setStep('config')}>Next</button>
        </div>
      )}
      {step === 'config' && (
        <div>
          <h2>Keyboard Configuration</h2>
          <button onClick={() => setStep('corners')}>Next</button>
        </div>
      )}
      {step === 'corners' && (
        <div>
          <h2>Piano Calibration</h2>
          <button onClick={() => onComplete({})}>Finish</button>
        </div>
      )}
    </div>
  );
};
