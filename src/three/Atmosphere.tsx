import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { live } from "./live";
import { makeTextures } from "./assets";

/** GPU embers: positions animated entirely in the vertex shader (1 draw call). */
export function Embers({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 0.5;
      seed[i * 2] = 0.25 + Math.random() * 0.75; // speed
      seed[i * 2 + 1] = Math.random() * 100; // phase
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uIntensity: { value: 0.5 }, uPixel: { value: 1 } }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uIntensity.value = live.embers;
    uniforms.uPixel.value = state.gl.getPixelRatio();
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          attribute vec2 aSeed;
          uniform float uTime; uniform float uPixel;
          varying float vLife;
          void main() {
            vec3 p = position;
            float h = 9.0;
            float y = mod(p.y + uTime * aSeed.x * 0.9, h);
            vLife = y / h;
            p.y = y - 4.0;
            p.x += sin(uTime * 0.6 + aSeed.y) * 0.35 * vLife + sin(uTime * 2.1 + aSeed.y * 3.0) * 0.05;
            p.z += cos(uTime * 0.5 + aSeed.y) * 0.25 * vLife;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float flicker = 0.6 + 0.4 * sin(uTime * 8.0 + aSeed.y * 10.0);
            gl_PointSize = (14.0 * aSeed.x + 4.0) * flicker * uPixel / -mv.z;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uIntensity;
          varying float vLife;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            vec3 hot = vec3(1.0, 0.78, 0.42);
            vec3 cool = vec3(0.95, 0.28, 0.06);
            vec3 col = mix(hot, cool, vLife);
            float fade = smoothstep(0.0, 0.1, vLife) * (1.0 - smoothstep(0.65, 1.0, vLife));
            gl_FragColor = vec4(col, a * fade * uIntensity);
          }
        `}
      />
    </points>
  );
}

/** Soft volumetric-feeling smoke from a handful of billboarded sprites. */
export function Smoke({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null!);
  const tex = useMemo(() => makeTextures().smoke, []);
  const puffs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 7,
        y: (Math.random() - 0.5) * 3,
        z: -2.5 - Math.random() * 2,
        s: 4 + Math.random() * 4,
        speed: 0.05 + Math.random() * 0.08,
        rot: Math.random() * Math.PI,
        phase: i * 1.7,
      })),
    [count]
  );
  const mats = useMemo(
    () => puffs.map(() => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: "#8a6a55", opacity: 0 })),
    [puffs, tex]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      const p = puffs[i];
      const cycle = ((t * p.speed + p.phase * 0.1) % 1 + 1) % 1;
      m.position.set(p.x + Math.sin(t * 0.1 + p.phase) * 0.5, p.y + cycle * 3 - 1.5, p.z);
      m.rotation.z = p.rot + t * 0.03 * (i % 2 ? 1 : -1);
      m.quaternion.copy(state.camera.quaternion);
      m.rotateZ(p.rot + t * 0.04);
      mats[i].opacity = live.smoke * 0.16 * Math.sin(cycle * Math.PI);
    });
  });

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <mesh key={i} material={mats[i]} scale={p.s}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

/** Fire glow behind/below the burger — the "heat" of the frame. */
export function FireGlow() {
  const back = useRef<THREE.Mesh>(null!);
  const under = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => makeTextures().soft, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flick = 0.9 + Math.sin(t * 5.3) * 0.05 + Math.sin(t * 11.7) * 0.04;
    back.current.position.set(live.bx * 0.85, live.by + 0.3, -4);
    (back.current.material as THREE.MeshBasicMaterial).opacity = (0.22 + live.fire * 0.45) * flick;
    under.current.position.set(live.bx, live.by - 2.6, -1);
    (under.current.material as THREE.MeshBasicMaterial).opacity = live.fire * 0.85 * flick;
  });
  return (
    <>
      <mesh ref={back} scale={[13, 10, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={tex} color="#c2410c" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={under} scale={[10, 4, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={tex} color="#ff5a14" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}
