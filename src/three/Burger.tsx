import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { live } from "./live";
import {
  makeTextures,
  topBunGeometry,
  bottomBunGeometry,
  seedTransforms,
  pattyGeometry,
  cheeseGeometry,
  lettuceGeometry,
  sauceGeometry,
  baconGeometry,
  TOP_BUN_H,
  BOTTOM_BUN_H,
} from "./assets";
import type { Rig } from "../lib/store";

type From = "above" | "below" | "left" | "right";
type LayerDef = {
  key: string;
  h: number;
  vis: (r: Rig) => number;
  asm: [number, number];
  from: From;
};

const one = () => 1;

/** Stack order, bottom → top. Index matters: the Director focuses by index. */
const LAYERS: LayerDef[] = [
  { key: "bottomBun", h: BOTTOM_BUN_H, vis: one, asm: [0.58, 0.72], from: "below" },
  { key: "sauce", h: 0.05, vis: one, asm: [0.62, 0.76], from: "below" },
  { key: "lettuce", h: 0.08, vis: one, asm: [0.66, 0.8], from: "left" },
  { key: "tomato", h: 0.11, vis: one, asm: [0.68, 0.82], from: "right" },
  { key: "onion", h: 0.07, vis: (r) => r.onion, asm: [0.7, 0.84], from: "left" },
  { key: "patty", h: 0.32, vis: one, asm: [0.1, 0.3], from: "above" },
  { key: "cheese", h: 0.03, vis: one, asm: [0.36, 0.52], from: "above" },
  { key: "patty2", h: 0.32, vis: (r) => r.double, asm: [0.78, 0.9], from: "above" },
  { key: "cheese2", h: 0.03, vis: (r) => r.double, asm: [0.8, 0.92], from: "above" },
  { key: "bacon", h: 0.08, vis: (r) => r.bacon, asm: [0.8, 0.92], from: "right" },
  { key: "jalapeno", h: 0.06, vis: (r) => r.jalapeno, asm: [0.82, 0.94], from: "left" },
  { key: "topBun", h: TOP_BUN_H, vis: one, asm: [0.84, 1], from: "above" },
];

const GAP = 0.52;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Burger({ quality }: { quality: 0 | 1 | 2 }) {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const layerRefs = useRef<(THREE.Group | null)[]>([]);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null!);
  const seedsRef = useRef<THREE.InstancedMesh>(null!);

  const seg = quality === 0 ? 40 : 72;
  const res = useMemo(() => {
    const tex = makeTextures();
    const bunMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.48,
      clearcoat: 0.55,
      clearcoatRoughness: 0.32,
      sheen: 0.4,
      sheenColor: new THREE.Color("#ffcf8a"),
      sheenRoughness: 0.6,
    });
    const pattyMat = new THREE.MeshStandardMaterial({
      map: tex.pattyColor,
      bumpMap: tex.charBump,
      bumpScale: 2.2,
      roughness: 0.78,
      emissive: new THREE.Color("#ff4a10"),
      emissiveMap: tex.heatMap,
      emissiveIntensity: 0,
    });
    tex.pattyColor.repeat.set(1.5, 1.5);
    tex.charBump.repeat.set(1.5, 1.5);
    const tomatoSide = new THREE.MeshPhysicalMaterial({ color: "#b3261a", roughness: 0.3, clearcoat: 0.6 });
    const tomatoCap = new THREE.MeshPhysicalMaterial({ map: tex.tomatoCap, roughness: 0.22, clearcoat: 0.9 });
    return {
      tex,
      bunMat,
      pattyMat,
      seedMat: new THREE.MeshStandardMaterial({ color: "#f1dfb2", roughness: 0.55 }),
      cheeseMat: new THREE.MeshPhysicalMaterial({ color: "#f2a516", roughness: 0.36, clearcoat: 0.45, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color("#ffd27a") }),
      lettuceMat: new THREE.MeshStandardMaterial({ color: "#86ad3c", roughness: 0.5, side: THREE.DoubleSide }),
      tomatoMats: [tomatoSide, tomatoCap, tomatoCap],
      onionMat: new THREE.MeshPhysicalMaterial({ color: "#c79ab6", roughness: 0.32, clearcoat: 0.6 }),
      sauceMat: new THREE.MeshPhysicalMaterial({ color: "#c4561c", roughness: 0.14, clearcoat: 1 }),
      baconMat: new THREE.MeshStandardMaterial({ map: tex.bacon, roughness: 0.5, side: THREE.DoubleSide }),
      jalMat: new THREE.MeshPhysicalMaterial({ color: "#3f7d2c", roughness: 0.28, clearcoat: 0.7 }),
      jalCapMat: new THREE.MeshPhysicalMaterial({ color: "#a9c86a", roughness: 0.4 }),
      topBun: topBunGeometry(seg),
      bottomBun: bottomBunGeometry(seg),
      seedGeo: new THREE.SphereGeometry(0.032, 6, 4),
      seeds: seedTransforms(quality === 0 ? 70 : 130),
      patty: pattyGeometry(),
      cheese: cheeseGeometry(),
      lettuce: lettuceGeometry(),
      tomato: new THREE.CylinderGeometry(0.74, 0.74, 0.1, 40),
      onion: [0.42, 0.64, 0.86].map((r) => new THREE.TorusGeometry(r, 0.045, 8, 48)),
      sauce: sauceGeometry(),
      bacon: baconGeometry(),
      jal: new THREE.CylinderGeometry(0.2, 0.2, 0.045, 18),
    };
  }, [seg, quality]);

  useLayoutEffect(() => {
    const m = seedsRef.current;
    res.seeds.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
  }, [res]);

  // Cleanup GPU resources on unmount
  useLayoutEffect(
    () => () => {
      Object.values(res).forEach((v) => {
        const list = Array.isArray(v) ? v : [v];
        list.forEach((o) => (o as { dispose?: () => void })?.dispose?.());
      });
      Object.values(res.tex).forEach((t) => t.dispose());
    },
    [res]
  );

  const ys = useMemo(() => new Array(LAYERS.length).fill(0), []);

  useFrame((state) => {
    const r = live;
    const t = state.clock.elapsedTime;

    // Stack layout
    let y = 0;
    for (let i = 0; i < LAYERS.length; i++) {
      const v = clamp01(LAYERS[i].vis(r));
      ys[i] = y;
      y += LAYERS[i].h * v + GAP * r.explode * (i < LAYERS.length - 1 ? v : 0);
    }
    const centre = -y / 2;

    // Focus: shift so the requested layer sits at the pivot
    const fi = Math.min(LAYERS.length - 1, Math.max(0, r.focus));
    const a = Math.floor(fi), b = Math.min(LAYERS.length - 1, a + 1), f = fi - a;
    const fy = THREE.MathUtils.lerp(ys[a] + LAYERS[a].h / 2, ys[b] + LAYERS[b].h / 2, f) + centre;
    inner.current.position.y = -fy * r.focusAmt;

    for (let i = 0; i < LAYERS.length; i++) {
      const g = layerRefs.current[i];
      if (!g) continue;
      const L = LAYERS[i];
      const v = clamp01(L.vis(r));
      const p = easeOut(clamp01((r.assemble - L.asm[0]) / (L.asm[1] - L.asm[0])));
      const k = 1 - p;
      let ox = 0, oy = 0;
      if (L.from === "above") oy = k * 7;
      else if (L.from === "below") oy = -k * 7;
      else if (L.from === "left") ox = -k * 7;
      else ox = k * 7;
      g.position.set(ox, ys[i] + centre + oy, 0);
      g.rotation.z = k * (L.from === "left" ? 0.9 : L.from === "right" ? -0.9 : 0.3);
      // subtle per-layer drift when exploded so it feels suspended, not static
      g.rotation.y = r.explode * Math.sin(t * 0.4 + i) * 0.12;
      const s = Math.max(0.0001, v);
      g.scale.set(0.6 + 0.4 * s, s, 0.6 + 0.4 * s);
      g.visible = v > 0.01 && p > 0.001;
    }

    res.pattyMat.emissiveIntensity = r.heat * 2.2 * (0.85 + Math.sin(t * 7) * 0.08 + Math.sin(t * 13) * 0.05);

    outer.current.position.set(r.bx, r.by + Math.sin(t * 0.8) * 0.04, 0);
    outer.current.rotation.set(r.rotX, r.rotY + Math.sin(t * 0.3) * 0.05, 0);
    outer.current.scale.setScalar(r.bs);

    shadowMat.current.opacity = 0.75 * (1 - r.explode * 0.7) * clamp01((r.assemble - 0.5) * 2) * (1 - r.focusAmt);
  });

  const setRef = (i: number) => (el: THREE.Group | null) => {
    layerRefs.current[i] = el;
  };

  return (
    <group ref={outer}>
      <group ref={inner}>
        {/* 0 bottom bun */}
        <group ref={setRef(0)}>
          <mesh geometry={res.bottomBun} material={res.bunMat} />
          <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshBasicMaterial ref={shadowMat} map={res.tex.soft} color="#000" transparent depthWrite={false} />
          </mesh>
        </group>
        {/* 1 sauce */}
        <group ref={setRef(1)}>
          <mesh geometry={res.sauce} material={res.sauceMat} position-y={0.025} />
        </group>
        {/* 2 lettuce */}
        <group ref={setRef(2)}>
          <mesh geometry={res.lettuce} material={res.lettuceMat} position-y={0.05} />
        </group>
        {/* 3 tomato */}
        <group ref={setRef(3)}>
          <mesh geometry={res.tomato} material={res.tomatoMats} position={[-0.46, 0.05, 0.12]} />
          <mesh geometry={res.tomato} material={res.tomatoMats} position={[0.5, 0.055, -0.1]} rotation-y={1} />
        </group>
        {/* 4 onion */}
        <group ref={setRef(4)}>
          {res.onion.map((g, i) => (
            <mesh key={i} geometry={g} material={res.onionMat} rotation-x={Math.PI / 2} position={[i * 0.06 - 0.06, 0.035, i * 0.05]} />
          ))}
        </group>
        {/* 5 patty */}
        <group ref={setRef(5)}>
          <mesh geometry={res.patty} material={res.pattyMat} position-y={0.16} />
        </group>
        {/* 6 cheese */}
        <group ref={setRef(6)}>
          <mesh geometry={res.cheese} material={res.cheeseMat} position-y={0.02} />
        </group>
        {/* 7 patty 2 */}
        <group ref={setRef(7)}>
          <mesh geometry={res.patty} material={res.pattyMat} position-y={0.16} rotation-y={2} />
        </group>
        {/* 8 cheese 2 */}
        <group ref={setRef(8)}>
          <mesh geometry={res.cheese} material={res.cheeseMat} position-y={0.02} rotation-y={0.5} />
        </group>
        {/* 9 bacon */}
        <group ref={setRef(9)}>
          <mesh geometry={res.bacon} material={res.baconMat} position={[0, 0.05, -0.3]} rotation-y={0.25} />
          <mesh geometry={res.bacon} material={res.baconMat} position={[0, 0.06, 0.3]} rotation-y={-0.2} />
        </group>
        {/* 10 jalapeño */}
        <group ref={setRef(10)}>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + 0.3;
            const rr = i % 2 ? 0.85 : 0.45;
            return (
              <mesh key={i} geometry={res.jal} material={[res.jalMat, res.jalCapMat, res.jalCapMat]} position={[Math.cos(a) * rr, 0.03 + (i % 3) * 0.008, Math.sin(a) * rr]} rotation={[0.1 * (i % 3), 0, 0.08]} />
            );
          })}
        </group>
        {/* 11 top bun */}
        <group ref={setRef(11)}>
          <mesh geometry={res.topBun} material={res.bunMat} />
          <instancedMesh ref={seedsRef} args={[res.seedGeo, res.seedMat, res.seeds.length]} frustumCulled={false} />
        </group>
      </group>
    </group>
  );
}
