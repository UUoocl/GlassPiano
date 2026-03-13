import React, { useEffect, useState } from 'react';
import { midiService, MidiDevice } from '../services/midiService';
import { Keyboard, Check, AlertCircle } from 'lucide-react';

interface MidiSelectorProps {
  onDeviceSelect: (deviceId: string) => void;
}

export const MidiSelector: React.FC<MidiSelectorProps> = ({ onDeviceSelect }) => {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
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

  const handleSelect = (id: string) => {
    setSelectedId(id);
    midiService.connect(id);
    onDeviceSelect(id);
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-800 uppercase tracking-tight">MIDI Not Supported</p>
          <p className="text-xs text-red-600">Your browser does not support the Web MIDI API. Try Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#141414] p-4 shadow-[4px_4px_0px_0px_#141414]">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="w-5 h-5" />
        <h3 className="text-xs font-bold uppercase tracking-widest">MIDI Input Device</h3>
      </div>

      {devices.length === 0 ? (
        <p className="text-xs opacity-50 italic">No MIDI devices detected. Connect a keyboard and refresh.</p>
      ) : (
        <div className="space-y-2">
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => handleSelect(device.id)}
              className={`w-full flex items-center justify-between p-3 text-left border transition-all ${
                selectedId === device.id
                  ? 'border-[#141414] bg-[#141414] text-[#E4E3E0]'
                  : 'border-gray-200 hover:border-[#141414]'
              }`}
            >
              <div>
                <p className="text-sm font-bold leading-none mb-1">{device.name}</p>
                <p className={`text-[10px] uppercase tracking-wider ${selectedId === device.id ? 'opacity-70' : 'opacity-40'}`}>
                  {device.manufacturer}
                </p>
              </div>
              {selectedId === device.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
