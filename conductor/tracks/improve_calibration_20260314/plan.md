# Implementation Plan: Improved Piano Calibration Onboarding

## Phase 1: Wizard Scaffolding & MIDI Step
- [ ] Task: Create Onboarding Wizard Container
    - [ ] Write Tests for Wizard state management (step transitions, unskippable logic)
    - [ ] Implement `CalibrationWizard` component and step navigation logic
- [ ] Task: Implement Step 1: MIDI Selection
    - [ ] Write Tests for MIDI device listing and selection state
    - [ ] Implement MIDI Selection step UI using `midiService`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Wizard Scaffolding & MIDI Step' (Protocol in workflow.md)

## Phase 2: Layout Steps
- [ ] Task: Implement Step 2: Leftmost Key Detection
    - [ ] Write Tests for MIDI listener logic (capturing the first note received)
    - [ ] Implement Step 2 UI with instructions and visual detection cue
- [ ] Task: Implement Step 3: Keyboard Configuration
    - [ ] Write Tests for `KeyboardConfig` updates from presets and accidental groups
    - [ ] Implement Step 3 UI with dropdowns for 88/76/61/49/25/Custom and 2/3 accidentals
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Layout Steps' (Protocol in workflow.md)

## Phase 3: Integration & Visual Calibration
- [ ] Task: Implement Step 4: Piano Calibration (Corners)
    - [ ] Write Tests for integration with existing `CalibrationOverlay` logic
    - [ ] Implement Step 4 UI by wrapping or refactoring `CalibrationOverlay` into the wizard
- [ ] Task: Finalize Wizard Integration
    - [ ] Write Tests for overall wizard completion and state persistence
    - [ ] Integrate `CalibrationWizard` into `App.tsx` to force flow on startup
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Visual Calibration' (Protocol in workflow.md)