# Implementation Plan: Enhanced Hand-Keyboard Alignment

## Phase 1: Alignment Mathematics & Transformation Service
- [x] Task: Implement Affine Transformation Service 1c1736f
    - [x] Write failing tests for 4-point to transformation matrix calculation
    - [x] Implement `alignmentService.ts` with translation, rotation, and scaling logic
- [x] Task: Coordinate Mapping Utilities 17c17e8
    - [x] Write failing tests for mapping camera-space points to transformed keyboard-space
    - [x] Implement utility functions for point conversion and origin alignment
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Alignment Math' (Protocol in workflow.md)

## Phase 2: Transformed Rendering Implementation
- [ ] Task: Refactor KeyboardOverlay for Transformation
    - [ ] Write failing tests for CSS/Canvas transform application to the overlay container
    - [ ] Implement transform application in `KeyboardOverlay.tsx`
- [ ] Task: Align Hand Landmarks Rendering
    - [ ] Write failing tests for landmark orientation compensation
    - [ ] Update landmark rendering logic to apply the calculated rotation and scale
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Render Alignment' (Protocol in workflow.md)

## Phase 3: Interactive Verification & Fine-Tuning UI
- [ ] Task: Implement Post-Calibration Verification Routine
    - [ ] Write failing tests for "Verification Step" state transitions
    - [ ] Implement UI flow prompting user for "Calibration Confirmation Presses"
- [ ] Task: Implement Manual Fine-Tuning Controls
    - [ ] Write failing tests for manual rotation/offset adjustments
    - [ ] Implement sliders/controls for real-time alignment tweaking
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification & Tweak UI' (Protocol in workflow.md)
