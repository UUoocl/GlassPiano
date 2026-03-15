<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything to run this app locally.

View your app in AI Studio: https://ai.studio/apps/20dd2583-f5db-4d85-9ce2-5bc972a74b94

## Features

- **AR Alignment System:** Precisely maps hand landmarks and virtual keyboard to the physical keyboard's orientation and position using affine transformations.
- **Interactive Calibration:** A guided wizard with corner adjustment and key-press verification (lowest and highest white keys) ensures accurate alignment.
- **Fine-Tuning Controls:** Sliders for rotation, scale, and offset provide users with the ability to make minor adjustments for perfect alignment.
- **Horizontal Rendering:** Virtual keyboard and hand landmarks are rendered horizontally at the bottom of the screen, maintaining aspect ratio and aligning with the frame bottom.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
