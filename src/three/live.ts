import { rig, defaultRig, type Rig } from "../lib/store";
import * as THREE from "three";

/**
 * `live` is a critically-damped follower of `rig`. The Director seeks the
 * timeline instantly; `live` adds the final layer of inertia so camera
 * moves feel like they have physical weight (a dolly, not a jump).
 */
export const live: Rig = { ...defaultRig };

const keys = Object.keys(defaultRig) as (keyof Rig)[];

export function dampLive(dt: number, lambda: number) {
  const d = Math.min(dt, 0.05);
  for (const k of keys) live[k] = THREE.MathUtils.damp(live[k], rig[k], lambda, d);
}

export function snapLive() {
  for (const k of keys) live[k] = rig[k];
}
