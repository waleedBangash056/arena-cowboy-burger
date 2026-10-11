import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { brand } from "../content/site";
import { scrollToTarget } from "../lib/scroll";
import { Arrow, Lines, Magnetic, Mark } from "../components/ui";

gsap.registerPlugin(ScrollTrigger);

export function Finale({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const word = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        word.current,
        { scale: 1.25, opacity: 0, letterSpacing: "0.08em" },
        { scale: 1, opacity: 1, letterSpacing: "-0.01em", ease: "power2.out", scrollTrigger: { trigger: "#visit", start: "top 70%", end: "top top", scrub: true } }
      );
    });
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section id="visit" data-chapter="visit" className="relative h-[170vh]" aria-labelledby="visit-title">
      <div className="sticky top-0 h-[100svh]">
        {/* Behind the burger */}
        <div ref={word} className="pointer-events-none absolute inset-x-0 top-[16%] z-[1] text-center md:top-[12%]" aria-hidden="true">
          <span className="t-display block text-[25vw] leading-[0.8] text-bone md:text-[19vw]">Saddle</span>
          <span className="t-display block text-[25vw] leading-[0.8] text-ember md:text-[19vw]">up.</span>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-10 md:px-10 md:pb-12">
          <div data-reveal className="grid items-end gap-8 bg-gradient-to-t from-night via-night/70 to-transparent pt-16 md:grid-cols-12 md:bg-none md:pt-0">
            <div className="md:col-span-5">
              <p className="t-label mb-4 text-ember">
                <Lines lines={["(07) — Saddle Up"]} />
              </p>
              <h2 id="visit-title" className="t-serif text-4xl leading-[1] text-bone md:text-6xl">
                <Lines lines={["The grill is hot.", <span className="text-brass">Your move.</span>]} />
              </h2>
            </div>
            <div data-fade className="flex flex-wrap gap-3 md:col-span-7 md:justify-end">
              <Magnetic strength={0.45}>
                <a href={brand.orderUrl} className="btn btn-primary !h-16 !px-9 !text-[0.8rem]" data-cursor="Order">
                  Order now <Arrow />
                </a>
              </Magnetic>
              <Magnetic>
                <a href={brand.locationsUrl} className="btn btn-ghost !h-16 !px-8" data-cursor="Find">
                  Find a location
                </a>
              </Magnetic>
              <button onClick={() => scrollToTarget("#menu")} className="btn btn-ghost !h-16 !px-8" data-cursor="Menu">
                Explore menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-bone/10 bg-coal px-5 pb-8 pt-20 md:px-10" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Cowboy Burger information
      </h2>
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Mark className="h-8 w-8 text-ember" />
          <p className="t-serif mt-6 max-w-sm text-3xl leading-tight text-bone">{brand.tagline}</p>
        </div>
        <div className="md:col-span-2">
          <p className="t-label mb-5 text-dust">Explore</p>
          <ul className="space-y-2 text-bone/80">
            {[
              ["The Burger", "reveal"],
              ["The Craft", "craft"],
              ["The Lineup", "menu"],
              ["Our Code", "story"],
            ].map(([l, id]) => (
              <li key={id}>
                <a href={`#${id}`} onClick={(e) => (e.preventDefault(), scrollToTarget(`#${id}`))} className="transition-colors hover:text-ember">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="t-label mb-5 text-dust">Visit</p>
          {/* PLACEHOLDER — replace with real address & opening hours */}
          <p className="leading-relaxed text-bone/80">
            Locations &amp; hours
            <br />
            <span className="text-dust">Announced soon</span>
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="t-label mb-5 text-dust">Say howdy</p>
          <a href={`mailto:${brand.email}`} className="text-bone/80 underline decoration-ember/60 underline-offset-4 transition-colors hover:text-ember">
            {brand.email}
          </a>
          <div className="mt-4">
            <a href={brand.instagram} className="t-label text-bone/70 hover:text-ember">
              Instagram ↗
            </a>
          </div>
        </div>
      </div>

      <p className="t-display mt-20 select-none text-center text-[21vw] leading-[0.78] text-bone/[0.06]" aria-hidden="true">
        Cowboy
      </p>
      <div className="mt-6 flex flex-col justify-between gap-3 border-t border-bone/10 pt-6 text-xs text-dust md:flex-row">
        <span>© {year} Cowboy Burger. All rights reserved.</span>
        <button onClick={() => scrollToTarget(0)} className="t-label text-left hover:text-bone">
          Back to the fire ↑
        </button>
      </div>
    </footer>
  );
}
