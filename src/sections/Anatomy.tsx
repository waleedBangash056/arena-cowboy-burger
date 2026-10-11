import { ingredients } from "../content/site";
import { Lines } from "../components/ui";
import { cn } from "../utils/cn";

const legend = ["Brioche crown", "Jalapeño", "Smoked bacon", "Aged cheddar", "Smash beef", "Red onion", "Tomato", "Lettuce", "Smoke sauce", "Brioche heel"];

export function Anatomy() {
  return (
    <section id="anatomy" data-chapter="anatomy" className="relative z-10 h-[170vh]" aria-labelledby="anatomy-title">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-5 pb-8 pt-28 md:px-10 md:pb-10">
        <div data-reveal className="mx-auto max-w-4xl text-center">
          <p className="t-label mb-5 text-ember">
            <Lines lines={["(03) — Anatomy"]} />
          </p>
          <h2 id="anatomy-title" className="t-display text-[14vw] text-bone md:text-[7vw]">
            <Lines lines={["Every layer"]} />
            <Lines lines={[<span className="t-serif normal-case text-brass">earns its place.</span>]} className="text-[0.82em]" />
          </h2>
        </div>
        <div data-reveal className="hidden justify-center md:flex">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Layers, top to bottom">
            {legend
              .filter((l) => !["Jalapeño", "Smoked bacon"].includes(l))
              .map((l, i) => (
                <li key={l} data-fade className="t-label flex items-center gap-6 text-dust">
                  {i > 0 && <span className="h-px w-4 bg-dust/40" aria-hidden="true" />}
                  {l}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Ingredients() {
  return (
    <>
      {ingredients.map((ing) => (
        <section
          key={ing.id}
          id={`ing-${ing.id}`}
          data-chapter="anatomy"
          className="relative z-10 h-[160vh]"
          aria-labelledby={`ing-${ing.id}-title`}
        >
          <div className={cn("sticky top-0 flex h-[100svh] items-end px-5 pb-12 md:items-center md:px-10 md:pb-0", ing.side === "right" && "md:justify-end")}>
            <div
              data-reveal
              className={cn(
                "relative w-full max-w-md bg-gradient-to-t from-night via-night/85 to-transparent pt-20 md:bg-none md:pt-0",
                ing.side === "right" && "md:text-right"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "t-display pointer-events-none absolute -top-4 text-[38vw] text-transparent opacity-40 md:-top-32 md:text-[15vw]",
                  ing.side === "right" ? "right-0" : "left-0"
                )}
                style={{ WebkitTextStroke: "1px rgb(242 232 216 / 0.35)" }}
              >
                {ing.index}
              </span>
              <p className="t-label relative mb-5 text-ember">
                <Lines lines={[`${ing.index} — ${ing.kicker}`]} />
              </p>
              <h3 id={`ing-${ing.id}-title`} className="t-display relative text-[16vw] text-bone md:text-[6vw]">
                <Lines lines={[ing.title]} />
                <Lines lines={[<span className="t-serif normal-case text-brass">{ing.accent}</span>]} className="text-[0.8em]" />
              </h3>
              <p data-fade className="relative mt-6 text-base leading-relaxed text-dust md:text-[17px]">
                {ing.body}
              </p>
              <div data-fade className={cn("relative mt-8 flex items-center gap-3", ing.side === "right" && "md:flex-row-reverse")} aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-ember shadow-[0_0_20px_4px_rgb(226_84_27/0.6)]" />
                <span className={cn("h-px w-40", ing.side === "right" ? "md:bg-gradient-to-l bg-gradient-to-r" : "bg-gradient-to-r", "from-ember to-transparent md:w-[18vw]")} />
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
