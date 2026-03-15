# Product Guidelines: GlassPiano

## 1. UI/UX Design Philosophy
- **Minimalist & Functional:** The user interface should be unobtrusive, placing the primary focus on the camera view and ensuring maximum legibility for the sheet music.
- **Fit-to-Frame Layout:** The entire application interface must fit within the visible browser viewport, using responsive scaling and compact modes to avoid window-level scrollbars.

## 2. Accessibility
- **Keyboard Navigation:** All UI controls, menus, and calibration settings must be fully accessible and operable via keyboard, ensuring inclusivity for all users.

## 3. Component Architecture
- **Atomic Design:** UI components must follow an atomic design methodology. Strict separation between atoms (buttons, inputs), molecules (forms, small groups), and organisms (overlays, complex views) will ensure maintainability and reusability.

## 4. User Feedback Mechanisms
- **Visual Overlays:** Provide real-time guidance and correction using non-disruptive visual overlays (e.g., `CalibrationOverlay` and `KeyboardOverlay`).
- **Passive Metrics:** Present users with a summary screen or score at the end of a session to track progress without interrupting the active practice flow.