import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Declarative text choreography.
 *  [data-reveal]           container that triggers when it enters view
 *    .line-mask > span     lines rise out of a mask (editorial type reveal)
 *    [data-fade]           secondary copy fades up after the lines
 * One rule set for the whole site keeps motion language consistent.
 */
export function useReveals(enabled: boolean, reduced: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const lines = el.querySelectorAll<HTMLElement>(".line-mask > span");
        const fades = el.querySelectorAll<HTMLElement>("[data-fade]");
        if (reduced) {
          gsap.set([...lines, ...fades], { clearProps: "all", opacity: 1 });
          return;
        }
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "expo.out" },
        });
        if (lines.length) tl.fromTo(lines, { yPercent: 115, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.08 }, 0);
        if (fades.length) tl.fromTo(fades, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.07 }, lines.length ? 0.25 : 0);
        ScrollTrigger.create({
          trigger: el,
          start: el.dataset.reveal === "early" ? "top 95%" : "top 78%",
          end: "bottom top",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [enabled, reduced]);
}
