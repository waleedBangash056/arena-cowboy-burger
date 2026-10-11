/** Runtime capability detection used to pick the right experience tier. */

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    // Reject software renderers that cannot sustain the scene
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      const renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).toLowerCase();
      if (renderer.includes("swiftshader") || renderer.includes("llvmpipe")) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

export function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** Rough device tier: 0 = low, 1 = mid, 2 = high */
export function deviceTier(): 0 | 1 | 2 {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  if (isCoarsePointer()) return cores >= 6 && mem >= 4 ? 1 : 0;
  return cores >= 8 ? 2 : 1;
}
