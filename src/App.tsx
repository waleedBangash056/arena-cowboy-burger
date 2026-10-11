import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Loader from "./components/Loader";
import Nav from "./components/Nav";
import { Cursor } from "./components/ui";
import { Hero, Reveal } from "./sections/Opening";
import { Anatomy, Ingredients } from "./sections/Anatomy";
import Craft from "./sections/Craft";
import Menu from "./sections/Menu";
import Story from "./sections/Story";
import { Finale, Footer } from "./sections/Finale";
import { initScroll, stopScroll } from "./lib/scroll";
import { deviceTier, hasWebGL, prefersReducedMotion } from "./lib/capabilities";
import { pointer, scrollState } from "./lib/store";
import { useReveals } from "./hooks/useReveals";
import heroPoster from "./assets/hero-burger.jpg";

gsap.registerPlugin(ScrollTrigger);

// Code-split the WebGL bundle so the DOM + loader paint first
const Scene = lazy(() => import("./three/Scene"));

/** Graceful fallback when WebGL is unavailable: a cinematic still with slow scroll drift. */
function PosterStage() {
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const tick = () => {
      if (img.current) img.current.style.transform = `scale(${1.08 + scrollState.progress * 0.25}) translateY(${scrollState.progress * -4}%)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <div className="fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
      <img ref={img} src={heroPoster} alt="" className="h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/40 to-transparent" />
    </div>
  );
}

/** Thin film-strip progress rail. */
function ProgressRail() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const tick = () => {
      if (bar.current) bar.current.style.transform = `scaleY(${scrollState.progress})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden h-40 w-px -translate-y-1/2 bg-bone/15 md:block" aria-hidden="true">
      <span ref={bar} className="absolute inset-0 origin-top scale-y-0 bg-ember" />
    </div>
  );
}

export default function App() {
  const [caps] = useState(() => ({ webgl: hasWebGL(), reduced: prefersReducedMotion(), tier: deviceTier() }));
  const [sceneReady, setSceneReady] = useState(!caps.webgl);
  const [fontsReady, setFontsReady] = useState(false);
  const [started, setStarted] = useState(false);

  // Scroll engine
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const cleanup = initScroll(caps.reduced);
    stopScroll(true);
    return cleanup;
  }, [caps.reduced]);

  // Fonts + safety net (never trap users behind the loader)
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true));
    const t = window.setTimeout(() => {
      setFontsReady(true);
      setSceneReady(true);
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  // Pointer → camera parallax
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const onDone = useCallback(() => {
    setStarted(true);
    stopScroll(false);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  const onSceneReady = useCallback(() => setSceneReady(true), []);

  useReveals(started, caps.reduced);

  return (
    <>
      <Loader ready={sceneReady && fontsReady} reduced={caps.reduced} onDone={onDone} />

      {caps.webgl ? (
        <Suspense fallback={null}>
          <Scene quality={caps.tier} reduced={caps.reduced} onReady={onSceneReady} />
        </Suspense>
      ) : (
        <PosterStage />
      )}
      <div className="vignette" />
      <div className="grain" aria-hidden="true" />

      <Nav ready={started} />
      <ProgressRail />
      <Cursor />

      {/* No z-index on <main>: lets hero/finale wordmarks sit BEHIND the canvas while copy sits in front */}
      <main id="main">
        <Hero started={started} reduced={caps.reduced} />
        <Reveal />
        <Anatomy />
        <Ingredients />
        <Craft ready={started} />
        <Menu ready={started} />
        <Story ready={started} reduced={caps.reduced} />
        <Finale ready={started} reduced={caps.reduced} />
      </main>
      <Footer />
    </>
  );
}
