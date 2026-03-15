# Implementation Plan: Enhanced Hand-Keyboard Alignment

## Phase 1: Alignment Mathematics & Transformation Service [checkpoint: 961e5e3]
- [x] Task: Implement Affine Transformation Service 1c1736f
    - [x] Write failing tests for 4-point to transformation matrix calculation
    - [x] Implement `alignmentService.ts` with translation, rotation, and scaling logic
- [x] Task: Coordinate Mapping Utilities 17c17e8
    - [x] Write failing tests for mapping camera-space points to transformed keyboard-space
    - [x] Implement utility functions for point conversion and origin alignment
- [x] Task: Conductor - User Manual Verification 'Phase 1: Alignment Math' (Protocol in workflow.md)

## Phase 2: Transformed Rendering Implementation [checkpoint: b243c3b]
- [x] Task: Refactor KeyboardOverlay for Transformation 92f6f34
    - [x] Write failing tests for CSS/Canvas transform application to the overlay container
    - [x] Implement transform application in `KeyboardOverlay.tsx`
- [x] Task: Align Hand Landmarks Rendering 2be6c38
    - [x] Write failing tests for landmark orientation compensation
    - [x] Update landmark rendering logic to apply the calculated rotation and scale
- [x] Task: Conductor - User Manual Verification 'Phase 2: Render Alignment' (Protocol in workflow.md)

## Phase 3: Interactive Verification & Fine-Tuning UI
- [x] Task: Implement Post-Calibration Verification Routine bb45b33
    - [x] Write failing tests for "Verification Step" state transitions
    - [x] Implement UI flow prompting user for "Calibration Confirmation Presses"
- [x] Task: Implement Manual Fine-Tuning Controls 40d476f
    - [x] Write failing tests for manual rotation/offset adjustments
    - [x] Implement sliders/controls for real-time alignment tweaking
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification & Tweak UI' (Protocol in workflow.md)
