import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { craftSteps } from "../content/site";
import { Lines } from "../components/ui";
import { cn } from "../utils/cn";
import fire from "../assets/craft-fire.jpg";
import sear from "../assets/craft-sear.jpg";
import melt from "../assets/craft-melt.jpg";
import stack from "../assets/hero-burger.jpg";

gsap.registerPlugin(ScrollTrigger);

const images: Record<string, string> = { fire, sear, melt, stack };
// Section fractions where each step begins — synced with the Director's assembly shots
const THRESHOLDS = [0, 0.18, 0.38, 0.56];
const END = 0.72;

export default function Craft({ ready }: { ready: boolean }) {
  const [step, setStep] = useState(0);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!ready) return;
    const st = ScrollTrigger.create({
      trigger: "#craft",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        const p = self.progress;
        let s = 0;
        THRESHOLDS.forEach((t, i) => p >= t - 0.02 && (s = i));
        setStep((prev) => (prev === s ? prev : s));
        bars.current.forEach((b, i) => {
          if (!b) return;
          const a = THRESHOLDS[i], z = THRESHOLDS[i + 1] ?? END;
          b.style.transform = `scaleX(${Math.min(1, Math.max(0, (p - a) / (z - a)))})`;
        });
      },
    });
    return () => st.kill();
  }, [ready]);

  return (
    <section id="craft" data-chapter="craft" className="relative z-10 h-[440vh]" aria-labelledby="craft-title">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pb-10 md:pt-32">
        <div data-reveal className="max-w-xl">
          <p className="t-label mb-4 text-ember">
            <Lines lines={["(04) — The Craft"]} />
          </p>
          <h2 id="craft-title" className="t-serif text-3xl text-bone md:text-5xl">
            <Lines lines={["Four moves.", <span className="text-dust">No shortcuts.</span>]} />
          </h2>
        </div>

        <div className="grid items-end gap-6 md:grid-cols-12">
          <div className="relative md:col-span-6 lg:col-span-5">
            {/* Step titles — crossfade through a mask */}
            <div className="relative h-[19vw] md:h-[11vw]" aria-live="polite">
              {craftSteps.map((s, i) => (
                <div
                  key={s.title}
                  className={cn(
                    "absolute inset-0 flex items-end overflow-hidden transition-all duration-[900ms] ease-[var(--ease-out-expo)]",
                    i === step ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                  aria-hidden={i !== step}
                >
                  <span
                    className={cn("t-display block text-[22vw] text-bone transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] md:text-[12vw]", i === step ? "translate-y-0" : i < step ? "-translate-y-full" : "translate-y-full")}
                  >
                    {s.title}
                    <span className="text-ember">.</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-5 min-h-[5.5rem] max-w-md">
              {craftSteps.map((s, i) => (
                <p
                  key={s.title}
                  className={cn("absolute inset-0 text-base leading-relaxed text-dust transition-all duration-700 md:text-lg", i === step ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")}
                  aria-hidden={i !== step}
                >
                  <span className="t-label mr-3 text-brass">{s.index}</span>
                  {s.body}
                </p>
              ))}
            </div>

            {/* Progress meter */}
            <div className="mt-8 grid max-w-md grid-cols-4 gap-2" aria-hidden="true">
              {craftSteps.map((s, i) => (
                <div key={s.title}>
                  <div className="relative h-px overflow-hidden bg-bone/15">
                    <span ref={(el) => void (bars.current[i] = el)} className="absolute inset-0 origin-left scale-x-0 bg-ember" />
                  </div>
                  <span className={cn("t-label mt-3 block transition-colors duration-500", i <= step ? "text-bone" : "text-dust/50")}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photographic proof — the real-world counterpart to the 3D shot */}
          <div className="relative hidden md:col-span-3 md:col-start-10 md:block lg:col-span-2 lg:col-start-11">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              {craftSteps.map((s, i) => (
                <img
                  key={s.title}
                  src={images[s.image]}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-[clip-path,transform] duration-[1200ms] ease-[var(--ease-cine)]",
                    i === step ? "scale-100 [clip-path:inset(0_0_0_0)]" : i < step ? "scale-110 [clip-path:inset(0_0_100%_0)]" : "scale-110 [clip-path:inset(100%_0_0_0)]"
                  )}
                />
              ))}
            </div>
            <p className="t-label mt-3 flex justify-between text-dust">
              <span>{craftSteps[step].index}</span>
              <span>{craftSteps[step].title}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
