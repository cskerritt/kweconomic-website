import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import UsStateMap, { LIT, LiftedState } from "./UsStateMap";
import { states } from "@/data/states";
import { US_STATE_SHAPES } from "@/data/us-state-shapes";

// The home page coverage map (Chris, 2026-10-16; redesigned 2026-10-17).
const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(UsStateMap)));
const svg = html.slice(html.indexOf("<svg"), html.indexOf("</svg>"));
const [vx, vy, vw, vh] = svg.match(/viewBox="([^"]+)"/)![1].split(" ").map(Number);
const FRAME = { x0: vx, y0: vy, x1: vx + vw, y1: vy + vh };
const list = html.slice(html.indexOf("<details"));
const drawn = states.filter((s) => s.type !== "territory");
const raw = import.meta.glob(["/src/index.css", "/src/components/UsStateMap.tsx"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const css = raw["/src/index.css"];
const source = raw["/src/components/UsStateMap.tsx"];
const svgClass = svg.match(/<svg [^>]*>/)![0].match(/ class="([^"]*)"/)![1].split(" ");

const attr = (tag: string, name: string) => tag.match(new RegExp(` ${name}="([^"]*)"`))?.[1] ?? "";
/** The markup inside the map link to a state's hub. */
const linkBody = (slug: string) => svg.match(new RegExp(`<a [^>]*href="/locations/${slug}"[^>]*>(.*?)</a>`))![1];
/** The first `<tag ...>` in the markup of the map link to a state's hub. */
function inLink(slug: string, tag: "path" | "text") {
  return linkBody(slug).match(new RegExp(`<${tag} [^>]*>`))![0];
}
// The seven states drawn with a callout box (lg and up).
const boxed = drawn.filter((s) => linkBody(s.slug).includes("<rect "));
// The five region fills (Chris, 2026-10-17: regions that read apart at a glance), keyed by the region in
// src/data/states.ts: forest green, brand teal, slate blue, brand navy and a dark plum for DC.
const FILLS: Record<string, string> = { northeast: "#1d6b3f", midwest: "#0d7377", southeast: "#3a5a89", west: "#1a2744", territory: "#553555" };
// The region pairs that share a border on the map, in the site's grouping (the test below derives them from the
// shapes): Ohio and Pennsylvania; the Midwest with Kentucky, Tennessee, Arkansas and West Virginia; the Plains with
// the West; Maryland and Pennsylvania with Virginia and West Virginia; DC with Maryland and with Virginia; Texas with
// Arkansas and Louisiana. The Northeast never meets the West, nor DC the Midwest or the West.
const TOUCHING = ["midwest/northeast", "midwest/southeast", "midwest/west", "northeast/southeast", "northeast/territory", "southeast/territory", "southeast/west"];

/** The rings of a path written as "M x y l dx dy ... z" rings. */
function rings(d: string): number[][][] {
  const out: number[][][] = [];
  for (const [, mx, my, rel] of d.matchAll(/M(-?\d+) (-?\d+)l([^z]*)z/g)) {
    let x = Number(mx);
    let y = Number(my);
    const ring = [[x, y]];
    const n = rel.match(/-?\d+/g)!.map(Number);
    for (let i = 0; i < n.length; i += 2) {
      x += n[i];
      y += n[i + 1];
      ring.push([x, y]);
    }
    out.push(ring);
  }
  return out;
}

/** A shape's outline edges, each written "x,y x,y" with its ends in order, so neighbours sharing a border share keys. */
function edges(d: string) {
  const out = new Set<string>();
  for (const r of rings(d)) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [a, b] = [r[j].join(","), r[i].join(",")].sort();
      if (a !== b) out.add(`${a} ${b}`);
    }
  }
  return out;
}

/** Even-odd point in polygon. */
function inside([x, y]: number[], rs: number[][][]) {
  let c = false;
  for (const r of rs) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [ax, ay] = r[i];
      const [bx, by] = r[j];
      if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) c = !c;
    }
  }
  return c;
}

/** Distance from a point to the nearest edge. */
function clearance([x, y]: number[], rs: number[][][]) {
  let best = Infinity;
  for (const r of rs) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [ax, ay] = r[j];
      const [bx, by] = r[i];
      const [dx, dy] = [bx - ax, by - ay];
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
  }
  return best;
}

/** Does a w x h box centred on c sit inside the outline, `pad` units clear of every edge? */
function holds(c: number[], w: number, h: number, rs: number[][][], pad: number) {
  const outline: number[][] = [];
  for (let i = 0; i <= 64; i++) {
    const [x, y] = [c[0] - w / 2 + (i / 64) * w, c[1] - h / 2 + (i / 64) * h];
    outline.push([x, c[1] - h / 2], [x, c[1] + h / 2], [c[0] - w / 2, y], [c[0] + w / 2, y]);
  }
  const vertexInBox = rs.flat().some(([x, y]) => Math.abs(x - c[0]) < w / 2 + pad && Math.abs(y - c[1]) < h / 2 + pad);
  return !vertexInBox && outline.every((p) => inside(p, rs) && clearance(p, rs) >= pad);
}

// Inter 600 advance widths, thousandths of an em (measured in Chromium, 2026-10-17); kerning
// only narrows a pair, so a code's width here is never less than the drawn label's.
const ADVANCE: Record<string, number> = {
  A: 728, C: 737, D: 722, E: 605, F: 588, G: 749, H: 746, I: 277, J: 580, K: 703, L: 565, M: 922,
  N: 759, O: 769, P: 645, R: 652, S: 650, T: 660, U: 736, V: 728, W: 1020, X: 720, Y: 714, Z: 652,
};
const CAP_HEIGHT = 0.7275; // Inter, em

/** The linear-light sRGB channels of a #rrggbb colour. */
const linear = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));

/** WCAG 2 contrast ratio of two #rrggbb colours. */
function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = linear(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** OKLCH (Ottosson's OKLab, a perceptual space) of a #rrggbb colour: lightness 0 to 1, chroma, hue in degrees. */
function oklch(hex: string) {
  const [r, g, b] = linear(hex);
  const [l, m, s] = [
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
  ].map(Math.cbrt);
  const [A, B] = [1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  return { L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180) / Math.PI };
}

/** Do two colours differ clearly: hues 40 degrees or more apart (named hues sit about that far apart), both with
 * colour enough to show a hue, or lightness 0.1 or more apart? */
function distinct(x: string, y: string) {
  const [a, b] = [oklch(x), oklch(y)];
  const hueGap = Math.abs(((((a.H - b.H) % 360) + 540) % 360) - 180);
  return (hueGap >= 40 && Math.min(a.C, b.C) >= 0.04) || Math.abs(a.L - b.L) >= 0.1;
}
const theme = (name: string) => css.match(new RegExp(`--color-${name}: (#[0-9a-f]{6});`))![1];

describe("coverage map shapes (src/data/us-state-shapes.ts)", () => {
  it("has a shape for exactly the 50 states and DC", () => {
    expect(drawn).toHaveLength(51);
    expect(Object.keys(US_STATE_SHAPES).sort()).toEqual(drawn.map((s) => s.abbreviation).sort());
  });

  it("keeps every vertex and label inside the frame", () => {
    for (const [code, shape] of Object.entries(US_STATE_SHAPES)) {
      const pts = rings(shape.d).flat();
      expect(pts.length, code).toBeGreaterThan(3);
      for (const [x, y] of [...pts, shape.label]) {
        expect(x >= FRAME.x0 && x <= FRAME.x1 && y >= FRAME.y0 && y <= FRAME.y1, `${code} ${x},${y}`).toBe(true);
      }
    }
  });
});

describe("UsStateMap", () => {
  it("draws each state and DC as one link to its hub, named for screen readers", () => {
    for (const s of drawn) {
      const links = svg.match(new RegExp(`<a [^>]*href="/locations/${s.slug}"[^>]*>`, "g")) ?? [];
      expect(links, s.slug).toHaveLength(1);
      // The visible code first, then the name (WCAG 2.5.3, label in name).
      expect(links[0]).toContain(`aria-label="${s.abbreviation} ${s.name}"`);
    }
    expect(svg.match(/<a /g)).toHaveLength(51);
  });

  it("fills each region with its own colour: white labels at 4.5:1 or more on each, none near the lift's amber", () => {
    // Northeast, midwest, southeast, west and DC (region "territory"): one fill each, all different.
    for (const s of drawn) {
      expect(attr(inLink(s.slug, "path"), "fill"), s.slug).toBe(FILLS[s.region]);
      expect(attr(inLink(s.slug, "text"), "class"), s.slug).toContain("fill-white");
    }
    expect(Object.keys(FILLS).sort()).toEqual([...new Set(drawn.map((s) => s.region))].sort());
    expect(new Set(Object.values(FILLS)).size).toBe(5);
    for (const [region, fill] of Object.entries(FILLS)) {
      expect(contrast(fill, "#ffffff"), region).toBeGreaterThanOrEqual(4.5);
      // Amber is the hovered or focused state's alone, so the lift reads apart from every region.
      for (const amber of [theme("amber"), theme("amber-light")]) expect(distinct(fill, amber), `${region} and ${amber}`).toBe(true);
    }
  });

  it("gives regions that share a border fills that differ clearly in hue or lightness, DC's apart from both regions around it", () => {
    const outline = new Map(drawn.map((s) => [s, edges(US_STATE_SHAPES[s.abbreviation].d)]));
    const touching = new Set<string>();
    for (const [a, ea] of outline) {
      for (const [b, eb] of outline) if (a.region < b.region && [...eb].some((e) => ea.has(e))) touching.add(`${a.region}/${b.region}`);
    }
    expect([...touching].sort()).toEqual(TOUCHING);
    for (const pair of TOUCHING) {
      const [a, b] = pair.split("/");
      expect(distinct(FILLS[a], FILLS[b]), `${pair}: ${FILLS[a]} and ${FILLS[b]}`).toBe(true);
    }
    // The all-navy tints this replaced fail the rule, so it tells tones of one hue from regions that read apart.
    expect(distinct("#2e486e", "#3a5a89")).toBe(false);
  });

  it("lights a region in a light blue that differs from every fill in lightness, its labels, callout codes and chips in navy-dark", () => {
    expect(contrast(LIT, theme("navy-dark"))).toBeGreaterThanOrEqual(4.5);
    for (const [region, fill] of Object.entries(FILLS)) expect(contrast(LIT, fill), region).toBeGreaterThanOrEqual(3);
    // While its region is lit a link carries data-lit, which swaps the white text for navy-dark.
    for (const s of drawn) expect(attr(inLink(s.slug, "text"), "class"), s.slug).toContain("fill-white group-data-lit:fill-navy-dark");
    const chips = html.match(/>Smaller states<\/p><ul [^>]*>(.*?)<\/ul>/)![1].match(/<a [^>]*>/g)!;
    expect(chips).toHaveLength(11);
    for (const chip of chips) expect(attr(chip, "class")).toContain("text-white data-lit:text-navy-dark");
  });

  it("outlines every state with a crisp 1 px white border at any size and sets the map on a soft shadow", () => {
    const paths = svg.match(/<path [^>]*>/g)!;
    expect(paths).toHaveLength(51);
    for (const p of paths) {
      expect(p).toContain('vector-effect="non-scaling-stroke"');
      expect(p).not.toContain("stroke-width");
      expect(attr(p, "class")).toContain("stroke-white");
    }
    // The width every shape inherits.
    const svgTag = svg.match(/<svg [^>]*>/)![0];
    expect(svgTag).toContain('stroke-width="1"');
    expect(attr(svgTag, "class")).toContain("kw-map");
    expect(css).toMatch(/\.kw-map \{[^}]*filter: drop-shadow\(/);
  });

  it("gives the small eastern states and DC a callout box with a leader line, no two lines crossing", () => {
    expect(svg.match(/<rect /g)).toHaveLength(7);
    const lines = [...svg.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map((m) => m.slice(1).map(Number));
    expect(lines).toHaveLength(7);
    // Proper intersection of two segments (orientation test).
    const side = (ax: number, ay: number, bx: number, by: number, px: number, py: number) => Math.sign((bx - ax) * (py - ay) - (by - ay) * (px - ax));
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const [a, b, c, d] = lines[i];
        const [e, f, g, h] = lines[j];
        const crosses = side(a, b, c, d, e, f) * side(a, b, c, d, g, h) < 0 && side(e, f, g, h, a, b) * side(e, f, g, h, c, d) < 0;
        expect(crosses, `${lines[i]} x ${lines[j]}`).toBe(false);
      }
    }
    // A callout state's lifted copy draws no code, so the code in its box turns navy-dark on the amber itself.
    expect(boxed.map((s) => s.abbreviation).sort()).toEqual(["CT", "DC", "DE", "MA", "MD", "NJ", "RI"]);
    for (const s of boxed) {
      const cls = attr(inLink(s.slug, "text"), "class");
      for (const v of ["group-hover", "group-focus-visible", "group-active"]) expect(cls, s.slug).toContain(`${v}:fill-navy-dark`);
    }
  });

  it("below lg labels every state whose outline holds a 24-unit label and lists the rest as 44 px chips under the map; from lg the callouts take the chips' place", () => {
    const hidden = drawn.filter((s) => attr(inLink(s.slug, "text"), "class").split(" ").includes("max-lg:hidden")).map((s) => s.abbreviation);
    // Every label inherits the map's type: 24 units below md, 18 to lg, 12 from lg.
    const sizes = svgClass.join(" ").match(/(?:^| )text-\[(\d+)px\] md:text-\[(\d+)px\] lg:text-\[(\d+)px\](?= |$)/)!.slice(1).map(Number);
    expect(sizes).toEqual([24, 18, 12]);
    const [phone, tablet, desktop] = sizes;
    for (const s of drawn) expect(attr(inLink(s.slug, "text"), "class"), s.slug).not.toMatch(/text-\[/);
    /** Does the code, at this size, sit 1 unit clear inside its outline at its label point? */
    const fits = (code: string, size: number) => {
      const { label, d } = US_STATE_SHAPES[code];
      return holds(label, ((ADVANCE[code[0]] + ADVANCE[code[1]]) * size) / 1000, CAP_HEIGHT * size, rings(d), 1);
    };
    // Below lg, hidden exactly where the 24-unit label does not fit; every label shown also fits at the md size.
    for (const s of drawn) {
      expect(fits(s.abbreviation, phone), s.abbreviation).toBe(!hidden.includes(s.abbreviation));
      if (!hidden.includes(s.abbreviation)) expect(fits(s.abbreviation, tablet), `${s.abbreviation} at ${tablet}`).toBe(true);
    }
    expect(hidden.sort()).toEqual(["CT", "DC", "DE", "HI", "MA", "MD", "NH", "NJ", "RI", "VT", "WV"]);
    // From lg every code outside a callout box is drawn in place, and fits there.
    for (const s of drawn.filter((x) => !boxed.includes(x))) expect(fits(s.abbreviation, desktop), `${s.abbreviation} at ${desktop}`).toBe(true);
    // The callout boxes and their leader lines show from lg only, as the chips hide.
    for (const rect of svg.match(/<rect [^>]*>/g)!) expect(attr(rect, "class").split(" ")).toContain("max-lg:hidden");
    expect(attr(svg.match(/<g [^>]*>(?=<line )/)![0], "class").split(" ")).toContain("max-lg:hidden");

    // The chips: directly under the map, below lg only, under a visible caption that names their list, one link
    // per hidden label.
    const block = html.match(/<\/svg><p id="([\w-]+)" class="([^"]*)">Smaller states<\/p><ul aria-labelledby="\1" class="([^"]*)">(.*?)<\/ul>/)!;
    expect(block[2].split(" ")).toEqual(expect.arrayContaining(["text-xs", "text-neutral-600", "lg:hidden"]));
    expect(block[3].split(" ")).toContain("lg:hidden");
    expect(html.match(new RegExp(` id="${block[1]}"`, "g"))).toHaveLength(1);
    const chips = [...block[4].matchAll(/<a [^>]*>(\w\w)<\/a>/g)];
    expect(chips.map((c) => c[1]).sort()).toEqual(hidden.sort());
    for (const [tag, code] of chips) {
      const s = drawn.find((x) => x.abbreviation === code)!;
      expect(tag).toContain(`href="/locations/${s.slug}"`);
      expect(tag).toContain(`aria-label="${code} ${s.name}"`);
      expect(attr(tag, "class")).toContain("min-h-11");
      expect(attr(tag, "style")).toContain(`--tint:${attr(inLink(s.slug, "path"), "fill")}`);
    }
  });

  it("lists the five territories, which have no shape, as 44 px chip links with their names under their own caption at every width, below the legend", () => {
    const territories = states.filter((s) => s.type === "territory");
    expect(territories.map((s) => s.slug)).toEqual(["puerto-rico", "us-virgin-islands", "guam", "american-samoa", "northern-mariana-islands"]);
    // The legend, the map's only key to its colours, comes first, so map and legend fit a laptop screen together.
    const block = html.match(/<div role="group" aria-label="Highlight a region on the map"[^>]*>.*?<\/div><p id="([\w-]+)" class="([^"]*)">US territories<\/p><ul aria-labelledby="\1" class="([^"]*)">(.*?)<\/ul>/)!;
    expect(block[2].split(" ")).toEqual(expect.arrayContaining(["text-xs", "text-neutral-600"]));
    expect(html.match(new RegExp(` id="${block[1]}"`, "g"))).toHaveLength(1);
    // No breakpoint hides the caption, the list or a chip.
    expect(`${block[2]} ${block[3]} ${block[4]}`).not.toMatch(/(?:^|[\s":])hidden(?=[\s"]|$)/);
    const chips = [...block[4].matchAll(/<a ([^>]*)>([^<]+)<\/a>/g)];
    // Each chip shows the territory's name (AS or MP alone is not widely known), which is also its accessible name.
    expect(chips.map((c) => c[2])).toEqual(territories.map((s) => s.name));
    chips.forEach(([, attrs], i) => {
      const s = territories[i];
      // Each opens its hub, the route the list under the map links too.
      expect(attrs).toContain(`href="/locations/${s.slug}"`);
      expect(list).toContain(`href="/locations/${s.slug}"`);
      expect(attrs).not.toContain("aria-label");
      // Neutral, not a region colour: the legend lights the map's regions, and a territory is in none of them.
      const cls = attr(` ${attrs}`, "class").split(" ");
      expect(cls).toEqual(expect.arrayContaining(["min-h-11", "min-w-11", "bg-white", "text-navy", "hover:bg-amber", "focus-visible:bg-amber"]));
      expect(attrs).not.toMatch(/--tint|data-lit/);
    });
    // Named on the chip, so its pointer or focus leaves the name line above the legend to the map's states.
    const at = source.indexOf('<ul aria-labelledby="map-territories"');
    expect(at).toBeGreaterThan(0);
    expect(source.slice(at, source.indexOf("</ul>", at))).not.toContain("track(");
  });

  it("names the regions in a legend under the map, one 44 px toggle each, none pressed before a visitor acts", () => {
    // Directly under the name line, so it stays next to the map.
    const legend = html.match(/<p aria-hidden="true" class="[^"]*"><\/p><div role="group" aria-label="Highlight a region on the map"[^>]*>(.*?)<\/div>/)![1];
    const buttons = [...legend.matchAll(/<button ([^>]*)>(.*?)<\/button>/g)];
    // "Southeast", as /locations and llms.txt name it; DC keeps its own entry.
    expect(buttons.map((b) => b[2].replace(/<[^>]+>/g, ""))).toEqual(["Northeast", "Midwest", "Southeast", "West", "District of Columbia"]);
    const sample = ["new-york", "ohio", "georgia", "texas", "district-of-columbia"];
    buttons.forEach(([, attrs, body], i) => {
      expect(attrs).toContain('type="button"');
      expect(attrs).toContain('aria-pressed="false"');
      // The swatch is the region's map tint.
      expect(body).toContain(`background-color:${attr(inLink(sample[i], "path"), "fill")}`);
      // A 44 px tap target, the only way to light a region on a phone. Keyboard focus adds a navy ring, inside the
      // page-wide amber outline (2.6:1 on white, under the 3:1 of WCAG 1.4.11).
      expect(attr(` ${attrs}`, "class").split(" ")).toEqual(expect.arrayContaining(["min-h-11", "focus-visible:ring-2", "focus-visible:ring-navy"]));
    });
    expect(contrast(theme("navy"), "#ffffff")).toBeGreaterThanOrEqual(3);
  });

  it("marks map focus with the amber lift alone, and lets a touch only follow the link or toggle the legend", () => {
    // The page-wide outline would box a map link's whole bounding rectangle across its neighbours.
    expect(css).toMatch(/\.kw-map a:focus-visible \{ outline-color: transparent; \}/);
    // Every pointer-enter handler skips touch, or iOS would spend the first tap on the hover state.
    expect(source.match(/onPointerEnter/g)).toHaveLength(2);
    expect(source.match(/onPointerEnter[^}]*\bif \(e\.pointerType !== "touch"\)/g)).toHaveLength(2);
  });

  it("lifts the active state in amber on a top layer that assistive technology and the pointer skip, and holds still under reduced motion", () => {
    const lifted = renderToStaticMarkup(createElement("svg", null, createElement(LiftedState, { code: "TX" })));
    const g = lifted.match(/<g [^>]*>/)![0];
    expect(g).toContain('aria-hidden="true"');
    expect(attr(g, "class")).toContain("pointer-events-none");
    expect(attr(g, "class")).toContain("kw-map-lift");
    expect(lifted).toMatch(/<path [^>]*class="[^"]*fill-amber[^"]*"/);
    expect(lifted).toMatch(/<text [^>]*class="[^"]*fill-navy-dark[^"]*"[^>]*>TX<\/text>/);
    expect(contrast(theme("navy-dark"), theme("amber"))).toBeGreaterThanOrEqual(4.5);
    // A callout state's code stays in its box.
    expect(renderToStaticMarkup(createElement("svg", null, createElement(LiftedState, { code: "RI" })))).not.toContain("<text");
    // The svg does not clip the lift or its shadow where a state meets the frame (Alaska, Texas, Florida, Hawaii).
    expect(svgClass).toContain("overflow-visible");

    // The lift scales around the shape's own centre and eases in over 150 to 200 ms; reduced motion keeps none of it.
    const rule = css.match(/\.kw-map-lift \{([^}]*)\}/)![1];
    expect(rule).toContain("transform-box: fill-box");
    expect(rule).toMatch(/animation: kw-map-lift (0\.1[5-9]|0\.2)s/);
    const reduced = css.slice(css.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.kw-map-lift \{[^}]*animation: none;[^}]*transform: none;/);
    for (const p of svg.match(/<path [^>]*>/g)!) expect(attr(p, "class")).toContain("motion-reduce:transition-none");
  });

  it("lists every state, DC and territory hub as a plain link under the map, grouped under the legend's region names", () => {
    for (const s of states) expect(list, s.slug).toContain(`href="/locations/${s.slug}"`);
    expect([...list.matchAll(/<h3 [^>]*>([^<]*)<\/h3>/g)].map((m) => m[1])).toEqual(["Northeast", "Midwest", "Southeast", "West", "District of Columbia and territories"]);
  });

  it("renders the caption empty, nothing lifted and nothing pressed on the server, so hydration matches", () => {
    expect(html).toMatch(/<p aria-hidden="true" class="[^"]*"><\/p>/);
    expect(html).not.toContain("kw-map-lift");
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toContain(" data-lit=");
  });
});
