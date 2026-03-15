# Specification: UI Improvements (MIDI and Draggability)

## Objective
Improve user experience by centralizing MIDI device selection within the keyboard setup menu and making UI overlays draggable for better visibility of the keyboard/vision results.

## Requirements
- **MIDI Integration:**
  - Incorporate MIDI device selection into the `KeyboardSettings` component.
  - Call `midiService.requestAccess()` and display available inputs.
  - Connect and update the selected MIDI device state when changed.
- **Draggable Menus:**
  - Make `KeyboardSettings` draggable using Framer Motion (`motion.div` with `drag` prop).
  - Make the "Piano Calibration" (Adjust & Verify) menu box in `App.tsx` draggable.
  - Ensure dragging is non-blocking to other interactions.
  - Add visual cues for draggability (e.g., cursor: move).

## Impact
- **KeyboardSettings.tsx**: Add MIDI selection UI and draggability.
- **App.tsx**: Wrap the "Adjust & Verify" box in `motion.div` for draggability.
- **MidiSelector.tsx**: Possibly refactor if shared logic is needed, or just use `midiService`.
