import gsap from "gsap";
import { rig, defaultRig, type Rig } from "./store";
import { menu } from "../content/site";

/**
 * THE DIRECTOR
 * ------------------------------------------------------------------
 * The whole page is one film. Each keyframe is a "shot" anchored to a
 * point in a DOM section (section id + fraction of its height). We build
 * a single *paused* GSAP master timeline (one tween per shot-to-shot
 * cut) and map scroll position → timeline time piecewise-linearly.
 *
 *   scroll forward  → film plays
 *   scroll backward → film rewinds
 *
 * Because the timeline is seeked (not played), it is fully deterministic
 * and reversible, and adding a shot is a one-line change.
 */

type Shot = {
  at: [section: string, fraction: number];
  ease?: string;
  set: Partial<Rig>;
};

const MENU_SPAN = 0.75; // portion of the sticky menu section that is "pinned"
const step = MENU_SPAN / menu.length;

function menuShots(): Shot[] {
  const shots: Shot[] = [];
  menu.forEach((item, i) => {
    const start = i * step;
    const s = { ...item.config, rotY: 7.5 + i * Math.PI };
    shots.push({ at: ["menu", Math.max(0, start + step * 0.22)], set: s, ease: "power3.inOut" });
    shots.push({ at: ["menu", start + step * 0.78], set: { ...s, rotY: s.rotY + 0.35 }, ease: "none" });
  });
  return shots;
}

const shots: Shot[] = [
  // 01 — OPENING: low hero angle, the burger emerges from the dark
  { at: ["opening", 0], set: { ...defaultRig } },
  // 02 — REVEAL: dolly in, orbit, the stack starts to breathe open
  {
    at: ["reveal", 0.35],
    set: { camX: -1.4, camY: 1.3, camZ: 5.6, tgtX: 0.7, tgtY: 0.2, bx: 1.5, by: -0.1, rotY: 0.7, rotX: 0.18, explode: 0.2, smoke: 0.55, embers: 0.5 },
  },
  // 03 — ANATOMY: wide, fully exploded
  {
    at: ["anatomy", 0.15],
    set: { camX: 0, camY: 1.1, camZ: 13, tgtX: 0, tgtY: 0.45, bx: 0, by: -0.35, bs: 0.92, rotY: 1.5, rotX: 0.22, explode: 1, smoke: 0.25, embers: 0.3, fire: 0.25 },
  },
  { at: ["anatomy", 0.6], set: { rotY: 1.9 }, ease: "none" },
  // Ingredient close-ups — camera tracks each layer of the exploded stack
  {
    at: ["ing-bun", 0.35],
    set: { camX: 0.3, camY: 1.7, camZ: 5.4, tgtX: 0.95, tgtY: 0, bx: 1.7, by: -0.1, bs: 1, rotY: 2.4, rotX: 0.42, focus: 11, focusAmt: 1, explode: 1 },
  },
  {
    at: ["ing-beef", 0.35],
    set: { camX: -0.3, camY: 0.9, camZ: 4.9, tgtX: -0.95, tgtY: 0, bx: -1.7, rotY: 3.3, rotX: 0.24, focus: 5.5, heat: 0.3 },
  },
  {
    at: ["ing-fresh", 0.35],
    set: { camX: 0.3, camY: 0.8, camZ: 4.9, tgtX: 0.95, tgtY: 0, bx: 1.7, rotY: 4.1, rotX: 0.3, focus: 3, heat: 0 },
  },
  {
    at: ["ing-sauce", 0.35],
    set: { camX: -0.3, camY: 1.4, camZ: 4.7, tgtX: -0.95, tgtY: 0, bx: -1.7, rotY: 4.9, rotX: 0.48, focus: 1 },
  },
  // 04 — CRAFT: parts fly out, the fire takes over, then it's built live
  {
    at: ["craft", 0],
    set: { camX: 0, camY: 0.9, camZ: 7.6, tgtX: 0.7, tgtY: 0, bx: 1.8, by: -0.5, rotY: 6.0, rotX: 0.16, explode: 0, focusAmt: 0, assemble: 0, fire: 1, embers: 1, smoke: 0.8 },
  },
  { at: ["craft", 0.12], set: { rotY: 6.15 }, ease: "none" },
  { at: ["craft", 0.3], set: { assemble: 0.36, heat: 1, rotY: 6.45 }, ease: "power1.inOut" },
  { at: ["craft", 0.48], set: { assemble: 0.56, heat: 0.65, rotY: 6.8 }, ease: "power1.inOut" },
  { at: ["craft", 0.7], set: { assemble: 1, heat: 0.15, fire: 0.65, rotY: 7.3 }, ease: "power1.inOut" },
  // 05 — MENU: hero product turntable, the burger rebuilds per item
  {
    at: ["menu", 0],
    set: { camX: 0, camY: 0.8, camZ: 7.2, tgtX: 0.55, tgtY: 0, bx: 1.55, by: -0.3, fire: 0.3, embers: 0.4, smoke: 0.45, heat: 0, rotX: 0.2 },
  },
  ...menuShots(),
  // 06 — STORY (light editorial chapter covers the canvas; reset for finale)
  {
    at: ["story", 0.6],
    set: { camX: 0, camY: -0.4, camZ: 7.6, tgtX: 0, tgtY: 0.45, bx: 0, by: 0.05, rotY: 18.6, rotX: 0.05, double: 0, bacon: 0, jalapeno: 0, onion: 1, smoke: 1, embers: 0.9, fire: 0.55 },
  },
  // 07 — FINALE: heroic low angle, slow push-in
  { at: ["visit", 0.05], set: { camZ: 7.0, rotY: 19.0 }, ease: "power2.out" },
  { at: ["visit", 0.9], set: { camY: 0.1, camZ: 6.1, rotY: 20.0 }, ease: "none" },
];

let tl: gsap.core.Timeline | null = null;
let anchors: number[] = [];

function sectionTop(id: string): { top: number; height: number } | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: el.offsetHeight };
}

export function buildDirector() {
  tl?.kill();
  const resolved = shots
    .map((s) => {
      const sec = sectionTop(s.at[0]);
      return sec ? { ...s, y: sec.top + sec.height * s.at[1] } : null;
    })
    .filter((s): s is Shot & { y: number } => s !== null)
    .sort((a, b) => a.y - b.y);

  // Accumulate states so each shot inherits everything it doesn't set
  const states: Rig[] = [];
  let acc: Rig = { ...defaultRig };
  for (const s of resolved) {
    acc = { ...acc, ...s.set };
    states.push(acc);
  }

  tl = gsap.timeline({ paused: true });
  tl.set(rig, { ...states[0] }, 0);
  for (let i = 1; i < states.length; i++) {
    tl.fromTo(
      rig,
      { ...states[i - 1] },
      { ...states[i], duration: 1, ease: resolved[i].ease ?? "power2.inOut", immediateRender: false },
      i - 1
    );
  }
  anchors = resolved.map((s) => s.y);
}

/** Map a scroll position (px) to film time and seek. */
export function seekDirector(scrollY: number) {
  if (!tl || anchors.length < 2) return;
  // the anchor is where the section top meets the viewport top
  const y = scrollY;
  let t = 0;
  if (y <= anchors[0]) t = 0;
  else if (y >= anchors[anchors.length - 1]) t = anchors.length - 1;
  else {
    for (let i = 0; i < anchors.length - 1; i++) {
      if (y >= anchors[i] && y < anchors[i + 1]) {
        const span = anchors[i + 1] - anchors[i] || 1;
        t = i + (y - anchors[i]) / span;
        break;
      }
    }
  }
  tl.time(t, false);
}

/** Scroll position (px) at which a given menu item is fully presented. */
export function menuItemScrollY(index: number): number | null {
  const sec = sectionTop("menu");
  if (!sec) return null;
  return sec.top + sec.height * (index * step + step * 0.5);
}

export const MENU_STEP = step;
export const MENU_SPAN_FRACTION = MENU_SPAN;
