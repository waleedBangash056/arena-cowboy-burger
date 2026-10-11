import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Arrow, Lines, Magnetic } from "../components/ui";
import { scrollToTarget } from "../lib/scroll";

gsap.registerPlugin(ScrollTrigger);

export function Hero({ started, reduced }: { started: boolean; reduced: boolean }) {
  const word = useRef<HTMLDivElement>(null);
  const fg = useRef<HTMLDivElement>(null);

  // Intro: the title card hands over to the hero shot
  useEffect(() => {
    if (!started) return;
    const letters = word.current!.querySelectorAll("[data-letter]");
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(letters, { y: 0, yPercent: 0 });
        gsap.set(fg.current!.querySelectorAll("[data-hero]"), { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(letters, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: 1.6, ease: "expo.out", stagger: 0.06, delay: 0.1 });
      gsap.fromTo(fg.current!.querySelectorAll("[data-hero]"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.6 });
      // Scroll-out: the word recedes into the smoke as the camera dollies
      gsap.to(word.current, {
        yPercent: -35,
        scale: 0.86,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#opening", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(fg.current, {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#opening", start: "top top", end: "60% top", scrub: true },
      });
    });
    return () => ctx.revert();
  }, [started, reduced]);

  return (
    <section id="opening" data-chapter="opening" className="relative h-[100svh] min-h-[600px]" aria-labelledby="hero-title">
      {/* Giant wordmark sits BEHIND the WebGL burger (z-1 < canvas z-5) */}
      <div ref={word} className="pointer-events-none absolute inset-x-0 top-[22%] z-[1] flex justify-center md:top-[18%]" aria-hidden="true">
        <div className="t-display flex select-none text-[27vw] leading-[0.8] text-bone md:text-[23vw]">
          {"COWBOY".split("").map((l, i) => (
            <span key={i} className="block overflow-hidden">
              <span data-letter className="block" style={{ transform: "translateY(105%)" }}>
                {l}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div ref={fg} className="relative z-10 flex h-full flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pb-10 md:pt-32">
        <div className="flex justify-between text-dust">
          <span data-hero className="t-label opacity-0">Smash burgers · Fire-grilled</span>
          <span data-hero className="t-label hidden opacity-0 md:block">(01) — Opening</span>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <h1 id="hero-title" data-hero className="t-serif text-[2.6rem] leading-[0.95] text-bone opacity-0 md:text-6xl">
              Forged in fire.
              <br />
              <span className="text-brass">Built by hand.</span>
            </h1>
            <p data-hero className="mt-5 max-w-sm text-[15px] leading-relaxed text-dust opacity-0">
              Cowboy Burger is fresh beef, hot iron and no shortcuts. Scroll to take the burger apart, layer by layer.
            </p>
          </div>
          <div className="flex items-end justify-between md:col-span-7 md:justify-end md:gap-10">
            <Magnetic>
              <button data-hero onClick={() => scrollToTarget("#reveal")} className="btn btn-ghost opacity-0" data-cursor="Begin">
                Begin the ride <Arrow />
              </button>
            </Magnetic>
            <div data-hero className="flex flex-col items-center gap-3 opacity-0" aria-hidden="true">
              <span className="t-label text-dust [writing-mode:vertical-rl]">Scroll</span>
              <span className="relative block h-14 w-px overflow-hidden bg-bone/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_var(--ease-cine)_infinite] bg-ember" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Reveal() {
  return (
    <section id="reveal" data-chapter="reveal" className="relative z-10 h-[190vh]" aria-labelledby="reveal-title">
      <div className="sticky top-0 flex h-[100svh] items-end px-5 pb-16 md:items-center md:px-10 md:pb-0">
        <div data-reveal className="max-w-xl rounded-sm bg-gradient-to-t from-night via-night/70 to-transparent pt-16 md:bg-none md:pt-0">
          <p className="t-label mb-6 text-ember">
            <Lines lines={["(02) — The Burger"]} />
          </p>
          <h2 id="reveal-title" className="t-display text-[17vw] text-bone md:text-[8.5vw]">
            <Lines lines={["Not fast", "food."]} />
            <Lines lines={[<span className="t-serif normal-case text-brass">Fire food.</span>]} className="-mt-[0.02em] text-[0.8em]" />
          </h2>
          <p data-fade className="mt-8 max-w-md text-base leading-relaxed text-dust md:text-lg">
            Simple things done with obsessive care. A hard sear, a soft bun, a sauce we make ourselves — stacked in the right order, served the moment it's ready.
          </p>
          <div data-fade className="rule mt-10 w-48" />
        </div>
      </div>
    </section>
  );
}
