# Specification: Enhanced Hand-Keyboard Alignment Calibration

## Overview
This track enhances the application's AR precision by implementing a robust alignment system. It will mathematically transform the rendering of hand landmarks and the virtual keyboard to match the physical keyboard's orientation and position, using the 4-corner calibration data.

## Functional Requirements
1. **Affine Transformation Logic:**
   - Implement logic to calculate an **Affine Transform** (translation, rotation, and scale) based on the 4 corners identified during calibration.
   - Designate the **Top-Left corner** of the physical keyboard as the origin (0,0) for the transformed space.
2. **Render-Level Alignment:**
   - Apply the calculated transformation to the `KeyboardOverlay` and hand landmark rendering layers.
   - Ensure hand landmarks are correctly oriented (compensating for camera tilt) and accurately positioned over the physical keys.
3. **Interactive Verification & Fine-tuning:**
   - Implement a post-calibration verification routine where the user is prompted to press specific keys (e.g., the lowest and highest white keys).
   - Use these "test presses" to verify the accuracy of the hand-to-key mapping.
   - Provide interactive controls to fine-tune the rotation and offset if the automatic alignment requires minor adjustments.

## Non-Functional Requirements
- **Low Latency:** The transformation calculations must not introduce visible lag in the hand tracking overlay.
- **Visual Consistency:** The virtual keyboard overlay must appear solidly "locked" to the physical keys.

## Acceptance Criteria
- [ ] Hand landmarks consistently appear directly over the correct physical keys across the entire keyboard range.
- [ ] The AR overlay correctly compensates for camera tilt/rotation.
- [ ] The verification routine successfully confirms or allows for correction of alignment errors.
- [ ] Manual fine-tuning controls correctly update the rendered alignment in real-time.