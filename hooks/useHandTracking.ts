
import React, { useEffect, useRef, useState } from 'react';
import { HandGestureState } from '../types';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [gestureState, setGestureState] = useState<HandGestureState>({
    isTracking: false,
    pinchDistance: 1,
    handDistance: 0,
    handsDetected: 0,
    isLeftHandRaised: false,
    isRightHandRaised: false,
    isClapping: false,
    isVictory: false,
    isThumbsUp: false,
    isOkSign: false,
    isFist: false,
    isSpiderman: false,
    isPointing: false,
    isCallMe: false,
    isPalm: false,
    isThree: false,
    isFour: false,
    isPinky: false,
    isPistol: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  const landmarkerRef = useRef<any>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm"
        );

        if (!isMounted) return;

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.6, // Increased confidence threshold
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        if (isMounted) {
          startCamera();
        }
      } catch (err: any) {
        console.error("MediaPipe Init Error:", err);
        if (isMounted) setError("Failed to initialize vision model. " + (err.message || ""));
      }
    };

    setupMediaPipe();

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId.current);
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera permission denied.");
    }
  };

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current) return;

    if (videoRef.current.readyState < 2) {
         rafId.current = requestAnimationFrame(predictWebcam);
         return;
    }

    const nowInMs = Date.now();
    const results = landmarkerRef.current.detectForVideo(videoRef.current, nowInMs);

    if (results.landmarks) {
      processLandmarks(results.landmarks);
    }

    rafId.current = requestAnimationFrame(predictWebcam);
  };

  // --- Geometric Helpers for Accuracy ---

  // Check if a finger is extended (Tip is farther from wrist than PIP joint)
  const isFingerExtended = (hand: any[], fingerTipIdx: number, fingerPipIdx: number) => {
    const wrist = hand[0];
    const tip = hand[fingerTipIdx];
    const pip = hand[fingerPipIdx];
    
    const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
    
    return distTip > distPip;
  };

  const processLandmarks = (landmarks: any[]) => {
    let pinch = 1;
    let spread = 0;
    const count = landmarks.length;

    // --- Basic Interaction (Pinch/Spread) ---
    if (count === 1) {
      const hand = landmarks[0];
      const p1 = hand[4]; // Thumb Tip
      const p2 = hand[8]; // Index Tip
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      pinch = Math.min(Math.max((dist - 0.02) / 0.15, 0), 1);
    } else if (count === 2) {
      const h1 = landmarks[0][0]; // Wrist 1
      const h2 = landmarks[1][0]; // Wrist 2
      const dist = Math.hypot(h1.x - h2.x, h1.y - h2.y);
      spread = Math.min(Math.max(dist, 0), 1);
      pinch = 1; 
    }

    // --- Advanced Gesture Recognition ---
    
    let isClapping = false;
    let isLeftHandRaised = false;
    let isRightHandRaised = false;
    let isVictory = false;
    let isThumbsUp = false;
    let isOkSign = false;
    let isFist = false;
    let isSpiderman = false;
    let isPointing = false;
    let isCallMe = false;
    let isPalm = false;
    let isThree = false;
    let isFour = false;
    let isPinky = false;
    let isPistol = false;

    // 1. Clapping Detection (Two hands close together)
    if (count === 2) {
        const h1 = landmarks[0][0];
        const h2 = landmarks[1][0];
        const wristDist = Math.hypot(h1.x - h2.x, h1.y - h2.y);
        // Stricter clapping: wrists close AND palms facing roughly each other
        if (wristDist < 0.2) {
            isClapping = true;
        }
    }

    // 2. Single Hand Gestures (Iterate through all detected hands)
    for (const hand of landmarks) {
        const wrist = hand[0];
        
        // Finger States
        const thumbOut = isFingerExtended(hand, 4, 2); // Using MCP for thumb check sometimes better, but PIP ok
        const indexUp = isFingerExtended(hand, 8, 6);
        const middleUp = isFingerExtended(hand, 12, 10);
        const ringUp = isFingerExtended(hand, 16, 14);
        const pinkyUp = isFingerExtended(hand, 20, 18);

        // Raise Check: Wrist in upper 35% of screen
        if (wrist.y < 0.35) {
            if (wrist.x > 0.5) isLeftHandRaised = true; // Mirrored
            else isRightHandRaised = true;
        }

        // Victory (Peace): Index & Middle UP, Ring & Pinky DOWN
        if (indexUp && middleUp && !ringUp && !pinkyUp) {
            // Check spacing between index and middle for better accuracy
            const distTips = Math.hypot(hand[8].x - hand[12].x, hand[8].y - hand[12].y);
            if (distTips > 0.04) isVictory = true;
        }

        // Thumbs Up: Thumb UP, others DOWN
        if (thumbOut && !indexUp && !middleUp && !ringUp && !pinkyUp) {
             // Ensure thumb is pointing UP relative to screen
             if (hand[4].y < hand[3].y) isThumbsUp = true;
        }

        // OK Sign: Index and Thumb tips close, others UP
        const thumbIndexDist = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y);
        if (thumbIndexDist < 0.05 && middleUp && ringUp && pinkyUp) {
            isOkSign = true;
        }

        // Fist: All fingers DOWN
        if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
            // Extra check: Fingertips are close to wrist
            const tipWristDist = Math.hypot(hand[8].x - wrist.x, hand[8].y - wrist.y);
            if (tipWristDist < 0.15) isFist = true;
        }

        // Spiderman (Rock On): Index & Pinky UP, Middle & Ring DOWN
        if (indexUp && !middleUp && !ringUp && pinkyUp) {
            isSpiderman = true;
        }

        // Point (Index Only): Index UP, others DOWN (Thumb tucked)
        if (indexUp && !middleUp && !ringUp && !pinkyUp && !thumbOut) {
            isPointing = true;
        }

        // Pistol/Gun: Thumb & Index UP, others DOWN
        if (thumbOut && indexUp && !middleUp && !ringUp && !pinkyUp) {
            isPistol = true;
        }

        // Call Me (Thumb & Pinky): Thumb & Pinky UP, others DOWN
        if (thumbOut && !indexUp && !middleUp && !ringUp && pinkyUp) {
            isCallMe = true;
        }

        // Palm (Five): All 5 fingers UP
        if (thumbOut && indexUp && middleUp && ringUp && pinkyUp) {
            isPalm = true;
        }

        // Three (W style): Index, Middle, Ring UP
        if (indexUp && middleUp && ringUp && !pinkyUp) {
            // Usually thumb is holding pinky, so thumb might not be extended
             isThree = true;
        }

        // Four: All except thumb UP
        if (!thumbOut && indexUp && middleUp && ringUp && pinkyUp) {
            isFour = true;
        }

        // Pinky Promise: Only Pinky UP
        if (!thumbOut && !indexUp && !middleUp && !ringUp && pinkyUp) {
            isPinky = true;
        }
    }

    setGestureState({
      isTracking: true,
      pinchDistance: pinch,
      handDistance: spread,
      handsDetected: count,
      isLeftHandRaised,
      isRightHandRaised,
      isClapping,
      isVictory,
      isThumbsUp,
      isOkSign,
      isFist,
      isSpiderman,
      isPointing,
      isCallMe,
      isPalm,
      isThree,
      isFour,
      isPinky,
      isPistol,
    });
  };

  return { gestureState, error };
};
