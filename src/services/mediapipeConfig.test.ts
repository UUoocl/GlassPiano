import { expect, test, describe } from 'vitest';
import { getOptimizedMediaPipeConfig } from './mediapipeConfig';

describe('MediaPipe Configuration Parser', () => {
  test('returns optimized default config for high precision and low latency', () => {
    const config = getOptimizedMediaPipeConfig();
    
    // We expect the configuration to be tuned for better finger recognition (higher confidence)
    expect(config).toMatchObject({
      maxNumHands: 2,
      modelComplexity: 1, // 1 provides a good balance between latency and accuracy
      minDetectionConfidence: 0.7, // Increased from 0.5 to reduce false positives
      minTrackingConfidence: 0.7  // Increased from 0.5 for stable tracking
    });
  });

  test('allows overriding default configuration', () => {
    const customConfig = getOptimizedMediaPipeConfig({ maxNumHands: 1, modelComplexity: 0 });
    expect(customConfig.maxNumHands).toBe(1);
    expect(customConfig.modelComplexity).toBe(0);
    expect(customConfig.minDetectionConfidence).toBe(0.7);
  });
});