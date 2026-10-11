import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildDirector, seekDirector } from "./director";
import { scrollState } from "./store";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * One scroll engine for the whole site:
 *  - Lenis provides weighted inertial scrolling (disabled for reduced motion)
 *  - GSAP's ticker drives Lenis, ScrollTrigger and the Director in the same
 *    frame, so DOM and WebGL never drift apart.
 */
export function initScroll(reducedMotion: boolean) {
  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenis.on("scroll", ScrollTrigger.update);
  }

  const tick = (time: number) => {
    lenis?.raf(time * 1000);
    const y = window.scrollY;
    scrollState.velocity = y - scrollState.y;
    scrollState.y = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollState.progress = max > 0 ? y / max : 0;
    seekDirector(y);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const rebuild = () => {
    buildDirector();
    seekDirector(window.scrollY);
  };
  ScrollTrigger.addEventListener("refresh", rebuild);
  rebuild();

  const ro = new ResizeObserver(() => ScrollTrigger.refresh());
  ro.observe(document.body);

  return () => {
    gsap.ticker.remove(tick);
    ScrollTrigger.removeEventListener("refresh", rebuild);
    ro.disconnect();
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToTarget(target: string | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target as string | number, { duration: immediate ? 0 : 1.8, immediate, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    const y = typeof target === "number" ? target : (document.querySelector(target)?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({ top: y, behavior: "auto" });
  }
}

export function stopScroll(stop: boolean) {
  if (!lenis) {
    document.documentElement.style.overflow = stop ? "hidden" : "";
    return;
  }
  if (stop) lenis.stop();
  else lenis.start();
}
