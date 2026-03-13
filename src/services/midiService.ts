
export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
}

export class MidiService {
  private access: WebMidi.MIDIAccess | null = null;
  private onNoteOn: (pitch: number, velocity: number) => void = () => {};
  private onNoteOff: (pitch: number) => void = () => {};

  async requestAccess(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      console.error('Web MIDI API not supported');
      return false;
    }

    try {
      this.access = await navigator.requestMIDIAccess();
      return true;
    } catch (err) {
      console.error('Failed to get MIDI access', err);
      return false;
    }
  }

  getInputs(): MidiDevice[] {
    if (!this.access) return [];
    const inputs: MidiDevice[] = [];
    this.access.inputs.forEach((input) => {
      inputs.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown Manufacturer',
      });
    });
    return inputs;
  }

  setCallbacks(onNoteOn: (pitch: number, velocity: number) => void, onNoteOff: (pitch: number) => void) {
    this.onNoteOn = onNoteOn;
    this.onNoteOff = onNoteOff;
  }

  connect(deviceId: string) {
    if (!this.access) return;

    // Disconnect from all inputs first
    this.access.inputs.forEach((input) => {
      input.onmidimessage = null;
    });

    const input = this.access.inputs.get(deviceId);
    if (input) {
      input.onmidimessage = (event: WebMidi.MIDIMessageEvent) => {
        const [status, note, velocity] = event.data;
        const type = status & 0xf0;

        if (type === 0x90 && velocity > 0) {
          this.onNoteOn(note, velocity);
        } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
          this.onNoteOff(note);
        }
      };
    }
  }

  onStateChange(callback: () => void) {
    if (this.access) {
      this.access.onstatechange = callback;
    }
  }
}

export const midiService = new MidiService();
