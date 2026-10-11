import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { brand, menu } from "../content/site";
import { MENU_STEP, menuItemScrollY } from "../lib/director";
import { scrollToTarget } from "../lib/scroll";
import { Arrow, Lines, Magnetic } from "../components/ui";
import { cn } from "../utils/cn";

function Heat({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={level ? `Heat level ${level} of 3` : "Mild"}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn("h-1.5 w-4 -skew-x-12 transition-colors duration-500", i <= level ? "bg-ember" : "bg-bone/15")} />
      ))}
    </span>
  );
}

/**
 * The lineup is a turntable, not a grid: the one 3D burger physically
 * rebuilds itself into each product as you scroll (or pick a tab).
 */
export default function Menu({ ready }: { ready: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const st = ScrollTrigger.create({
      trigger: "#menu",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        const i = Math.min(menu.length - 1, Math.max(0, Math.floor(self.progress / MENU_STEP)));
        setActive((p) => (p === i ? p : i));
      },
    });
    return () => st.kill();
  }, [ready]);

  const goTo = (i: number) => {
    const y = menuItemScrollY(i);
    if (y !== null) scrollToTarget(y);
  };

  const item = menu[active];

  return (
    <section id="menu" data-chapter="menu" className="relative z-10 h-[400vh]" aria-labelledby="menu-title">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-5 pb-6 pt-24 md:px-10 md:pb-10 md:pt-32">
        <div data-reveal className="flex items-end justify-between">
          <div>
            <p className="t-label mb-3 text-ember">
              <Lines lines={["(05) — The Lineup"]} />
            </p>
            <h2 id="menu-title" className="t-serif text-3xl text-bone md:text-5xl">
              <Lines lines={["Pick your outlaw."]} />
            </h2>
          </div>
          <p data-fade className="t-display hidden text-6xl text-bone/90 tabular-nums md:block">
            {String(active + 1).padStart(2, "0")}
            <span className="text-dust/40">/{String(menu.length).padStart(2, "0")}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <div className="bg-gradient-to-t from-night via-night/80 to-transparent pt-10 md:bg-none md:pt-0" aria-live="polite">
              <div className="relative h-[17vw] overflow-hidden md:h-[7.2vw]">
                {menu.map((m, i) => (
                  <h3
                    key={m.id}
                    className={cn(
                      "t-display absolute inset-x-0 bottom-0 whitespace-nowrap text-[16vw] text-bone transition-transform duration-[1000ms] ease-[var(--ease-out-expo)] md:text-[6.6vw]",
                      i === active ? "translate-y-0" : i < active ? "-translate-y-[110%]" : "translate-y-[110%]"
                    )}
                    aria-hidden={i !== active}
                  >
                    {m.name}
                  </h3>
                ))}
              </div>
              <div key={item.id} className="animate-[fadeUp_0.9s_var(--ease-out-expo)_both]">
                <div className="mt-3 flex items-center gap-4">
                  <span className="t-serif text-2xl text-brass">{item.subtitle}</span>
                  <span className="h-px flex-1 bg-bone/15" />
                  <Heat level={item.heat} />
                </div>
                <p className="mt-4 max-w-md text-base leading-relaxed text-dust">{item.description}</p>
                <ul className="mt-5 flex max-w-md flex-wrap gap-x-3 gap-y-1" aria-label="What's in it">
                  {item.build.map((b, i) => (
                    <li key={b} className="t-label text-bone/70">
                      {b}
                      {i < item.build.length - 1 && <span className="ml-3 text-ember">/</span>}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center gap-5">
                  <Magnetic>
                    <a href={brand.orderUrl} className="btn btn-primary" data-cursor="Order">
                      Order · {item.price} <Arrow />
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div role="tablist" aria-label="Choose a burger" className="mt-6 grid grid-cols-4 gap-2 md:gap-6">
          {menu.map((m, i) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={i === active}
              onClick={() => goTo(i)}
              className="group text-left"
              data-cursor="View"
            >
              <span className="relative block h-px overflow-hidden bg-bone/15">
                <span className={cn("absolute inset-0 origin-left bg-ember transition-transform duration-700", i === active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50")} />
              </span>
              <span className={cn("t-label mt-3 block truncate transition-colors", i === active ? "text-bone" : "text-dust/60 group-hover:text-bone")}>
                <span className="hidden md:inline">{String(i + 1).padStart(2, "0")} — </span>
                {m.name.replace("The ", "")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
