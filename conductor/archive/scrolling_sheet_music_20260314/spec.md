# Specification: Scrolling Sheet Music and Viewport Optimization

## Overview
This feature enhances the practice session by ensuring the entire application UI fits within the visible browser window (no vertical scrolling) and implement smooth, automatic vertical scrolling for the sheet music to keep the active staff top-aligned.

## Functional Requirements
1. **Viewport Optimization (Fit-to-Frame):**
   - Refactor the main layout to use a strict viewport fit (Flexbox/Grid with `h-screen` and `overflow-hidden`).
   - Implement dynamic resizing for the `NotationView` to occupy all available vertical space.
   - Introduce a "Compact HUD Mode" that collapses or streamlines information elements when vertical space is constrained.
   - Add manual layout toggles to allow users to switch between different view configurations (e.g., hiding the keyboard overlay).

2. **Auto-Scrolling Sheet Music:**
   - Implement a continuous smooth scrolling mechanism within the `NotationView`.
   - The system must detect the current cursor position in OpenSheetMusicDisplay (OSMD).
   - Automatically adjust the vertical scroll position of the OSMD container to keep the staff containing the active note(s) aligned to the top of the viewport.

3. **Performance & UX:**
   - Scrolling must be low-latency and performant to avoid distracting the user.
   - Transitions between layout modes should be smooth.

## Non-Functional Requirements
- **Performance:** Maintain >60FPS during scrolling transitions.
- **Stability:** Ensure scrolling remains accurate even during window resizing or layout configuration changes.

## Acceptance Criteria
- [ ] No vertical scrollbar is visible on the main application window.
- [ ] The current active staff in the sheet music is always visible at the top of its container.
- [ ] The sheet music scrolls smoothly as the user advances through the piece.
- [ ] Dynamic resizing correctly adjusts all UI elements when the browser window is resized.
- [ ] Compact HUD and manual layout toggles correctly alter the visible elements.

## Out of Scope
- Support for horizontal scrolling (scrolling is strictly vertical for multi-staff scores).
- User-defined custom scroll speeds (scrolling is driven by musical progress).