import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { brand, chapters } from "../content/site";
import { scrollToTarget, stopScroll } from "../lib/scroll";
import { startAmbience, stopAmbience } from "../lib/sound";
import { Arrow, Magnetic, Mark } from "./ui";
import { cn } from "../utils/cn";

gsap.registerPlugin(ScrollTrigger);

const menuLinks = [
  { id: "reveal", label: "The Burger" },
  { id: "anatomy", label: "Anatomy" },
  { id: "craft", label: "The Craft" },
  { id: "menu", label: "The Lineup" },
  { id: "story", label: "Our Code" },
  { id: "visit", label: "Visit" },
];

export default function Nav({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [sound, setSound] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Chapter tracking
  useEffect(() => {
    if (!ready) return;
    const triggers = gsap.utils.toArray<HTMLElement>("[data-chapter]").map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActive(chapters.findIndex((c) => c.id === el.dataset.chapter));
        },
      })
    );
    const st = ScrollTrigger.create({ start: 80, onToggle: (s) => setScrolled(s.isActive) });
    return () => {
      triggers.forEach((t) => t.kill());
      st.kill();
    };
  }, [ready]);

  // Overlay timeline
  useEffect(() => {
    const el = overlay.current!;
    tl.current = gsap
      .timeline({ paused: true })
      .set(el, { display: "flex" })
      .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.inOut" })
      .fromTo(el.querySelectorAll("[data-m]"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, "-=0.35")
      .fromTo(el.querySelectorAll("[data-mf]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 }, "-=0.6");
    return () => {
      tl.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (open) {
      tl.current?.timeScale(1).play();
      stopScroll(true);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      (overlay.current?.querySelector("a") as HTMLElement | null)?.focus();
      return () => window.removeEventListener("keydown", onKey);
    } else {
      tl.current?.timeScale(1.6).reverse();
      stopScroll(false);
    }
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollToTarget(`#${id}`), open ? 500 : 0);
    menuBtn.current?.focus();
  };

  const toggleSound = () => {
    if (sound) stopAmbience();
    else startAmbience();
    setSound(!sound);
  };

  const light = chapters[active]?.id === "story" && !open;
  const chapter = chapters[Math.max(0, active)];

  return (
    <>
      <a href="#main" className="t-label fixed left-4 top-4 z-[100] -translate-y-24 bg-bone px-4 py-3 text-night focus:translate-y-0">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[color,background] duration-700",
          light ? "text-ink" : "text-bone",
          scrolled && !open && !light ? "bg-gradient-to-b from-night/80 to-transparent" : ""
        )}
      >
        <nav className="flex items-center justify-between px-5 py-5 md:px-10 md:py-7" aria-label="Primary">
          <a href="#opening" onClick={(e) => (e.preventDefault(), go("opening"))} className="group flex items-center gap-3" aria-label="Cowboy Burger — back to top">
            <Mark className="h-6 w-6 text-ember transition-transform duration-700 group-hover:rotate-90" />
            <span className="t-display text-2xl tracking-wide">
              Cowboy<span className="t-serif ml-1 text-[0.85em] normal-case text-brass">burger</span>
            </span>
          </a>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex" aria-live="polite">
            <span className="t-label opacity-50">{String(Math.max(0, active) + 1).padStart(2, "0")}</span>
            <span className="h-px w-8 bg-current opacity-40" />
            <span key={chapter.id} className="t-label animate-[fadeIn_0.6s_ease]">
              {chapter.label}
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? "Turn ambient fire sound off" : "Turn ambient fire sound on"}
              data-cursor={sound ? "Mute" : "Sound"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-current/25"
            >
              <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-[2px] bg-current"
                    style={{
                      height: sound ? undefined : 3,
                      animation: sound ? `eq 0.${6 + i}s ${i * 0.1}s ease-in-out infinite alternate` : "none",
                    }}
                  />
                ))}
              </span>
            </button>
            <Magnetic className="hidden sm:inline-block">
              <a href={brand.orderUrl} className={cn("btn !h-11 !px-5", light ? "btn-dark" : "btn-primary")} data-cursor="Order">
                Order now
              </a>
            </Magnetic>
            <button
              ref={menuBtn}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="flex h-11 items-center gap-3 rounded-full border border-current/25 px-4"
            >
              <span className="t-label hidden sm:inline">{open ? "Close" : "Menu"}</span>
              <span className="relative block h-2.5 w-5" aria-hidden="true">
                <span className={cn("absolute left-0 h-px w-full bg-current transition-transform duration-500", open ? "top-1/2 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 h-px w-full bg-current transition-transform duration-500", open ? "top-1/2 -rotate-45" : "bottom-0")} />
              </span>
              <span className="sr-only sm:hidden">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </nav>
      </header>

      <div
        ref={overlay}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className="fixed inset-0 z-40 hidden flex-col justify-between bg-coal px-5 pb-8 pt-28 md:px-10 md:pb-10"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(60% 50% at 80% 100%, rgb(226 84 27 / 0.25), transparent 70%)" }}
        />
        <ul className="relative">
          {menuLinks.map((l, i) => (
            <li key={l.id} className="overflow-hidden border-b border-bone/10">
              <a
                href={`#${l.id}`}
                tabIndex={open ? 0 : -1}
                onClick={(e) => (e.preventDefault(), go(l.id))}
                className="group flex items-baseline justify-between py-2 md:py-3"
              >
                <span data-m className="t-display block text-[13vw] leading-[0.9] text-bone transition-colors duration-500 group-hover:text-ember md:text-[6.5vw]">
                  {l.label}
                </span>
                <span data-mf className="t-label text-dust">
                  {String(i + 2).padStart(2, "0")}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p data-mf className="t-serif max-w-sm text-2xl text-dust">
            {brand.tagline}
          </p>
          <div data-mf className="flex gap-3">
            <a href={brand.orderUrl} tabIndex={open ? 0 : -1} className="btn btn-primary">
              Order now <Arrow />
            </a>
            <a href={brand.locationsUrl} tabIndex={open ? 0 : -1} onClick={(e) => (e.preventDefault(), go("visit"))} className="btn btn-ghost">
              Visit
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
