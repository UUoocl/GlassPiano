# Specification: Improved Piano Calibration Onboarding

## Overview
This track refactors the initial setup process into a sequential, multi-step onboarding wizard. This ensures that MIDI, keyboard layout, and visual calibration are performed in the correct order for optimal precision.

## Functional Requirements
1. **Sequential Flow (Strict):**
   - **Step 1: MIDI Device Selection.** Display a menu to select the active MIDI input.
   - **Step 2: Leftmost Key Detection.** Prompt the user to press the leftmost (lowest) physical key on their piano. Provide a visual cue upon successful detection.
   - **Step 3: Keyboard Configuration.**
     - Number of Keys: Provide a dropdown with presets (88, 76, 61, 49, 25) and a "Custom" numeric input.
     - First Accidental Group: Provide a dropdown to select if the first group of upper keys contains 2 or 3 keys.
   - **Step 4: Piano Calibration.** Show the instruction dialog to click the 4 corners of the piano keyboard in the camera view.

2. **Validation & State:**
   - The wizard must manage its own state and prevent advancing without completing the current step.
   - Captured MIDI note from Step 2 should be used to infer/verify the layout if possible (optional refinement).

## Non-Functional Requirements
- **UX:** Clear instructions for each step.
- **Persistence:** Ensure calibration values are passed correctly to the main application state.

## Acceptance Criteria
- [ ] Users cannot skip steps; they must proceed MIDI -> Detection -> Config -> Corners.
- [ ] Successful detection of the leftmost key shows a visual confirmation.
- [ ] Keyboard configuration presets correctly update the `KeyboardConfig` state.
- [ ] The final calibration dialog correctly triggers the 4-point selection logic.
- [ ] The flow is forced on every application start (for now).