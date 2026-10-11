import * as THREE from "three";

/**
 * PROCEDURAL ASSETS
 * The entire burger is generated in code: lathe/displaced geometry and
 * small canvas textures. Result: zero model/texture downloads, a few
 * thousand triangles, and infinitely re-configurable layers (the menu
 * uses this to rebuild the burger per product).
 */

// ---------- deterministic noise ----------
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x: number, y: number, oct = 4) {
  let f = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < oct; i++) {
    f += amp * vnoise(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return f;
}

// ---------- canvas textures ----------
function canvasTex(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, srgb = true) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function noiseField(ctx: CanvasRenderingContext2D, s: number, scale: number, map: (n: number, x: number, y: number) => [number, number, number]) {
  const img = ctx.createImageData(s, s);
  for (let y = 0; y < s; y++)
    for (let x = 0; x < s; x++) {
      const n = fbm((x / s) * scale, (y / s) * scale, 5);
      const [r, g, b] = map(n, x, y);
      const i = (y * s + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
}

type TextureSet = ReturnType<typeof buildTextures>;
let cache: TextureSet | null = null;

/** Generated once per session and shared by every consumer. */
export function makeTextures(): TextureSet {
  if (!cache) cache = buildTextures();
  return cache;
}

function buildTextures() {
  const charBump = canvasTex(
    256,
    (ctx, s) =>
      noiseField(ctx, s, 14, (n) => {
        const v = Math.pow(n, 1.6) * 255;
        return [v, v, v];
      }),
    false
  );

  const pattyColor = canvasTex(256, (ctx, s) =>
    noiseField(ctx, s, 10, (n, x, y) => {
      const crisp = fbm(x * 0.09, y * 0.09, 3);
      const t = Math.min(1, Math.max(0, n * 1.4 - 0.2));
      // deep char → caramelised brown
      const r = 30 + t * 95 + crisp * 20;
      const g = 16 + t * 46 + crisp * 8;
      const b = 10 + t * 22;
      return [r, g, b];
    })
  );

  const heatMap = canvasTex(
    256,
    (ctx, s) =>
      noiseField(ctx, s, 9, (n) => {
        const v = Math.max(0, n - 0.48) * 4 * 255;
        return [v, v * 0.5, v * 0.15];
      })
  );

  const tomatoCap = canvasTex(256, (ctx, s) => {
    const c = s / 2;
    ctx.fillStyle = "#b8261a";
    ctx.fillRect(0, 0, s, s);
    const g = ctx.createRadialGradient(c, c, 4, c, c, c);
    g.addColorStop(0, "#e2553a");
    g.addColorStop(0.75, "#cf3a24");
    g.addColorStop(0.92, "#a51d12");
    g.addColorStop(1, "#7d120b");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    // seed chambers
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.save();
      ctx.translate(c + Math.cos(a) * c * 0.48, c + Math.sin(a) * c * 0.48);
      ctx.rotate(a);
      ctx.fillStyle = "rgba(240,140,90,0.85)";
      ctx.beginPath();
      ctx.ellipse(0, 0, c * 0.26, c * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(250,215,150,0.9)";
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.ellipse((k - 2.5) * c * 0.06, Math.sin(k) * c * 0.04, 3, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  const bacon = canvasTex(128, (ctx, s) =>
    noiseField(ctx, s, 6, (n, _x, y) => {
      const band = Math.sin((y / s) * Math.PI * 7 + fbm(y * 0.1, 1) * 4);
      return band > 0.55 ? [210 + n * 30, 150 + n * 30, 110 + n * 20] : [110 + n * 50, 34 + n * 20, 22 + n * 12];
    })
  );

  const soft = canvasTex(128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

  const smoke = canvasTex(256, (ctx, s) => {
    const img = ctx.createImageData(s, s);
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) {
        const dx = x / s - 0.5, dy = y / s - 0.5;
        const d = Math.sqrt(dx * dx + dy * dy) * 2;
        const n = fbm(x * 0.02, y * 0.02, 5);
        const a = Math.max(0, 1 - d) * Math.pow(n, 1.5) * 1.9;
        const i = (y * s + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = Math.min(255, a * 255);
      }
    ctx.putImageData(img, 0, 0);
  });

  return { charBump, pattyColor, heatMap, tomatoCap, bacon, soft, smoke };
}

// ---------- geometry ----------
const crust = new THREE.Color("#b5601f");
const crustTop = new THREE.Color("#8f4416");
const crumb = new THREE.Color("#e9c58c");

function colorize(geo: THREE.BufferGeometry, fn: (p: THREE.Vector3, n: THREE.Vector3) => THREE.Color) {
  geo.computeVertexNormals();
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const cols = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    const c = fn(p, n);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return geo;
}

export const TOP_BUN_H = 0.88;
export const BOTTOM_BUN_H = 0.42;

/** dome profile for the crown */
function domePoint(t: number) {
  const th = t * (Math.PI / 2);
  const x = 1.27 * Math.pow(Math.cos(th), 0.55);
  const y = 0.1 + (TOP_BUN_H - 0.1) * Math.pow(Math.sin(th), 0.85);
  return new THREE.Vector2(x, y);
}

export function topBunGeometry(segments: number) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(1.12, 0), new THREE.Vector2(1.13, 0.004), new THREE.Vector2(1.22, 0.03)];
  for (let i = 0; i <= 24; i++) pts.push(domePoint(i / 24));
  pts[pts.length - 1].x = 0;
  const g = new THREE.LatheGeometry(pts, segments);
  return colorize(g, (p, n) => {
    if (p.y < 0.006 && n.y < -0.5) return crumb.clone();
    const c = crust.clone().lerp(crustTop, Math.min(1, p.y / TOP_BUN_H) ** 1.5);
    return p.y < 0.06 ? c.lerp(crumb, 0.45) : c;
  });
}

export function bottomBunGeometry(segments: number) {
  const H = BOTTOM_BUN_H;
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(1.05, 0)];
  for (let i = 0; i <= 12; i++) {
    const th = -Math.PI / 2 + (i / 12) * Math.PI;
    pts.push(new THREE.Vector2(1.08 + 0.17 * Math.cos(th), H / 2 + (H / 2) * Math.sin(th) * 0.98));
  }
  pts.push(new THREE.Vector2(1.06, H), new THREE.Vector2(1.05, H), new THREE.Vector2(0, H));
  const g = new THREE.LatheGeometry(pts, segments);
  return colorize(g, (p, n) => (p.y > H - 0.01 && n.y > 0.5 ? crumb.clone().multiplyScalar(0.94) : crust.clone().lerp(crumb, p.y > H - 0.05 ? 0.4 : 0)));
}

export function seedTransforms(count: number) {
  const mats: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const t = 0.18 + hash(i, 3.1) * 0.74;
    const phi = hash(i, 7.7) * Math.PI * 2;
    const d = domePoint(t);
    const pos = new THREE.Vector3(Math.cos(phi) * d.x, d.y, Math.sin(phi) * d.x);
    const n = new THREE.Vector3(pos.x / 1.6, (pos.y - 0.1) / 0.6, pos.z / 1.6).normalize();
    q.setFromUnitVectors(up, n);
    const spin = new THREE.Quaternion().setFromAxisAngle(n, hash(i, 9.2) * Math.PI);
    q.premultiply(spin);
    mats.push(new THREE.Matrix4().compose(pos.add(n.clone().multiplyScalar(0.005)), q, new THREE.Vector3(1, 0.45, 1.8)));
  }
  return mats;
}

export function pattyGeometry() {
  const g = new THREE.CylinderGeometry(1.3, 1.28, 0.32, 72, 3, false);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.z, v.x);
    const r = Math.hypot(v.x, v.z);
    const edge = 1 + (fbm(Math.cos(a) * 2 + 3, Math.sin(a) * 2 + 3, 4) - 0.5) * 0.16;
    if (r > 0.01) {
      v.x *= edge;
      v.z *= edge;
    }
    const top = v.y > 0 ? 1 : -1;
    v.y += top * (fbm(v.x * 2.5 + 9, v.z * 2.5 + 9, 3) - 0.5) * 0.07 * Math.min(1, r);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function cheeseGeometry() {
  const g = new THREE.PlaneGeometry(2.5, 2.5, 36, 36);
  g.rotateX(-Math.PI / 2);
  g.rotateY(Math.PI / 4);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const d = Math.hypot(x, z);
    const over = Math.max(0, d - 1.24);
    const y = -over * over * 1.6 - over * 0.25 + (fbm(x * 3, z * 3, 2) - 0.5) * 0.02;
    pos.setY(i, y);
  }
  g.computeVertexNormals();
  return g;
}

export function lettuceGeometry() {
  const g = new THREE.RingGeometry(0.02, 1.52, 120, 8);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const a = Math.atan2(z, x), r = Math.hypot(x, z);
    const ruffle = Math.sin(a * 13 + fbm(a * 2, r) * 6) * 0.09 * Math.pow(r / 1.5, 2);
    const scale = 1 + Math.sin(a * 7) * 0.05 * (r / 1.5);
    pos.setXYZ(i, x * scale, ruffle - Math.pow(r / 1.5, 3) * 0.08, z * scale);
  }
  g.computeVertexNormals();
  return g;
}

export function sauceGeometry() {
  const g = new THREE.CylinderGeometry(1.3, 1.3, 0.05, 96, 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.01) continue;
    const a = Math.atan2(z, x);
    const drip = Math.max(0, Math.sin(a * 6 + 1.3) * Math.sin(a * 3.7)) ;
    const k = 1 + drip * 0.08 + (fbm(a * 3, 2) - 0.5) * 0.06;
    pos.setXYZ(i, x * k, y < 0 ? y - drip * 0.18 : y, z * k);
  }
  g.computeVertexNormals();
  return g;
}

export function baconGeometry() {
  const g = new THREE.PlaneGeometry(2.7, 0.42, 60, 4);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    pos.setY(i, Math.sin(x * 4.5) * 0.06 + Math.sin(x * 9 + z * 6) * 0.015);
  }
  g.computeVertexNormals();
  return g;
}
