import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShapeType, HandGestureState } from '../types';
import { generateGeometry } from '../utils/geometry';

interface SceneProps {
  currentShape: ShapeType;
  particleColor: string;
  gestureState: HandGestureState;
}

const PARTICLE_COUNT = 8000;
const LERP_SPEED = 0.08;

export const Scene: React.FC<SceneProps> = ({ currentShape, particleColor, gestureState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  // Refs for animation loop to access latest props without re-binding
  const gestureStateRef = useRef(gestureState);
  
  // Data refs to avoid re-creating buffers every frame
  const targetPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const currentPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const originalPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Update the ref whenever the prop changes
  useEffect(() => {
    gestureStateRef.current = gestureState;
  }, [gestureState]);

  // Generate geometry when shape changes
  useEffect(() => {
    const newPositions = generateGeometry(currentShape, PARTICLE_COUNT);
    targetPositionsRef.current.set(newPositions);
    originalPositionsRef.current.set(newPositions); // Keep a clean copy for calculations
  }, [currentShape]);

  // Init Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    // Initialize scattered
    for(let i=0; i<positions.length; i++) positions[i] = (Math.random() - 0.5) * 50;
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    currentPositionsRef.current.set(positions);

    const material = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    particlesRef.current = particleSystem;
    scene.add(particleSystem);

    // Initial shape generation
    const initialPos = generateGeometry(currentShape, PARTICLE_COUNT);
    targetPositionsRef.current.set(initialPos);
    originalPositionsRef.current.set(initialPos);

    // Animation Loop
    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!particlesRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const target = targetPositionsRef.current;
      const original = originalPositionsRef.current;
      
      const time = Date.now() * 0.001;
      
      // Use the ref to get the LATEST gesture state
      const currentGesture = gestureStateRef.current;
      
      // --- INTERACTION LOGIC ---
      
      let scaleFactor = 1.0;
      let explosionFactor = 0.0;
      let rotationSpeed = 0.001;

      if (currentGesture.isTracking) {
        if (currentGesture.handsDetected === 1) {
            // Pinch to scale: 0.0 (closed) -> 0.5 scale, 1.0 (open) -> 2.0 scale
            // Clamp pinchDistance to ensure it stays within expected bounds 0-1
            const pinch = Math.max(0, Math.min(1, currentGesture.pinchDistance));
            scaleFactor = 0.5 + (pinch * 1.5);
            rotationSpeed = 0.002 + (pinch * 0.01);
        } else if (currentGesture.handsDetected === 2) {
            // Two hands: Spread factor
            explosionFactor = currentGesture.handDistance * 30; // Increased multiplier for more visible effect
            scaleFactor = 1 + (currentGesture.handDistance * 0.5);
        }
      } else {
        // Idle animation breathing
        scaleFactor = 1 + Math.sin(time) * 0.1;
      }

      // Update positions
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // Get base target position for current shape
        let tx = original[ix] * scaleFactor;
        let ty = original[iy] * scaleFactor;
        let tz = original[iz] * scaleFactor;

        // Apply Explosion/Dispersion if 2 hands
        if (explosionFactor > 0.1) {
            // Disperse outwards from center based on original vector
            tx += original[ix] * explosionFactor * 0.1 + (Math.random() - 0.5) * explosionFactor;
            ty += original[iy] * explosionFactor * 0.1 + (Math.random() - 0.5) * explosionFactor;
            tz += original[iz] * explosionFactor * 0.1 + (Math.random() - 0.5) * explosionFactor;
        }

        // Special behavior for Fireworks
        if (currentShape === ShapeType.FIREWORKS) {
             const speed = 1 + (Math.sin(time * 2 + i) * 0.5); 
             tx *= speed;
             ty *= speed;
             tz *= speed;
        }

        // Lerp current to target for smooth transition
        positions[ix] += (tx - positions[ix]) * LERP_SPEED;
        positions[iy] += (ty - positions[iy]) * LERP_SPEED;
        positions[iz] += (tz - positions[iz]) * LERP_SPEED;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += rotationSpeed;
      particlesRef.current.rotation.x += rotationSpeed * 0.5;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (particlesRef.current) {
          particlesRef.current.geometry.dispose();
          (particlesRef.current.material as THREE.Material).dispose();
      }
    };
  }, []); 

  // Separate effect for color updates
  useEffect(() => {
    if (particlesRef.current) {
        (particlesRef.current.material as THREE.PointsMaterial).color.set(particleColor);
    }
  }, [particleColor]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};