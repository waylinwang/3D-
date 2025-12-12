import * as THREE from 'three';
import { ShapeType } from '../types';

const PARTICLE_COUNT = 5000;
const RADIUS = 10;

// Helper to get random point in sphere
const randomSpherePoint = (r: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return { x, y, z };
};

// Canvas for text rasterization
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

const getPointsFromText = (text: string, count: number): Float32Array => {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    ctx = canvas.getContext('2d');
  }
  
  if (!ctx || !canvas) return new Float32Array(count * 3);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 100px Arial, "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const validPixels: {x: number, y: number}[] = [];

  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 128) {
        validPixels.push({ 
          x: (x - canvas.width / 2) * 0.15, 
          y: -(y - canvas.height / 2) * 0.15 
        });
      }
    }
  }

  const positions = new Float32Array(count * 3);
  if (validPixels.length === 0) return positions;

  for (let i = 0; i < count; i++) {
    const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];
    // Add some depth jitter
    positions[i * 3] = pixel.x + (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 1] = pixel.y + (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2; 
  }
  return positions;
};

export const generateGeometry = (type: ShapeType, count: number = PARTICLE_COUNT): Float32Array => {
  const positions = new Float32Array(count * 3);

  switch (type) {
    case ShapeType.HEART:
      for (let i = 0; i < count; i++) {
        // Parametric heart equation
        const t = Math.random() * Math.PI * 2;
        const r = Math.random(); // volume filler
        // Normalize distribution
        const dist = Math.sqrt(Math.random()) * RADIUS * 0.05; 
        
        // Heart curve
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 4;

        positions[i * 3] = x * dist;
        positions[i * 3 + 1] = y * dist;
        positions[i * 3 + 2] = z * dist;
      }
      break;

    case ShapeType.SATURN:
      for (let i = 0; i < count; i++) {
        // 70% Planet, 30% Rings
        if (Math.random() > 0.3) {
          const p = randomSpherePoint(RADIUS * 0.6);
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        } else {
          // Rings
          const angle = Math.random() * Math.PI * 2;
          const dist = RADIUS * (1.2 + Math.random() * 0.8);
          positions[i * 3] = Math.cos(angle) * dist;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // Thin vertically
          positions[i * 3 + 2] = Math.sin(angle) * dist;
          
          // Tilt the ring
          const x = positions[i * 3];
          const y = positions[i * 3 + 1];
          const z = positions[i * 3 + 2];
          const tilt = Math.PI / 6;
          positions[i * 3] = x * Math.cos(tilt) - y * Math.sin(tilt);
          positions[i * 3 + 1] = x * Math.sin(tilt) + y * Math.cos(tilt);
        }
      }
      break;

    case ShapeType.FLOWER:
      for (let i = 0; i < count; i++) {
        const u = Math.random() * Math.PI * 2; // angle around
        const v = Math.random(); // radius
        // 5 petals
        const r = Math.sin(5 * u) * RADIUS + RADIUS * 0.5;
        
        positions[i * 3] = r * v * Math.cos(u);
        positions[i * 3 + 1] = r * v * Math.sin(u);
        positions[i * 3 + 2] = (Math.cos(5*u) * 2) * (1-v); // Curve depth
      }
      break;

    case ShapeType.FIREWORKS:
      for (let i = 0; i < count; i++) {
        const p = randomSpherePoint(RADIUS * 0.1); // Start small, will explode via modifier
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }
      break;

    case ShapeType.BUDDHA:
      return getPointsFromText("佛", count);

    case ShapeType.LOVE_TEXT:
      return getPointsFromText("我爱你", count);
      
    default:
       // Sphere fallback
       for (let i = 0; i < count; i++) {
        const p = randomSpherePoint(RADIUS);
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }
  }

  return positions;
};