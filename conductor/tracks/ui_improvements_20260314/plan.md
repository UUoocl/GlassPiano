# Implementation Plan: UI Improvements

## Phase 1: MIDI Selection in Keyboard Setup
- [x] Task: Integrate MIDI selection into `KeyboardSettings`
    - [x] Add MIDI device list and selection to `KeyboardSettings.tsx`
    - [x] Use `midiService` to fetch devices and handle connection
    - [x] Verify that selecting a device works and updates the app state
- [x] Task: Conductor - User Manual Verification 'Phase 1: MIDI Selection' (Protocol in workflow.md)

## Phase 2: Draggable UI Menus
- [x] Task: Make `KeyboardSettings` draggable
    - [x] Import `motion` from `motion/react` in `KeyboardSettings.tsx`
    - [x] Update the container to `motion.div` and add `drag` prop
    - [x] Ensure the drag handle doesn't conflict with input controls
- [x] Task: Make "Adjust & Verify" menu draggable
    - [x] In `App.tsx`, identify the "Adjust & Verify" box
    - [x] Wrap it with `motion.div` and add `drag` prop
- [x] Task: Conductor - User Manual Verification 'Phase 2: Draggable Menus' (Protocol in workflow.md)
