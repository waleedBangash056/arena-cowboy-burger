import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import Burger from "./Burger";
import { Embers, Smoke, FireGlow } from "./Atmosphere";
import { live, dampLive, snapLive } from "./live";
import { pointer } from "../lib/store";

/** Camera choreography: reads the damped rig, adds handheld micro-motion and pointer parallax. */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3());
  const p = useRef({ x: 0, y: 0 });
  const first = useRef(true);

  useFrame((state, dt) => {
    if (first.current) {
      snapLive();
      first.current = false;
    } else dampLive(dt, reduced ? 20 : 5.5);

    const t = state.clock.elapsedTime;
    const aspect = size.width / size.height;
    const portrait = aspect < 0.9;

    // On portrait screens: centre the subject, pull back, and frame it in
    // the upper half so copy can live in the lower half.
    const xMul = portrait ? 0.08 : aspect < 1.3 ? 0.6 : 1;
    const dist = portrait ? 1.28 + (0.9 - aspect) * 0.9 : aspect < 1.3 ? 1.12 : 1;

    p.current.x = THREE.MathUtils.damp(p.current.x, reduced ? 0 : pointer.x, 3, dt);
    p.current.y = THREE.MathUtils.damp(p.current.y, reduced ? 0 : pointer.y, 3, dt);

    const tx = live.tgtX * xMul;
    const ty = live.tgtY - (portrait ? 0.85 : 0);
    target.current.set(tx, ty, 0);

    const hand = reduced ? 0 : 1;
    camera.position.set(
      tx + (live.camX - live.tgtX * 1) * dist + p.current.x * 0.35 + Math.sin(t * 0.5) * 0.03 * hand,
      ty + (live.camY - live.tgtY) * dist + p.current.y * 0.22 + Math.sin(t * 0.7) * 0.025 * hand,
      live.camZ * dist
    );
    camera.lookAt(target.current);
  }, -1);

  return null;
}

/** Applies the portrait x-compression to the burger group itself. */
function MobileAdapter({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  const { size } = useThree();
  useFrame(() => {
    const aspect = size.width / size.height;
    const portrait = aspect < 0.9;
    // Burger.tsx positions at live.bx; compensate so it stays centred on portrait
    g.current.position.x = portrait ? -live.bx * 0.92 : aspect < 1.3 ? -live.bx * 0.4 : 0;
  });
  return <group ref={g}>{children}</group>;
}

function Lights() {
  const key = useRef<THREE.SpotLight>(null!);
  const rim = useRef<THREE.PointLight>(null!);
  const fire = useRef<THREE.PointLight>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    key.current.intensity = 120 * live.key;
    rim.current.intensity = 70 * live.rim;
    rim.current.position.set(live.bx - 2.5, live.by + 2.5, -3);
    fire.current.intensity = live.fire * 40 * (0.85 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.06);
    fire.current.position.set(live.bx, live.by - 2.2, 1);
    key.current.target.position.set(live.bx, live.by, 0);
    key.current.target.updateMatrixWorld();
  });
  return (
    <>
      <ambientLight intensity={0.08} color="#ffd8b0" />
      <spotLight ref={key} position={[3.5, 6, 6]} angle={0.55} penumbra={0.9} color="#ffe2bf" decay={1.6} />
      <pointLight ref={rim} color="#ff7a2e" decay={1.4} distance={14} />
      <pointLight ref={fire} color="#ff5410" decay={1.5} distance={8} />
      <directionalLight position={[-4, 1, 3]} intensity={0.25} color="#9fb4ff" />
    </>
  );
}

export default function Scene({ quality, reduced, onReady }: { quality: 0 | 1 | 2; reduced: boolean; onReady: () => void }) {
  const [dpr, setDpr] = useState(quality === 2 ? 1.75 : quality === 1 ? 1.5 : 1);
  return (
    <Canvas
      style={{ position: "fixed", inset: 0, width: "100%", height: "100lvh", zIndex: 5, pointerEvents: "none" }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(onReady))}
      dpr={dpr}
      gl={{ antialias: quality > 0, powerPreference: "high-performance", alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 0.4, 8.2] }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} onIncline={() => setDpr((d) => Math.min(quality === 2 ? 1.75 : 1.5, d + 0.25))} />
      <AdaptiveDpr pixelated={false} />
      <CameraRig reduced={reduced} />
      <Lights />
      {/* Local studio reflections — rendered once, no HDR download */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffd9a8" position={[3, 4, 4]} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={3} color="#ff6a2a" position={[-4, 1, -3]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffffff" position={[0, 6, 0]} scale={3} />
      </Environment>
      {!reduced && <Smoke count={quality === 0 ? 4 : 8} />}
      {!reduced && <Embers count={quality === 0 ? 120 : quality === 1 ? 260 : 420} />}
      <MobileAdapter>
        <FireGlow />
        <Burger quality={quality} />
      </MobileAdapter>
    </Canvas>
  );
}

export { live };
