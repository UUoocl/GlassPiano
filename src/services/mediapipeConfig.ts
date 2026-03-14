export interface MediaPipeConfigOptions {
  maxNumHands?: number;
  modelComplexity?: 0 | 1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

export function getOptimizedMediaPipeConfig(overrides?: MediaPipeConfigOptions) {
  const defaultConfig = {
    maxNumHands: 2,
    modelComplexity: 1 as const, // Cast to 1 for literal type compatibility if needed
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  };

  return {
    ...defaultConfig,
    ...overrides,
  };
}