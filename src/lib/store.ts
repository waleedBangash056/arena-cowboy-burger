/**
 * Shared, mutable animation state.
 * The scroll director writes into `rig`; the WebGL scene reads it in
 * useFrame. Using a plain object (not React state) keeps the 60fps loop
 * completely free of React re-renders.
 */

export type Rig = {
  // camera position & look target
  camX: number;
  camY: number;
  camZ: number;
  tgtX: number;
  tgtY: number;
  // burger transform
  bx: number;
  by: number;
  bs: number;
  rotY: number;
  rotX: number;
  // burger state
  explode: number; // 0 assembled, 1 fully separated
  assemble: number; // 0 parts flown out, 1 built
  focus: number; // layer index to centre on (float)
  focusAmt: number; // 0..1 how strongly to centre that layer
  heat: number; // patty glow
  // variants
  double: number;
  bacon: number;
  jalapeno: number;
  onion: number;
  // atmosphere
  smoke: number;
  embers: number;
  fire: number;
  rim: number;
  key: number;
};

export const defaultRig: Rig = {
  camX: 0,
  camY: 0.4,
  camZ: 8.2,
  tgtX: 0,
  tgtY: 0.1,
  bx: 0,
  by: -0.25,
  bs: 1,
  rotY: -0.4,
  rotX: 0.12,
  explode: 0,
  assemble: 1,
  focus: 0,
  focusAmt: 0,
  heat: 0,
  double: 0,
  bacon: 0,
  jalapeno: 0,
  onion: 1,
  smoke: 1,
  embers: 0.6,
  fire: 0.35,
  rim: 1,
  key: 1,
};

export const rig: Rig = { ...defaultRig };

export const pointer = { x: 0, y: 0 };

export const scrollState = {
  y: 0,
  velocity: 0,
  progress: 0,
};
