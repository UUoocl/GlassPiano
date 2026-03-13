import React, { useRef, useEffect, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Point, Calibration } from '../types';

interface CameraViewProps {
  calibration: Calibration | null;
  onHandUpdate: (results: Results) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ calibration, onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      onHandUpdate(results);
      
      const canvasCtx = canvasRef.current?.getContext('2d');
      if (canvasCtx && canvasRef.current && videoRef.current) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (results.multiHandLandmarks) {
          for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]], { color: '#00FF00', lineWidth: 2 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
          }
        }
        canvasCtx.restore();
      }
    });

    const startCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsLoading(false);
            
            const processVideo = async () => {
              if (videoRef.current) {
                await hands.send({ image: videoRef.current });
              }
              requestAnimationFrame(processVideo);
            };
            processVideo();
          };
        }
      }
    };

    startCamera();

    return () => {
      hands.close();
    };
  }, [onHandUpdate]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl">
      <video ref={videoRef} className="hidden" playsInline />
      <canvas ref={canvasRef} className="w-full h-full object-cover" width={1280} height={720} />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-mono">
          INITIALIZING VISION ENGINE...
        </div>
      )}
    </div>
  );
};
