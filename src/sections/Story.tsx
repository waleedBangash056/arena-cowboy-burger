import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story } from "../content/site";
import { Lines } from "../components/ui";
import storyImg from "../assets/story.jpg";

gsap.registerPlugin(ScrollTrigger);

/** Light editorial chapter — a deliberate change of pace between two dark acts. */
export default function Story({ ready, reduced }: { ready: boolean; reduced: boolean }) {
  const words = useRef<HTMLParagraphElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const w = words.current!.querySelectorAll("span");
      if (reduced) {
        gsap.set(w, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        w,
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: words.current, start: "top 80%", end: "bottom 45%", scrub: true } }
      );
      gsap.fromTo(
        frame.current,
        { clipPath: "inset(18% 12% 18% 12%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: frame.current, start: "top 95%", end: "center center", scrub: true } }
      );
      gsap.fromTo(img.current, { yPercent: -10, scale: 1.25 }, { yPercent: 10, scale: 1.05, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section id="story" data-chapter="story" className="relative z-10 bg-bone text-ink" aria-labelledby="story-title">
      <div className="px-5 pb-20 pt-32 md:px-10 md:pb-28 md:pt-44">
        <div className="grid gap-10 md:grid-cols-12">
          <div data-reveal className="md:col-span-3">
            <p className="t-label text-saddle">
              <Lines lines={["(06) — " + story.kicker]} />
            </p>
          </div>
          <h2 id="story-title" className="sr-only">
            {story.kicker}
          </h2>
          <p ref={words} className="t-serif text-[2.1rem] leading-[1.08] md:col-span-9 md:text-[4.4vw]">
            {story.statement.split(" ").map((w, i) => (
              <span key={i} className="inline-block pr-[0.25em]" style={{ opacity: reduced ? 1 : 0.14 }}>
                {w}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div ref={frame} className="relative h-[70vh] overflow-hidden md:h-[110vh]" style={{ clipPath: "inset(18% 12% 18% 12%)" }}>
        <img ref={img} src={storyImg} alt="A lone rider on horseback silhouetted on a desert ridge at dusk" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
        <p className="t-display absolute bottom-6 left-5 text-[14vw] leading-[0.8] text-bone md:bottom-10 md:left-10 md:text-[9vw]">
          Ride <span className="t-serif normal-case text-brass">hungry.</span>
        </p>
      </div>

      <div className="px-5 py-20 md:px-10 md:py-28">
        <ul className="grid gap-12 md:grid-cols-3 md:gap-10">
          {story.values.map((v, i) => (
            <li key={v.title} data-reveal className="border-t border-ink/20 pt-6">
              <span data-fade className="t-label block text-saddle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="t-display mt-6 text-5xl md:text-6xl">
                <Lines lines={[v.title]} />
              </h3>
              <p data-fade className="mt-4 max-w-xs text-base leading-relaxed text-ink/70">
                {v.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
