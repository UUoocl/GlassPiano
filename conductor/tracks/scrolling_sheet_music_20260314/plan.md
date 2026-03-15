# Implementation Plan: Scrolling Sheet Music and Viewport Optimization

## Phase 1: Viewport Optimization (Fit-to-Frame)
- [x] Task: Refactor Main Layout for Viewport Fit
    - [x] Write failing tests for layout container dimensions
    - [x] Implement Flexbox/Grid structure with `h-screen` and `overflow-hidden`
- [x] Task: Implement Dynamic Notation Sizing
    - [x] Write failing tests for `NotationView` resizing logic
    - [x] Implement resizing logic to ensure `NotationView` fills available vertical space
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Viewport Optimization' (Protocol in workflow.md)

## Phase 2: Auto-Scrolling Implementation
- [ ] Task: Implement OSMD Cursor Position Detection
    - [ ] Write failing tests for staff/measure detection logic
    - [ ] Implement utility to retrieve the current staff's vertical offset from OSMD cursor
- [ ] Task: Implement Smooth Scrolling Mechanism
    - [ ] Write failing tests for scrolling container state updates
    - [ ] Implement smooth continuous scroll to top-align the active staff
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Auto-Scrolling Implementation' (Protocol in workflow.md)

## Phase 3: UI Refinements and Toggles
- [ ] Task: Implement Compact HUD Mode
    - [ ] Write failing tests for HUD component state transitions
    - [ ] Implement compact information display logic for limited vertical space
- [ ] Task: Implement Manual Layout Toggles
    - [ ] Write failing tests for layout state persistence/toggling
    - [ ] Implement UI controls to hide/show keyboard and other overlays
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Refinements and Toggles' (Protocol in workflow.md)
