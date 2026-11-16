import { useState, type CSSProperties, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import { states } from "@/data/states";
import { US_STATE_SHAPES } from "@/data/us-state-shapes";

/**
 * The home page's "Nationwide coverage" map (Chris, 2026-10-16; redesigned 2026-10-17 so the states read
 * as states, each with its abbreviation). Each state and DC is one link to its /locations/{slug} hub: the
 * shape, tinted by its region and outlined in white, its abbreviation and, for the states too small to
 * label in place, a callout box joined by a leader line (lg and up) or a chip under the map, captioned
 * "Smaller states" (phones and tablets). The five territories have no shape, so they are chips with their
 * names under "US territories", below the legend, at every width.
 * Hover or keyboard focus lifts the state in amber on a top layer and names it in the caption under the
 * map (a caption, not a tooltip, so nothing covers a neighbour); a touch only follows the link, since a
 * hover effect there would cost iOS a second tap. The legend lights a region's states on hover, focus or
 * press. Nothing differs from the server render before the pointer or focus moves: no state is lifted and
 * no region lit. The list under the map keeps a plain link to every state, DC and territory hub there and
 * for keyboard, screen reader and crawler paths.
 */

// The frame of src/data/us-state-shapes.ts, widened for the callout column.
const VIEW = { x: -8, y: 10, w: 986, h: 598 };
const BOX = { w: 30, h: 17 };
// Top-left corner of each callout box (lg and up), frame units, north to south.
const CALLOUTS: Record<string, [number, number]> = {
  MA: [940, 150],
  RI: [940, 172],
  CT: [940, 194],
  NJ: [940, 228],
  DE: [940, 250],
  MD: [940, 272],
  DC: [940, 294],
};
// Below lg a label is 24 frame units, 18 from md (7 to 18 px, 320 to 1023 px wide); these outlines cannot hold
// one, so there their labels hide and they are chips under the map, north to south. The render test checks the
// list against the shapes.
const PHONE_CHIPS = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC", "WV", "HI"];

// The list's groups are the map's regions (src/data/states.ts; the labels match /locations). Tints (Chris,
// 2026-10-17: regions that read apart): the brand's navy and teal, a slate blue, a forest green a shade yellower
// than the brand's #1a6b4a (which sits too near the teal where Ohio meets Pennsylvania) and a plum for DC, never
// the amber of the lift. White text is 5.6:1 or more on each (AA is 4.5:1), and regions that share a border
// differ clearly in hue or lightness (the render test checks both against the shapes).
const GROUPS: { key: string; label: string; legend?: string; tint: string }[] = [
  { key: "northeast", label: "Northeast", tint: "#1d6b3f" },
  { key: "midwest", label: "Midwest", tint: "#0d7377" },
  { key: "southeast", label: "Southeast", tint: "#3a5a89" },
  { key: "west", label: "West", tint: "#1a2744" },
  // DC is the one place of this group the map draws; the territories' chips stay neutral, outside the legend.
  // A dark plum, darker than both neighbours (Maryland's green, Virginia's slate) as well as another hue, so DC stays
  // apart from the Southeast for red-green colour-blind eyes too.
  { key: "territory", label: "District of Columbia and territories", legend: "District of Columbia", tint: "#553555" },
];
const TINT: Record<string, string> = Object.fromEntries(GROUPS.map((g) => [g.key, g.tint]));
// A lit region's fill: a light blue, so lighting changes a region's lightness, not just its hue (3:1 or more
// against every tint). A lit link carries data-lit, which turns its text navy-dark (10.4:1).
export const LIT = "#abc7ef";

const COLOR_EASE = "transition-colors duration-200 motion-reduce:transition-none";
// A 44 px chip link; amber under the pointer, focus or a press, like a state on the map.
const CHIP = `inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm font-semibold shadow-sm ${COLOR_EASE} hover:bg-amber hover:text-navy-dark focus-visible:bg-amber focus-visible:text-navy-dark active:bg-amber active:text-navy-dark`;
// A label class list, hidden below lg for the chip states. Tailwind reads a class only where whitespace or
// a quote ends it, never one written against a ${...}, so the variable part always follows a space.
const phoneLabel = (classes: string, code: string) => (PHONE_CHIPS.includes(code) ? `${classes} max-lg:hidden` : classes);

const mapped = states.filter((s) => US_STATE_SHAPES[s.abbreviation]);
const territories = states.filter((s) => s.type === "territory");

/** The active state drawn again above every shape: amber, lifted (index.css .kw-map-lift), never a link. */
export function LiftedState({ code }: { code: string }) {
  const shape = US_STATE_SHAPES[code];
  return (
    <g aria-hidden="true" className="kw-map-lift pointer-events-none">
      <path d={shape.d} className="fill-amber stroke-white" vectorEffect="non-scaling-stroke" />
      {!CALLOUTS[code] && (
        <text x={shape.label[0]} y={shape.label[1]} textAnchor="middle" dominantBaseline="central" className={phoneLabel("fill-navy-dark", code)}>
          {code}
        </text>
      )}
    </g>
  );
}

export default function UsStateMap() {
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null); // region under the pointer or focus
  const [pressed, setPressed] = useState<string | null>(null); // region toggled on in the legend
  const lit = hovered ?? pressed;
  const activeState = mapped.find((s) => s.abbreviation === active);
  const fillOf = (region: string) => (region === lit ? LIT : TINT[region]);
  const track = (code: string) => ({
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType !== "touch") setActive(code);
    },
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive(code),
    onBlur: () => setActive(null),
  });

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <svg
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          // Every shape and label inherits the border and type: 24-unit labels below md, 18 to lg, 12 from lg.
          // The lift may grow past the frame, so nothing clips it.
          className="kw-map block h-auto w-full select-none overflow-visible font-semibold text-[24px] md:text-[18px] lg:text-[12px]"
          strokeWidth={1}
          strokeLinejoin="round"
          aria-label="Map of the United States. Select a state to open its page."
        >
          {mapped.map((s) => {
            const shape = US_STATE_SHAPES[s.abbreviation];
            const callout = CALLOUTS[s.abbreviation];
            const [x, y] = callout ? [callout[0] + BOX.w / 2, callout[1] + BOX.h / 2] : shape.label;
            return (
              <Link
                key={s.slug}
                to={`/locations/${s.slug}`}
                aria-label={`${s.abbreviation} ${s.name}`}
                data-lit={s.region === lit || undefined}
                className="group"
                {...track(s.abbreviation)}
              >
                <path
                  d={shape.d}
                  fill={fillOf(s.region)}
                  className={`stroke-white ${COLOR_EASE} group-hover:fill-amber group-focus-visible:fill-amber group-active:fill-amber`}
                  vectorEffect="non-scaling-stroke"
                />
                {callout && (
                  <rect
                    x={callout[0]}
                    y={callout[1]}
                    width={BOX.w}
                    height={BOX.h}
                    rx={3}
                    fill={fillOf(s.region)}
                    className={`${COLOR_EASE} group-hover:fill-amber group-focus-visible:fill-amber group-active:fill-amber max-lg:hidden`}
                  />
                )}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={phoneLabel(
                    `fill-white group-data-lit:fill-navy-dark ${COLOR_EASE} group-hover:fill-navy-dark group-focus-visible:fill-navy-dark group-active:fill-navy-dark`,
                    s.abbreviation,
                  )}
                >
                  {s.abbreviation}
                </text>
              </Link>
            );
          })}
          {/* Leader lines on top of every shape, so no later state hides one. */}
          <g aria-hidden="true" className="stroke-neutral-500 pointer-events-none max-lg:hidden" strokeWidth={1.5}>
            {Object.entries(CALLOUTS).map(([code, [bx, by]]) => {
              const [lx, ly] = US_STATE_SHAPES[code].label;
              return <line key={code} x1={lx} y1={ly} x2={bx} y2={by + BOX.h / 2} vectorEffect="non-scaling-stroke" />;
            })}
          </g>
          {active && <LiftedState code={active} />}
        </svg>
        <p id="map-smaller-states" className="mt-3 text-center text-xs text-neutral-600 lg:hidden">
          Smaller states
        </p>
        <ul aria-labelledby="map-smaller-states" className="mt-1.5 flex flex-wrap justify-center gap-2 lg:hidden">
          {PHONE_CHIPS.map((code) => {
            const s = mapped.find((m) => m.abbreviation === code)!;
            return (
              <li key={code}>
                <Link
                  to={`/locations/${s.slug}`}
                  aria-label={`${code} ${s.name}`}
                  data-lit={s.region === lit || undefined}
                  style={{ "--tint": fillOf(s.region) } as CSSProperties}
                  className={`${CHIP} bg-(--tint) px-2 text-white data-lit:text-navy-dark`}
                  {...track(code)}
                >
                  {code}
                </Link>
              </li>
            );
          })}
        </ul>
        <p aria-hidden="true" className="mt-2 min-h-5 text-center text-sm font-semibold text-navy">
          {activeState?.name}
        </p>
        <div role="group" aria-label="Highlight a region on the map" className="mt-3 flex flex-wrap justify-center gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              aria-pressed={pressed === g.key}
              onClick={() => {
                setPressed(pressed === g.key ? null : g.key);
                setHovered(null);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== "touch") setHovered(g.key);
              }}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(g.key)}
              onBlur={() => setHovered(null)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:text-navy focus-visible:border-neutral-400 focus-visible:text-navy focus-visible:ring-2 focus-visible:ring-navy aria-pressed:border-navy aria-pressed:text-navy motion-reduce:transition-none"
            >
              <span aria-hidden="true" className={`h-3 w-3 rounded-[3px] ${COLOR_EASE}`} style={{ backgroundColor: fillOf(g.key) }} />
              {g.legend ?? g.label}
            </button>
          ))}
        </div>
        {/* Below the legend, the map's only key to its colours, so map and legend fit a laptop screen together. */}
        <p id="map-territories" className="mt-5 text-center text-xs text-neutral-600">
          US territories
        </p>
        <ul aria-labelledby="map-territories" className="mt-1.5 flex flex-wrap justify-center gap-2">
          {territories.map((s) => (
            <li key={s.slug}>
              {/* Named on the chip (AS or MP alone is not widely known), not in the name line above the legend. */}
              <Link
                to={`/locations/${s.slug}`}
                className={`${CHIP} border border-neutral-300 bg-white px-3 text-navy hover:border-amber focus-visible:border-amber active:border-amber`}
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <details className="mt-6 rounded-lg border border-neutral-200 bg-white">
        <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-navy hover:text-amber-dark focus-visible:text-amber-dark focus-visible:underline">
          Browse states, DC and territories as a list
        </summary>
        <div className="grid gap-6 px-5 pb-5 pt-1 sm:grid-cols-2 lg:grid-cols-5">
          {GROUPS.map((g) => (
            <div key={g.key}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-dark mb-2">{g.label}</h3>
              <ul className="space-y-1">
                {states
                  .filter((s) => s.region === g.key)
                  .map((s) => (
                    <li key={s.slug}>
                      <Link to={`/locations/${s.slug}`} className="text-sm text-neutral-700 hover:text-amber-dark focus-visible:text-amber-dark focus-visible:underline">
                        {s.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
