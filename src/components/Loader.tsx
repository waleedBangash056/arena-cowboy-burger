import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Mark } from "./ui";

/**
 * Opening title card. Holds until the WebGL scene reports ready (or a
 * safety timeout), then lifts like a theatre curtain into the hero shot.
 */
export default function Loader({ ready, reduced, onDone }: { ready: boolean; reduced: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const counterTween = useRef<gsap.core.Tween | null>(null);
  const finished = useRef(false);
  const state = useRef({ v: 0 });

  useLayoutEffect(() => {
    const el = root.current!;
    gsap.fromTo(el.querySelectorAll("[data-l]"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.1 });
    counterTween.current = gsap.to(state.current, {
      v: 82,
      duration: reduced ? 0.3 : 1.5,
      ease: "power2.out",
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(state.current.v)).padStart(3, "0");
      },
    });
  }, [reduced]);

  useEffect(() => {
    if (!ready || finished.current) return;
    finished.current = true;
    const el = root.current!;
    const tl = gsap.timeline({ delay: reduced ? 0 : 0.3, onComplete: onDone });
    tl.to(state.current, {
      v: 100,
      duration: reduced ? 0.2 : 0.6,
      ease: "power2.inOut",
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(state.current.v)).padStart(3, "0");
      },
    })
      .to(el.querySelectorAll("[data-l]"), { yPercent: -110, duration: 0.7, ease: "expo.in", stagger: 0.04 }, "+=0.1")
      .to(el.querySelector("[data-bar]"), { scaleX: 1, duration: 0.6, ease: "expo.inOut" }, "<")
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: reduced ? 0.3 : 1.1, ease: "expo.inOut" }, "-=0.15")
      .set(el, { display: "none" });
    return () => {
      if (tl.progress() < 1) {
        tl.kill();
        finished.current = false;
      }
    };
  }, [ready, reduced, onDone]);

  return (
    <div ref={root} className="fixed inset-0 z-[90] flex flex-col justify-between bg-night p-6 md:p-10" style={{ clipPath: "inset(0 0 0% 0)" }} role="status" aria-label="Loading Cowboy Burger">
      <div className="flex items-center justify-between text-dust">
        <span className="overflow-hidden">
          <span data-l className="t-label block">Cowboy Burger</span>
        </span>
        <span className="overflow-hidden">
          <span data-l className="t-label block">Est. by fire</span>
        </span>
      </div>

      <div className="flex flex-col items-center">
        <span className="overflow-hidden">
          <Mark className="block h-10 w-10 text-ember" />
        </span>
        <p className="t-display mt-6 text-center text-[16vw] text-bone md:text-[9vw]" aria-hidden="true">
          <span className="block overflow-hidden">
            <span data-l className="block">Cowboy</span>
          </span>
          <span className="block overflow-hidden">
            <span data-l className="t-serif block text-[0.55em] normal-case text-brass">burger</span>
          </span>
        </p>
      </div>

      <div>
        <div className="mb-4 h-px w-full origin-left scale-x-0 bg-ember" data-bar />
        <div className="flex items-end justify-between">
          <span className="t-label text-dust">Lighting the grill</span>
          <span className="overflow-hidden">
            <span data-l className="t-display block text-5xl text-bone tabular-nums md:text-7xl">
              <span ref={count}>000</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
