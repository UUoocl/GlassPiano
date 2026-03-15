# Implementation Plan: Scrolling Sheet Music and Viewport Optimization

## Phase 1: Viewport Optimization (Fit-to-Frame) [checkpoint: 0e4a78f]
- [x] Task: Refactor Main Layout for Viewport Fit
    - [x] Write failing tests for layout container dimensions
    - [x] Implement Flexbox/Grid structure with `h-screen` and `overflow-hidden`
- [x] Task: Implement Dynamic Notation Sizing
    - [x] Write failing tests for `NotationView` resizing logic
    - [x] Implement resizing logic to ensure `NotationView` fills available vertical space
- [x] Task: Conductor - User Manual Verification 'Phase 1: Viewport Optimization' (Protocol in workflow.md) 0e4a78f

## Phase 2: Auto-Scrolling Implementation [checkpoint: 409474b]
- [x] Task: Implement OSMD Cursor Position Detection
    - [x] Write failing tests for staff/measure detection logic
    - [x] Implement utility to retrieve the current staff's vertical offset from OSMD cursor
- [x] Task: Implement Smooth Scrolling Mechanism
    - [x] Write failing tests for scrolling container state updates
    - [x] Implement smooth continuous scroll to top-align the active staff
- [x] Task: Conductor - User Manual Verification 'Phase 2: Auto-Scrolling Implementation' (Protocol in workflow.md) 409474b

## Phase 3: UI Refinements and Toggles
- [x] Task: Implement Compact HUD Mode
    - [x] Write failing tests for HUD component state transitions
    - [x] Implement compact information display logic for limited vertical space
- [x] Task: Implement Manual Layout Toggles
    - [x] Write failing tests for layout state persistence/toggling
    - [x] Implement UI controls to hide/show keyboard and other overlays
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Refinements and Toggles' (Protocol in workflow.md)
