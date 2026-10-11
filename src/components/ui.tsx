import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cn } from "../utils/cn";

/** Lines that rise from a mask. Pass each visual line explicitly for typographic control. */
export function Lines({ lines, className }: { lines: ReactNode[]; className?: string }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className={cn("line-mask", className)}>
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}

/** Magnetic wrapper — pulls its child toward the cursor on fine pointers. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={cn("arrow h-3 w-4", className)} viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path d="M0 6h14M9 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Brand mark: a spur-rowel star inside a ring — western, but geometric and modern. */
export function Mark({ className }: { className?: string }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 4.2 : 10;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    return `${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon points={pts} fill="currentColor" />
      <circle cx="12" cy="12" r="2.2" fill="var(--color-night)" />
    </svg>
  );
}

/** Custom cursor (fine pointers only). Grows over interactive elements and shows contextual labels. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = dot.current!;
    el.style.display = "flex";
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const t = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-cursor]");
      const text = t?.dataset.cursor ?? "";
      label.current!.textContent = text;
      gsap.to(el, { scale: t ? (text ? 4.2 : 2.4) : 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
      el.dataset.active = t ? "1" : "0";
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      ref={dot}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-4 w-4 items-center justify-center rounded-full border border-bone/80 mix-blend-difference data-[active='1']:bg-bone"
      style={{ marginLeft: -8, marginTop: -8, transform: "none" }}
    >
      <span ref={label} className="t-label scale-[0.24] whitespace-nowrap text-night" />
    </div>
  );
}
