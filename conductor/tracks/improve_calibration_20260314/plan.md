# Implementation Plan: Improved Piano Calibration Onboarding

## Phase 1: Wizard Scaffolding & MIDI Step [checkpoint: bb164e4]
- [x] Task: Create Onboarding Wizard Container 38f221e
    - [x] Write Tests for Wizard state management (step transitions, unskippable logic)
    - [x] Implement `CalibrationWizard` component and step navigation logic
- [x] Task: Implement Step 1: MIDI Selection fe661c2
    - [x] Write Tests for MIDI device listing and selection state
    - [x] Implement MIDI Selection step UI using `midiService`
- [x] Task: Conductor - User Manual Verification 'Phase 1: Wizard Scaffolding & MIDI Step' (Protocol in workflow.md) bb164e4

## Phase 2: Layout Steps [checkpoint: be639fd]
- [x] Task: Implement Step 2: Leftmost Key Detection 7591e59
    - [x] Write Tests for MIDI listener logic (capturing the first note received)
    - [x] Implement Step 2 UI with instructions and visual detection cue
- [x] Task: Implement Step 3: Keyboard Configuration 7b9f19c
    - [x] Write Tests for `KeyboardConfig` updates from presets and accidental groups
    - [x] Implement Step 3 UI with dropdowns for 88/76/61/49/25/Custom and 2/3 accidentals
- [x] Task: Conductor - User Manual Verification 'Phase 2: Layout Steps' (Protocol in workflow.md) be639fd

## Phase 3: Integration & Visual Calibration
- [ ] Task: Implement Step 4: Piano Calibration (Corners)
    - [ ] Write Tests for integration with existing `CalibrationOverlay` logic
    - [ ] Implement Step 4 UI by wrapping or refactoring `CalibrationOverlay` into the wizard
- [ ] Task: Finalize Wizard Integration
    - [ ] Write Tests for overall wizard completion and state persistence
    - [ ] Integrate `CalibrationWizard` into `App.tsx` to force flow on startup
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Visual Calibration' (Protocol in workflow.md)