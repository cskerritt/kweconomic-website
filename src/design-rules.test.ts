// src/design-rules.test.ts
// The the reference site design-rule checks, ported so this site cannot drift from the the reference site design (rules and numbers from
// the reference site's src/design-rules.test.ts, spec the 2026-10-17 apple-refinement design spec; the
// "spec x.y" references below are that spec's). Not ported: rules about the reference site-only code (intake forms, Rush, Pay a
// bill, Staff Login, the the reference site-only pages) and the type-role checks of src/lib/typography.ts, which this site does not
// have. A rule the current code breaks stays whole; its single failing item is named in a "known exception 2026-11-16"
// entry or an it.todo, never by loosening the rule.
import { describe, expect, it } from "vitest";
import ts from "typescript";

// Vite uses src as these globs' common base; repo-root negative patterns can
// escape that base. Filter root-relative keys after collecting broadly.
const ALL_TSX_SOURCES = import.meta.glob("/src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const SOURCES = Object.fromEntries(Object.entries(ALL_TSX_SOURCES).filter(([path]) =>
  !/\.test\./.test(path) && path !== "/src/components/UsStateMap.tsx",
));

/** Every class set in a TSX source: each string literal's tokens, and each template literal's text outside ${}. */
function classSets(source: string): string[][] {
  const sets: string[][] = [];
  const add = (text: string) => {
    const tokens = text.split(/\s+/).filter(Boolean);
    if (tokens.length) sets.push(tokens);
  };
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) add(node.text);
    else if (ts.isTemplateExpression(node)) add([node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" "));
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile("source.tsx", source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX));
  return sets;
}

const DARK_SURFACES = ["bg-navy", "bg-navy-dark", "bg-teal", "bg-teal-dark", "from-navy"];
const NEVER_ON_DARK = ["text-teal", "text-teal-light", "text-navy", "text-neutral-500", "text-neutral-600", "text-amber"];

/** The PR1 color-rule breaks one class set holds (section 1 of the spec). */
function colorRuleBreaks(set: string[]): string[] {
  const has = (token: string) => set.includes(token);
  const out: string[] = [];
  if (has("bg-amber-dark") && has("hover:bg-amber-dark")) out.push("a primary that hovers to its own color (hover:bg-amber-darker)");
  if (has("hover:bg-amber") && has("text-white")) out.push("white text on a mid amber hover (hover:bg-amber-darker)");
  for (const surface of DARK_SURFACES) {
    for (const text of NEVER_ON_DARK) if (has(surface) && has(text)) out.push(`${text} on ${surface}`);
  }
  if (has("bg-teal") && has("text-white")) out.push("bg-teal button (use bg-amber-dark)");
  if (has("bg-navy") && has("text-neutral-400")) out.push("text-neutral-400 on bg-navy (navy-dark only)");
  if (has("bg-red-50") && has("text-red-600")) out.push("text-red-600 on bg-red-50 (red-700)");
  return out;
}
describe("classSets reads class strings the way the guard needs", () => {
  it("keeps a ternary's two branches apart and reads a template's own text as one more set", () => {
    const sets = classSets('const a = <b className={`px-4 py-2 ${on ? "bg-navy text-white" : "bg-white text-navy hover:bg-neutral-50"}`} />;');
    expect(sets).toEqual([["px-4", "py-2"], ["bg-navy", "text-white"], ["bg-white", "text-navy", "hover:bg-neutral-50"]]);
  });

  it("reads JSX attributes, constants and plain strings, and never JSX text", () => {
    expect(classSets('const L = "kw-link"; const x = <p className="text-sm">bg-navy text-navy</p>;')).toEqual([["kw-link"], ["text-sm"]]);
  });

  it("compares whole tokens: a tint is never a dark surface", () => {
    expect(colorRuleBreaks(["bg-navy/5", "text-navy"])).toEqual([]);
    expect(colorRuleBreaks(["bg-teal/10", "text-teal"])).toEqual([]);
    expect(colorRuleBreaks(["bg-navy", "text-navy"])).toEqual(["text-navy on bg-navy"]);
  });

});

describe("the color rule holds on every element (spec section 1)", () => {
  it("reads every page and component", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(60);
    // The broad glob must collect a test fixture; only the explicit filter removes it, independently of Vite's
    // platform-specific glob handling.
    for (const path of ["/src/components/UsStateMap.render.test.tsx", "/src/components/CrossSell.render.test.tsx"]) {
      expect(ALL_TSX_SOURCES[path], path).toBeTypeOf("string");
      expect(SOURCES[path], path).toBeUndefined();
    }
    for (const path of [
      "/src/App.tsx",
      "/src/pages/Home.tsx",
      "/src/pages/ServiceState.tsx",
      "/src/pages/templates/CaseTypeState.tsx",
      "/src/components/layout/Header.tsx",
      "/src/lib/richtext.tsx",
    ]) expect(SOURCES[path], path).toBeTypeOf("string");
    expect(Object.keys(SOURCES).some((path) => /\.test\./.test(path))).toBe(false);
    expect(SOURCES["/src/components/UsStateMap.tsx"]).toBeUndefined();
  });

  it("no class set breaks the color rule", () => {
    const breaks = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).flatMap((set) => colorRuleBreaks(set).map((why) => `${path}: ${why}: "${set.join(" ")}"`)),
    );
    expect(breaks).toEqual([]);
  });
});

// The focus ring's rules (spec 2.1), read from src/index.css with its cascade layers taken out: what is left is
// unlayered, and an unlayered rule beats every outline-none utility and per-field ring, whatever their specificity.
const CSS = Object.values(import.meta.glob("/src/index.css", { query: "?raw", import: "default", eager: true }))[0] as string;

/** The stylesheet without its `@layer <name> { ... }` blocks. */
function unlayered(css: string): string {
  let out = "";
  let from = 0;
  for (const m of css.matchAll(/@layer\s+[\w-]+\s*\{/g)) {
    const at = m.index ?? 0;
    if (at < from) continue;
    out += css.slice(from, at);
    let depth = 0;
    let i = at + m[0].length - 1;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    from = i + 1;
  }
  return out + css.slice(from);
}

describe("the focus ring (spec 2.1)", () => {
  const ring = unlayered(CSS);

  it("is one 2px mid amber outline 2px out, unlayered, with no radius and no transition of its own", () => {
    expect(ring).toMatch(/(^|\n):focus-visible \{ outline: 2px solid var\(--color-amber\); outline-offset: 2px; \}/);
    const rule = ring.match(/(^|\n):focus-visible \{([^}]*)\}/)?.[2] ?? "";
    expect(rule).not.toContain("border-radius");
    expect(rule).not.toContain("transition");
  });

  it("is amber-light on a surface that holds the glow and mid amber in a white card there (spec 2.1 as amended), unlayered", () => {
    const glow = ":has(> .kw-aurora) :focus-visible { outline-color: var(--color-amber-light); }";
    const card = ":has(> .kw-aurora) :where(.bg-white) :focus-visible { outline-color: var(--color-amber); }";
    expect(ring).toContain(glow);
    expect(ring).toContain(card);
    // Both are (0,2,0), under the map's .kw-map a:focus-visible (0,2,1): the card's rule wins by coming second.
    expect(ring.indexOf(card)).toBeGreaterThan(ring.indexOf(glow));
  });

  it("draws inside a control that fills a clipping card (.kw-ring-inset), also unlayered", () => {
    expect(ring).toContain(".kw-ring-inset:focus-visible { outline-offset: -2px; }");
  });
});
describe("form fields stay at 16px, so iOS never zooms into one (spec 2.6; Review Focus 1)", () => {
  /** A class set that pairs kw-field with a smaller text size: the utility beats the component layer and shrinks it. */
  const shrinks = (set: string[]) => set.includes("kw-field") && set.some((t) => /(^|:)text-(xs|sm)$/.test(t));

  it("the check catches a kw-field beside text-sm, at any breakpoint", () => {
    expect(shrinks(["kw-field", "text-sm"])).toBe(true);
    expect(shrinks(["kw-field", "md:text-xs"])).toBe(true);
    expect(shrinks(["kw-field", "font-mono"])).toBe(false);
  });

  it("the field rule sets 16px text in the components layer, under the utilities", () => {
    expect(CSS).toMatch(/@layer components \{\s*\.kw-field \{[^}]*font-size: 1rem;/);
    expect(unlayered(CSS)).not.toContain(".kw-field");
  });

  it("a hovered field keeps the focus rule's specificity, so the navy focus border wins on it (PR1's follow-up)", () => {
    const hover = ".kw-field:hover:where(:not(:disabled)) { border-color: var(--color-neutral-600); }";
    const focus = ".kw-field:focus { border-color: var(--color-navy); }";
    expect(CSS).toContain(`@media (hover: hover) and (pointer: fine) { ${hover} }`);
    expect(CSS.indexOf(focus)).toBeGreaterThan(CSS.indexOf(hover));
  });

  it("every form this site has uses kw-field, and no class string shrinks it", () => {
    for (const path of FIELD_FORMS) {
      expect(classSets(SOURCES[path]).some((set) => set.includes("kw-field")), path).toBe(true);
    }
    const shrunk = Object.entries(SOURCES).flatMap(([path, source]) => classSets(source).filter(shrinks).map((set) => `${path}: "${set.join(" ")}"`));
    expect(shrunk).toEqual([]);
  });
});
// Anchors and scripted scrolls (spec 2.5, 2.10): html's scroll padding clears the header and the phone bar, and a scroll
// margin would add to it (an anchor would land 176px down); no script forces a smooth scroll, so the media-gated CSS
// decides and reduced motion holds; an in-app arrival on a fragment (the rush links' #contact-form, the quote buttons'
// #request-consultation; ScrollToTop, spec 5.10) is a page arrival, so it jumps.
describe("anchors and scripted scrolls follow the stylesheet (spec 2.5, 2.10)", () => {
  /** A scroll margin token at any breakpoint (scroll-m, scroll-mt, scroll-mx and the rest). */
  const margin = (t: string) => /(^|:)scroll-m[trblxyse]?-/.test(t);

  it("the check catches a scroll margin at any breakpoint", () => {
    expect(margin("lg:scroll-mt-24")).toBe(true);
  });

  it("no class set sets a scroll margin", () => {
    const margins = Object.entries(SOURCES).flatMap(([path, source]) => classSets(source).filter((set) => set.some(margin)).map((set) => `${path}: "${set.join(" ")}"`));
    expect(margins).toEqual([]);
  });


  it("no script forces a smooth scroll, and the in-app arrival jumps (behavior: instant)", () => {
    expect(Object.keys(SOURCES).filter((p) => /behavior:\s*["']smooth["']/.test(SOURCES[p]))).toEqual(SMOOTH_SCRIPTS);
    expect(SOURCES["/src/App.tsx"]).toContain('behavior: "instant"');
  });
});
// Keyboard feedback never animates (spec 3.1; PR1's follow-up 4). Tailwind 4's transition-colors and transition also
// fade outline-color, so a control that carries one faded its ring in from its text color; the three rest rules give
// every element its ring's color before it takes focus, in the order of the three color rules, so focus changes only
// the outline's style, width and offset, which no transition names. The skip link answers a key press: it moves at once.
describe("keyboard feedback never animates (spec 3.1)", () => {
  const ring = unlayered(CSS);

  it("every element carries its ring's color at rest, unlayered, in the order of the color rules", () => {
    const rest = [
      "* { outline-color: var(--color-amber); }",
      ":has(> .kw-aurora) * { outline-color: var(--color-amber-light); }",
      ":has(> .kw-aurora) :where(.bg-white) * { outline-color: var(--color-amber); }",
    ];
    for (const rule of rest) expect(ring, rule).toContain(rule);
    expect(ring.indexOf(rest[1])).toBeGreaterThan(ring.indexOf(rest[0]));
    expect(ring.indexOf(rest[2])).toBeGreaterThan(ring.indexOf(rest[1]));
  });

  it("the skip link appears at once: none of its rules sets a transition", () => {
    const rules = [...CSS.matchAll(/\.skip-link[^{]*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(rules.length).toBeGreaterThan(0);
    for (const body of rules) expect(body).not.toContain("transition");
  });
});

// Nothing follows the cursor (spec 3.2): the scroll progress bar, the 3D tilt with its cursor glow, the magnetic CTAs
// with their sheen, and the amber glow under five CTAs are gone. CODE is every non-test .ts and .tsx source but the home
// map's own file, so the deleted hooks and component cannot come back under another file.
const ALL_CODE_SOURCES = import.meta.glob(["/src/**/*.ts", "/src/**/*.tsx"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const CODE = Object.fromEntries(Object.entries(ALL_CODE_SOURCES).filter(([path]) =>
  !/\.test\.|\.d\.ts$/.test(path) && path !== "/src/components/UsStateMap.tsx",
));

describe("nothing follows the cursor (spec 3.2)", () => {
  it("the scroll progress bar, the tilt and the magnetic CTAs are gone from src and src/index.css", () => {
    expect(Object.keys(CODE).length).toBeGreaterThan(Object.keys(SOURCES).length);
    const left = Object.entries(CODE).flatMap(([path, source]) =>
      ["ScrollProgress", "useTilt", "useMagnetic", "use-pointer-fx"].filter((name) => source.includes(name)).map((name) => `${path}: ${name}`),
    );
    expect(left).toEqual([]);
    for (const name of ["kw-progress", "kw-tilt", "kw-magnetic", "kw-sheen"]) expect(CSS, name).not.toContain(name);
  });

  it("no CTA carries the amber glow", () => {
    const glows = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("shadow-amber/20")).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(glows).toEqual([]);
  });
});

// The hero glow holds still (spec 3.3): one amber orb at the top right, a radial gradient painted once (no filter,
// transform, animation or will-change), 0.15 at its center below 1024px, in the components layer; the blue orb and both
// loops are gone.
describe("the hero glow holds still (spec 3.3)", () => {
  const before = [...CSS.matchAll(/\.kw-aurora::before\s*\{([^}]*)\}/g)].map((m) => m[1]);

  it("one orb at the top right, 0.55 at its center and 0.15 below 1024px, in the components layer", () => {
    expect(before).toHaveLength(2);
    expect(before[0]).toContain("width: 60vw; height: 60vw; right: -12%; top: -34%;");
    expect(before[0]).toContain("background: radial-gradient(circle, rgb(212 146 46 / 0.55) 0%, transparent 70%);");
    expect(before[1]).toContain("background: radial-gradient(circle, rgb(212 146 46 / 0.15) 0%, transparent 70%);");
    expect(CSS).toMatch(/@media \(max-width: 1023px\) \{ \.kw-aurora::before \{/);
    expect(unlayered(CSS)).not.toContain(".kw-aurora::before");
    expect(CSS).not.toContain(".kw-aurora::after");
  });

  it("painted once: no filter, transform, animation or will-change on the orb, and no loop keyframes", () => {
    for (const body of before) expect(body).not.toMatch(/filter|transform|animation|will-change/);
    expect(CSS).not.toMatch(/kw-aurora-[ab]\b/);
  });
});
// Pages open complete on the first frame (spec 3.2): no page or hero entrance, no headline shimmer, no floating badge,
// and nothing loops; since PR3 the entrance names are gone too.
describe("pages open complete, and nothing loops (spec 3.2)", () => {
  it("src/index.css holds no entrance, shimmer, float or loop", () => {
    for (const name of ["kw-fade-up", "kw-fade-in", "kw-shimmer", "kw-float", "kw-gradient-text", "kw-page-enter", "kw-enter", ".js "]) {
      expect(CSS, name).not.toContain(name);
    }
    expect(CSS).not.toMatch(/\binfinite\b/);
  });


  it("no class set asks for the shimmer or the float", () => {
    const left = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("kw-gradient-text") || set.includes("kw-float")).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(left).toEqual([]);
  });
});

// One curve, three durations, and the kw-* rules in the components layer (spec 3.1, 3.4, 3.5, 3.8). Every transition
// and animation duration src/index.css gives outside the map's own rules (ground rule 2) is 150ms, 200ms or 400ms
// (a transition-delay is never read), nothing eases in, the overshoot curve is gone and --kw-ease keeps its value.
// Every kw-* rule but the focus ring's (spec 2.1), the map's and the reduced-motion override (unlayered beside the
// map's line) sits in @layer components, where a utility on the same element wins: so no element with kw-lift
// carries a transition, translate or scale utility, and no reveal wrapper carries a utility the layered reveal sets
// (the layer move's risk, spec 9).
/** Every duration a transition or animation declaration gives, in ms: the first time of each comma-separated item. */
function durations(css: string): number[] {
  const flat = (s: string) => {
    let out = "";
    let depth = 0;
    for (const ch of s) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (depth === 0) out += ch;
    }
    return out;
  };
  return [...css.matchAll(/(?:^|[\s;{])(?:transition|animation)(?:-duration)?\s*:\s*([^;{}]+)/g)].flatMap((m) =>
    flat(m[1])
      .split(",")
      .flatMap((item) => {
        const t = /(\d*\.?\d+)(ms|s)\b/.exec(item);
        return t ? [Math.round(Number(t[1]) * (t[2] === "s" ? 1000 : 1))] : [];
      }),
  );
}

describe("one curve, three durations, the kw-* rules in the components layer (spec 3.1, 3.4, 3.5, 3.8)", () => {
  const noComments = CSS.replace(/\/\*[\s\S]*?\*\//g, "");
  const notMap = noComments.replace(/[^{};]*kw-map[^{};]*\{[^{}]*\}/g, "");

  it("reads durations the way the rules write them, delays aside", () => {
    expect(durations("a { transition: opacity 400ms var(--kw-ease), transform 0.4s var(--kw-ease); transition-delay: 120ms; }")).toEqual([400, 400]);
    expect(durations("b { transition: none !important; animation: x 2s ease; }")).toEqual([2000]);
  });

  it("every duration outside the map's rules is 150ms, 200ms or 400ms; nothing eases in; --kw-ease keeps its value", () => {
    const found = durations(notMap);
    expect(found.length).toBeGreaterThan(5);
    expect(found.filter((ms) => ![150, 200, 400].includes(ms))).toEqual([]);
    expect(CSS).not.toMatch(/\bease-in\b/);
    expect(CSS).not.toContain("--kw-spring");
    expect(CSS).toContain("--kw-ease:   cubic-bezier(0.16, 1, 0.3, 1);");
  });

  it("the reveal rises 12px over 400ms with a stagger capped at 120ms, and the card lifts 2px and presses under any pointer (spec 4.9)", () => {
    expect(CSS).toMatch(/\.kw-reveal\.is-armed \{\s*opacity: 0;\s*transform: translateY\(12px\);\s*transition: opacity 400ms var\(--kw-ease\), transform 400ms var\(--kw-ease\);\s*transition-delay: min\(var\(--kw-reveal-delay, 0ms\), 120ms\);\s*\}/);
    expect(CSS).toContain(".kw-lift:hover { translate: 0 -2px; }");
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{ \.kw-lift:active \{ scale: 0\.99; \} \}/);
  });

  it("every kw-* rule sits in the components layer, but the focus ring's, the map's and the reduced-motion override", () => {
    const outside = unlayered(noComments);
    const head = outside.slice(0, outside.lastIndexOf("@media (prefers-reduced-motion: reduce) {"));
    const selectors = [...head.matchAll(/([^{};]+)\{[^{}]*\}/g)].map((m) => m[1].trim()).filter((s) => s.includes(".kw-"));
    const allowed = (s: string) => s.includes(":focus-visible") || s.startsWith(":has(> .kw-aurora)") || s.startsWith(".kw-map");
    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.filter((s) => !allowed(s))).toEqual([]);
  });

  it("no element with kw-lift carries a transition, translate or scale utility", () => {
    const clash = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source)
        .filter((set) => set.includes("kw-lift") && set.some((t) => /(^|:)(transition|-?translate|-?scale)(-|$)/.test(t)))
        .map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(clash).toEqual([]);
  });

  it("no reveal wrapper carries a utility the layered reveal sets", () => {
    const clash = Object.entries(SOURCES).flatMap(([path, source]) =>
      [...source.matchAll(/<Reveal\b[^>]*\bclassName="([^"]*)"/g)]
        .filter((m) => m[1].split(/\s+/).some((t) => /(^|:)(opacity|-?translate|-?scale|-?rotate|transform|filter|blur|transition)(-|$)/.test(t)))
        .map((m) => `${path}: "${m[1]}"`),
    );
    expect(clash).toEqual([]);
  });
});

// No transition: all (spec 3.6): every transition names its properties, so a gap or a layout never animates. It reads
// CODE, so a class constant in a .ts file (src/lib) counts too.
describe("no transition: all (spec 3.6)", () => {
  it("no class set and no rule transitions every property", () => {
    const all = Object.entries(CODE).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.some((t) => /(^|:)transition-all$/.test(t))).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(all).toEqual(TRANSITION_ALL);
    expect(CSS).not.toMatch(/transition:\s*all\b/);
  });
});

// Nothing translates or scales on hover for anyone who asks for reduced motion (spec 3.7): every hover or group-hover
// translate, scale or rotate is gated by motion-safe:, and so are the Loading pulse and the header chevron's turn; no
// utility runs longer than 400ms or eases in (spec 3.1). The home map's own file is skipped (ground rule 2).
/** A hover or group-hover token that moves (translate, scale, rotate) without motion-safe: in its variant chain. */
function ungated(token: string): boolean {
  const variants = token.split(":");
  const utility = variants.pop() ?? "";
  return variants.some((v) => v === "hover" || v.startsWith("group-hover")) && /^-?(translate|scale|rotate)(-|$)/.test(utility) && !variants.includes("motion-safe");
}

describe("nothing moves on hover under reduced motion (spec 3.7)", () => {
  it("the check reads variant chains", () => {
    expect(ungated("group-hover:translate-x-1")).toBe(true);
    expect(ungated("hover:-translate-y-0.5")).toBe(true);
    expect(ungated("group-hover:-rotate-3")).toBe(true);
    expect(ungated("motion-safe:group-hover:translate-x-1")).toBe(false);
    expect(ungated("group-hover:gap-2")).toBe(false);
    expect(ungated("rotate-180")).toBe(false);
  });

  it("no class set moves on hover without motion-safe:", () => {
    const moves = Object.entries(SOURCES).flatMap(([path, source]) => classSets(source).flatMap((set) => set.filter(ungated).map((t) => `${path}: ${t}`)));
    expect(moves).toEqual([]);
  });

  // Fixed 2026-11-16: Loading.tsx's pulse is motion-safe:animate-pulse, so it never loops under reduced motion.
  it("the Loading pulse runs only when motion is allowed (Loading.tsx: motion-safe:animate-pulse)", () => {
    const loading = classSets(SOURCES["/src/components/Loading.tsx"]).flat();
    expect(loading).toContain("motion-safe:animate-pulse");
    expect(loading).not.toContain("animate-pulse");
  });

  it("the header chevron's turn runs only when motion is allowed", () => {
    const header = classSets(SOURCES["/src/components/layout/Header.tsx"]).flat();
    expect(header).toContain("motion-safe:transition-transform");
    expect(header).not.toContain("transition-transform");
  });

  it("no utility runs longer than 400ms or eases in", () => {
    const slow = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).flatMap((set) =>
        set.filter((t) => Number(/(?:^|:)duration-(\d+)$/.exec(t)?.[1] ?? 0) > 400 || /(^|:)ease-in(-out)?$/.test(t)).map((t) => `${path}: ${t}`),
      ),
    );
    expect(slow).toEqual(SLOW_UTILITIES);
  });

  // A duration utility sets transition-duration under every motion setting. Beside a transition that only motion-safe:
  // names, transition-property falls back to all under reduced motion, so every change on the element eases over that
  // duration there (D3): the duration takes motion-safe: too (controller ruling R-T10c, the /resources/faq chevron).
  it("a duration beside a transition only motion-safe: names is motion-safe: too, so nothing eases under reduced motion", () => {
    /** A class set that times a transition (an unprefixed duration-*) whose property only motion-safe: names. */
    const timesGatedOnly = (set: string[]) =>
      set.some((t) => /^duration-/.test(t)) && set.some((t) => /^motion-safe:transition(-|$)/.test(t)) && !set.some((t) => /^transition(-|$)/.test(t));
    expect(timesGatedOnly(["w-5", "motion-safe:transition-transform", "duration-200"])).toBe(true);
    expect(timesGatedOnly(["w-5", "motion-safe:transition-transform", "motion-safe:duration-200"])).toBe(false);
    expect(timesGatedOnly(["transition-[filter]", "duration-200"])).toBe(false);
    const loose = Object.entries(SOURCES).flatMap(([path, source]) => classSets(source).filter(timesGatedOnly).map((set) => `${path}: "${set.join(" ")}"`));
    expect(loose).toEqual(DURATION_GATED);
  });
});

// PR2's inert names are gone (spec 3.2; PR2's follow-up): the entrance class names (kw-page-enter, kw-enter and
// kw-enter-1 to kw-enter-4), the reveal variants (kw-reveal--left, --right and --scale, the Reveal variant prop and its
// RevealVariant type) and src/lib/service-motion.ts, which only picked a variant, have had no rule since PR2.
describe("PR2's inert motion names are gone (spec 3.2)", () => {
  it("scans implementation sources without test fixtures, declarations or the map exception", () => {
    expect(ALL_CODE_SOURCES["/src/lib/analytics.test.ts"]).toBeTypeOf("string");
    expect(CODE["/src/lib/analytics.test.ts"]).toBeUndefined();
    expect(ALL_CODE_SOURCES["/src/components/UsStateMap.tsx"]).toBeTypeOf("string");
    for (const path of ["/src/App.tsx", "/src/pages/ServiceState.tsx", "/src/lib/analytics.ts", "/src/hooks/use-reveal.ts"]) {
      expect(CODE[path], path).toBeTypeOf("string");
    }
    expect(Object.keys(CODE).some((path) => /\.test\.|\.d\.ts$/.test(path))).toBe(false);
    expect(CODE["/src/components/UsStateMap.tsx"]).toBeUndefined();
  });

  it("no source names an entrance class, a reveal variant or the per-service motion module", () => {
    const left = [
      ...(Object.keys(CODE).includes("/src/lib/service-motion.ts") ? ["/src/lib/service-motion.ts: the module"] : []),
      ...Object.entries(CODE).flatMap(([path, source]) =>
        ["kw-page-enter", "kw-enter", "kw-reveal--", "RevealVariant", "serviceMotion", "service-motion", "variant={motion"]
          .filter((name) => source.includes(name))
          .map((name) => `${path}: ${name}`),
      ),
    ];
    expect(left).toEqual([]);
  });
});

// This site's own lists for the ported rules: its form files and the named exceptions. Each exception is exact (file and
// class), so it fails the day the source is fixed and the entry must then be removed.
const FIELD_FORMS = ["/src/pages/Contact.tsx", "/src/pages/ScheduleConsultation.tsx", "/src/components/WhitePaperGate.tsx"];
const DETAILS_AT = ["/src/components/FAQBlock.tsx", "/src/pages/Home.tsx"];
const NAMED_SHADOWS: Record<string, string[]> = {
  "/src/components/layout/Header.tsx": [
    "shadow-lg",
    "shadow-navy-dark/30"
  ],
  "/src/pages/Home.tsx": [
    "shadow-xl",
    "shadow-2xl"
  ],
  "/src/pages/ScheduleConsultation.tsx": [
    "shadow-xl"
  ],
  "/src/pages/ServicesHub.tsx": [
    "shadow-xl"
  ],
  "/src/pages/templates/ExpertProfile.tsx": [
    "shadow-2xl",
    "shadow-black/30"
  ],
  "/src/pages/ServiceState.tsx": [
    "shadow-lg",
    "shadow-amber/10"
  ],
  "/src/pages/ServiceStateCity.tsx": [
    "shadow-lg",
    "shadow-amber/10"
  ],
  "/src/pages/WhitePaper.tsx": [
    "shadow-lg",
    "shadow-amber/10"
  ]
};
// known exception 2026-11-16: the guide TOC's click handler forces scrollIntoView({ behavior: "smooth" }), which ignores prefers-reduced-motion (KnowledgeArticle.tsx, spec 2.10: no script forces a smooth scroll).
const SMOOTH_SCRIPTS: string[] = [];  // fixed 2026-11-16
// known exception 2026-11-16: transition-all remains where spec 3.6 wants every transition to name its properties.
const TRANSITION_ALL: string[] = [];
// known exception 2026-11-16: a duration over 400ms (spec 3.1: nothing runs longer than 400ms).
const SLOW_UTILITIES: string[] = [];
// known exception 2026-11-16: a 30px-or-larger JetBrains Mono figure without tracking-normal (spec 4.1).
const MONO_TRACKING: string[] = [];  // fixed 2026-11-16
// known exception 2026-11-16: inline uppercase recipes where spec 4.5 wants kw-eyebrow (over a heading) or kw-label (in a card, list or table).
const CAPITALS: string[] = [];
// known exception 2026-11-16: a dead Tailwind typography class (prose / prose-*) remains; the plugin is not used (spec 4.3).
const DEAD_PROSE: string[] = [];
// known exception 2026-11-16: a kw-lift on a button-sized link with rounded-lg corners (NextSteps) and one with no hover:shadow-raised (WhitePaperGate's hover:shadow-md); spec 4.9 wants a 12px card and the raised shadow.
const LIFT_EXCEPTIONS: string[] = [];
// known exception 2026-11-16: shadows no spec role names: the bare hover:shadow on the hub and template cards (spec 4.9: hover:shadow-raised on a kw-lift card), the white paper gate's, About's and Contact's photo shadows (spec 5.8 removed /contact's).
const SHADOWS: string[] = [];
// known exception 2026-11-16: plain rounded / rounded-md left on tags (spec 4.7: pills, rounded-full) and rows (spec 4.11: 6px rows only in a card or a dropdown panel).
const ROUNDED: string[] = [];
// The phone bar's edge-to-edge Get a Quote cell is the one amber primary that does not press (spec 4.8; same on the reference site).
const PRIMARY_EXCEPTIONS: string[] = [
  "/src/components/layout/Header.tsx: \"flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-amber-dark text-white hover:bg-amber-darker transition-colors\"",
];
// known exception 2026-11-16: SHORT_PRIMARIES
const SHORT_PRIMARIES: string[] = [];
// known exception 2026-11-16: a footer list link under 44px on a touch screen (pointer-coarse:py-2 where py-3 is the rule, spec 5.7).
const FOOTER_SHORT_LINKS: string[] = [];  // fixed 2026-11-16
// known exception 2026-11-16: Team's card photo names motion-safe:transition-transform but an unprefixed duration-200, so under reduced motion every change on it eases (spec 3.7, D3).
const DURATION_GATED: string[] = [];
// This site has no src/lib/typography.ts, so no constant resolves through a roles module.
const TYPE: Record<string, string> = {};

/**
 * Every JSX element of a TSX source whose tag matches, as [tag, classes, inside a details, the element]: a className
 * string, or a constant or template literal whose names resolve through the file's own constants, then the roles
 * module; anything else reads "?".
 */
function jsxClasses(source: string, tags: RegExp): [string, string[], boolean, ts.Node][] {
  const sf = ts.createSourceFile("source.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const consts = new Map<string, ts.Expression>();
  const collect = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) consts.set(node.name.text, node.initializer);
    ts.forEachChild(node, collect);
  };
  collect(sf);
  const text = (e: ts.Expression | undefined, depth = 0): string => {
    if (!e || depth > 5) return "?";
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    if (ts.isTemplateExpression(e)) return [e.head.text, ...e.templateSpans.map((s) => `${text(s.expression, depth + 1)}${s.literal.text}`)].join("");
    if (ts.isIdentifier(e)) return consts.has(e.text) ? text(consts.get(e.text), depth + 1) : (TYPE[e.text] ?? "?");
    return "?";
  };
  const out: [string, string[], boolean, ts.Node][] = [];
  const visit = (node: ts.Node, inDetails: boolean) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && tags.test(node.tagName.getText(sf))) {
      const attr = node.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText(sf) === "className");
      const init = attr && ts.isJsxAttribute(attr) ? attr.initializer : undefined;
      const cls = !init ? "" : ts.isStringLiteral(init) ? init.text : ts.isJsxExpression(init) ? text(init.expression) : "?";
      out.push([node.tagName.getText(sf), cls.split(/\s+/).filter(Boolean), inDetails, ts.isJsxOpeningElement(node) ? node.parent : node]);
    }
    const opens = ts.isJsxElement(node) && node.openingElement.tagName.getText(sf) === "details";
    ts.forEachChild(node, (child) => visit(child, inDetails || opens));
  };
  visit(sf, false);
  return out;
}

// Type and labels (spec 4.1, 4.4, 4.5), the parts that do not need src/lib/typography.ts (this site has none): @theme
// carries the body size and each heading size's leading and tracking; a figure at 30px or more in JetBrains Mono keeps a
// normal tracking; no test file feeds Tailwind; two label classes for every small capital (kw-eyebrow over a heading,
// kw-label in a table, a list or a card), in the components layer, with no size, weight, tracking or leading beside one
// (a utility beats the components layer); long-form text is 17/28 neutral-700 and headings balance in the base layer.
/** A type token: a family, a size, a weight, a leading or a tracking at any breakpoint, capitals, or a label class. */
const isType = (t: string) =>
  /^font-(serif|sans|mono)$/.test(t) ||
  /^(?:[\w-]+:)*text-(xs|sm|base|lg|xl|[2-9]xl|body|\[[^\]]+\])$/.test(t) ||
  /^(?:[\w-]+:)*font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(t) ||
  /^(?:[\w-]+:)*(leading|tracking)-/.test(t) ||
  ["uppercase", "kw-eyebrow", "kw-label"].includes(t);

describe("type tokens and labels (spec 4.1, 4.4, 4.5)", () => {
  it("@theme carries the body size and each heading size's leading and tracking (spec 4.1)", () => {
    const theme = CSS.slice(CSS.indexOf("@theme {"), CSS.indexOf("\n}", CSS.indexOf("@theme {")));
    for (const token of [
      "--text-body: 1.0625rem; --text-body--line-height: 1.75rem;",
      "--text-2xl--line-height: 1.25;",
      "--text-3xl--line-height: 1.2;  --text-3xl--letter-spacing: -0.005em;",
      "--text-4xl--line-height: 1.12; --text-4xl--letter-spacing: -0.01em;",
      "--text-5xl--line-height: 1.1;  --text-5xl--letter-spacing: -0.01em;",
      "--text-6xl--line-height: 1.05; --text-6xl--letter-spacing: -0.015em;",
    ]) {
      expect(theme, token).toContain(token);
    }
  });

  it("a JetBrains Mono figure at 30px or more keeps a normal tracking (spec 4.1)", () => {
    const big = (t: string) => /^(?:[\w-]+:)*text-[3-9]xl$/.test(t);
    const loose = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("font-mono") && set.some(big) && !set.includes("tracking-normal")).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(loose).toEqual(MONO_TRACKING);
  });

  it("Tailwind reads no test file, so the class strings the tests quote ship no CSS (PR1's follow-up)", () => {
    expect(CSS).toContain('@source not "../**/*.test.*";');
  });

  it("kw-eyebrow and kw-label are spec 4.5's rules, in the components layer", () => {
    expect(CSS).toContain(".kw-eyebrow { font: 600 0.75rem/1rem var(--font-sans); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; text-wrap: balance; }");
    expect(CSS).toContain(".kw-label { font: 600 0.75rem/1rem var(--font-sans); text-transform: uppercase; letter-spacing: 0.06em; }");
    expect(unlayered(CSS)).not.toMatch(/\.kw-(eyebrow|label)\b/);
  });

  it("no class string sets capitals but through a label class, and none sizes, weights or tracks a label", () => {
    const labelled = (set: string[]) => set.includes("kw-eyebrow") || set.includes("kw-label");
    const off = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source)
        .filter((set) => set.includes("uppercase") || (labelled(set) && set.some((t) => isType(t) && t !== "kw-eyebrow" && t !== "kw-label")))
        .map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(off).toEqual(CAPITALS);
  });

  it("an eyebrow carries no margin of its own but mb-0 in a row (its 0.75rem is the spacing)", () => {
    const off = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("kw-eyebrow") && set.some((t) => /^-?m[bty]?-/.test(t) && t !== "mb-0")).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(off).toEqual([]);
  });

  it("kw-prose has its type half, and headings balance, running text wraps pretty and unclassed text is neutral-900, in the layers (spec 4.3, 4.4)", () => {
    for (const rule of [
      ".kw-prose { font-size: var(--text-body); line-height: var(--text-body--line-height); color: var(--color-neutral-700); }",
      ".kw-prose > :is(p, ul, ol, blockquote) { max-width: 52ch; }",
      ".kw-prose h3 { font-family: var(--font-serif); font-size: 1.25rem; line-height: 1.3; font-weight: 600; color: var(--color-navy); margin-top: 1.75em; }",
      ".kw-prose h3 + * { margin-top: 0.5em; }",
      ".kw-prose strong { font-weight: 600; color: var(--color-neutral-900); }",
    ]) {
      expect(CSS, rule).toContain(rule);
    }
    expect(unlayered(CSS)).not.toContain(".kw-prose");
    expect(CSS).toMatch(/@layer base \{\s*h1, h2, h3, blockquote \{ text-wrap: balance; \}\s*p, li, figcaption \{ text-wrap: pretty; \}\s*body \{ color: var\(--color-neutral-900\); \}\s*\}/);
  });

  it("no dead typography class is left (prose prose-lg; spec 4.3)", () => {
    const dead = Object.entries(SOURCES).filter(([, source]) => classSets(source).some((set) => set.includes("prose") || set.some((t) => t.startsWith("prose-")))).map(([path]) => path);
    expect(dead).toEqual(DEAD_PROSE);
  });
});

// One way for a link to look (spec 2.8, 4.6): kw-link replaces the old house recipes; an in-text link is underlined at
// rest through kw-link. Nav, footer, list, breadcrumb and standalone arrow links keep their own look.
describe("one way for a link to look (spec 4.6)", () => {
  // known exception 2026-11-16: about 25 to 40 in-text links per site still wear the old house recipe (text-navy
  // underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark; lcp's richtext.tsx
  // wears text-teal underline decoration-teal/40) instead of kw-link. Rule kept whole, pending the source fix.
  it("no class string holds the old house recipe or richtext's, and richtext's links are kw-link", () => {
    const old = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("decoration-neutral-300") || set.includes("decoration-teal/40")).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(old).toEqual([]);
    expect(SOURCES["/src/lib/richtext.tsx"]).toContain('className="kw-link"');
  });

  // known exception 2026-11-16: the same old-recipe links, plus a few bare "underline" links (privacy notices, the white
  // paper gate, the FAQ page's white link on navy). Rule kept whole, pending the source fix.
  it("a link underlined at rest is a kw-link", () => {
    const underlined = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("underline") && !set.includes("kw-link")).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(underlined).toEqual([]);
  });
});

// One corner and one depth per role (spec 4.7, 4.9): 8px controls and icon tiles, 12px cards and popovers, 16px large
// panels, pills for tags, badges and chips, 6px rows nested in a card. A resting card is flat; an interactive card
// lifts (kw-lift) with the raised shadow and a neutral-300 border on hover; a popover floats.
describe("one corner and one depth per role (spec 4.7, 4.9)", () => {
  const theme = CSS.slice(CSS.indexOf("@theme {"), CSS.indexOf("\n}", CSS.indexOf("@theme {")));
  const shadowToken = (t: string) => /^(?:[\w-]+:)*shadow(-|$)/.test(t);

  it("@theme carries the raised and the floating shadow", () => {
    expect(theme).toContain("--shadow-raised: 0 2px 4px rgb(20 34 61 / 0.05), 0 12px 28px -10px rgb(20 34 61 / 0.18);");
    expect(theme).toContain("--shadow-floating: 0 4px 8px rgb(20 34 61 / 0.06), 0 16px 40px -8px rgb(20 34 61 / 0.22);");
  });

  it("every kw-lift is an interactive card: 12px corners (16px on a large panel), and the raised shadow on hover as its only shadow", () => {
    const off = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source)
        .filter((set) => set.includes("kw-lift"))
        .filter((set) => {
          const corner = !set.includes("border") || set.includes("rounded-xl") || set.includes("rounded-2xl");
          return !corner || set.filter(shadowToken).join(" ") !== "hover:shadow-raised";
        })
        .map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(off).toEqual(LIFT_EXCEPTIONS);
  });

  // known exception 2026-11-16: the reference site cards rest on border-neutral-200 and take hover:border-neutral-300; this site's
  // cards carry border-neutral-300 at rest and no hover border, so the border does not change on hover. The visible
  // border is the same neutral-300 under hover, so this may be an accepted variance; rule kept whole as ported.
  it("every kw-lift takes the neutral-300 border on hover (hover:border-neutral-300 over a neutral-200 rest border)", () => {
    const off = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source)
        .filter((set) => set.includes("kw-lift") && set.includes("border") && !set.includes("hover:border-neutral-300"))
        .map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(off).toEqual([]);
  });

  it("no class string casts a shadow but a lifted card's hover, a popover, and the named surfaces that are not cards", () => {
    // The named surfaces are the reference design's own: the hero's quote cards and photos, the profile's headshot, the hero icon
    // badges and the scrolled header's edge (spec 4.12); NAMED_SHADOWS lists the ones this site has.
    const off = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).flatMap((set) =>
        set.filter((t) => shadowToken(t) && t !== "hover:shadow-raised" && t !== "shadow-floating" && !(NAMED_SHADOWS[path] ?? []).includes(t)).map((t) => `${path}: ${t}`),
      ),
    );
    expect(off).toEqual(SHADOWS);
  });

  it("no plain rounded or rounded-md is left but the 6px rows in a card or a dropdown panel (tags and chips are pills)", () => {
    const rows = ["/src/components/layout/Header.tsx"];
    const bare = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("rounded") || (set.includes("rounded-md") && !rows.includes(path))).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(bare).toEqual(ROUNDED);
  });
});

// Buttons and the press (spec 4.8, 4.9, 7.3): kw-press dips a button or a chip to 0.97 and kw-lift a card to 0.99 under
// any pointer, only when motion is allowed; on a touch screen what cannot scale (a text link, a menu row, a summary, a
// phone-bar cell, and under reduced motion a button or a card) dims to 0.7 while held, never a home map control; iOS
// paints :active from the first tap through the head script's passive touchstart listener; the tap highlight stays
// off. Every amber primary presses and turns amber-darker while held (spec 1: hover and press), but the phone bar's
// edge-to-edge cell.
describe("buttons and the press (spec 4.8, 4.9, 7.3)", () => {
  const HTML = Object.values(import.meta.glob("/index.html", { query: "?raw", import: "default", eager: true }))[0] as string;

  it("kw-press and the card press sit in the components layer, only when motion is allowed", () => {
    expect(CSS).toContain(".kw-press { transition: scale 150ms var(--kw-ease), background-color 150ms ease, border-color 150ms ease, color 150ms ease; }");
    expect(CSS).toContain("@media (prefers-reduced-motion: no-preference) { .kw-press:active { scale: 0.97; } }");
    expect(CSS).toContain("@media (prefers-reduced-motion: no-preference) { .kw-lift:active { scale: 0.99; } }");
    expect(unlayered(CSS)).not.toMatch(/\.kw-press\b/);
  });

  it("on a touch screen what cannot scale dims while held, and so do a button and a card under reduced motion, never a home map control (spec 4.8, O1, 7.3)", () => {
    expect(CSS).toMatch(/@layer base \{\s*@media \(hover: none\) \{\s*:where\(a, button, summary\):not\(\.kw-press, \.kw-lift, svg a, \.kw-map-area \*\):active \{ opacity: 0\.7; \}\s*\}\s*\}/);
    expect(CSS).toMatch(/@layer base \{\s*@media \(hover: none\) and \(prefers-reduced-motion: reduce\) \{\s*:where\(\.kw-press, \.kw-lift\):not\(\.kw-map-area \*\):active \{ opacity: 0\.7; \}\s*\}\s*\}/);
  });

  it("iOS paints :active from the first tap, and the tap highlight stays off (spec 7.3)", () => {
    expect(HTML).toContain("document.addEventListener('touchstart',function(){},{passive:true})");
    expect(HTML).toContain("document.documentElement.classList.add('js')");
    expect(CSS).not.toContain("-webkit-tap-highlight-color");
  });

  it("every amber primary presses and darkens while held but the phone bar's cell (kw-press + active:bg-amber-darker), and no kw-press carries a transition or scale utility", () => {
    const bare = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("bg-amber-dark") && !(set.includes("kw-press") && set.includes("active:bg-amber-darker"))).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(bare).toEqual(PRIMARY_EXCEPTIONS);
    const clash = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source).filter((set) => set.includes("kw-press") && set.some((t) => /(^|:)(transition|-?scale)(-|$)/.test(t))).map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(clash).toEqual([]);
  });

  it("a primary button is 44px tall: every amber-dark primary that carries kw-press also carries min-h-11 or a 44px box", () => {
    const short = Object.entries(SOURCES).flatMap(([path, source]) =>
      classSets(source)
        .filter((set) => set.includes("bg-amber-dark") && set.includes("kw-press") && !set.some((t) => t === "min-h-11" || t === "size-11" || t === "h-11"))
        .map((set) => `${path}: "${set.join(" ")}"`),
    );
    expect(short).toEqual(SHORT_PRIMARIES);
  });
});

// One disclosure (spec 4.10): every FAQ is a native details and summary on kw-disclosure, so the keyboard, a screen
// reader and find-in-page work as they do today. The card has 12px corners and never clips (overflow-hidden would cut
// the ring); the whole row is the summary, its ring drawn inside.
describe("one disclosure (spec 4.10)", () => {
  it("kw-disclosure's rules sit in the components layer as spec 4.10 writes them", () => {
    const block = /@layer components \{\n {2}\.kw-disclosure > summary \{[\s\S]*?\n\}/.exec(CSS)?.[0] ?? "";
    for (const rule of [
      ".kw-disclosure > summary { list-style: none; cursor: pointer; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }",
      ".kw-disclosure > summary::-webkit-details-marker { display: none; }",
      "margin-top: 0.5rem; margin-top: calc(0.5lh - 0.25rem);",
      "transform: translateY(-2px) rotate(45deg); transition: transform 200ms var(--kw-ease);",
      ".kw-disclosure[open] > summary::after { transform: translateY(2px) rotate(225deg); }",
      "@supports (interpolate-size: allow-keywords) {\n    .kw-disclosure { interpolate-size: allow-keywords; }\n    .kw-disclosure::details-content { block-size: 0; overflow-y: clip; transition: block-size 200ms var(--kw-ease), content-visibility 200ms allow-discrete; }\n    .kw-disclosure[open]::details-content { block-size: auto; }",
      "@media (prefers-reduced-motion: reduce) {\n    .kw-disclosure > summary::after, .kw-disclosure::details-content { transition: none; }",
    ]) {
      expect(block, rule).toContain(rule);
    }
    expect(unlayered(CSS)).not.toContain(".kw-disclosure");
  });

  it("every details in the code is a kw-disclosure FAQ card (the whole row the summary, ring inside) or the phone menu's group, but the home map's own", () => {
    const CARD = "kw-disclosure rounded-xl border border-neutral-200 bg-white";
    const ROW = "kw-ring-inset rounded-[11px] px-4 py-4 font-semibold text-navy";
    const found = Object.entries(SOURCES).flatMap(([path, source]) => jsxClasses(source, /^(details|summary)$/).map(([tag, classes]) => `${path}: ${tag} "${classes.join(" ")}"`));
    const expected = [
      ...DETAILS_AT.flatMap((path) => [`${path}: details "${CARD}"`, `${path}: summary "${ROW}"`]),
      '/src/components/layout/MobileNav.tsx: details "kw-disclosure"',
      '/src/components/layout/MobileNav.tsx: summary "kw-ring-inset flex min-h-11 items-center -mx-3 px-3 rounded-lg text-base font-semibold text-white"',
    ].sort();
    expect(found.sort()).toEqual(expected);
  });
});

// Menus, the header and the phone bar (spec 4.11, 4.12): the dropdown panel floats on 12px corners and grows from its
// button's corner over 150ms, never from scale(0), and only fades under reduced motion; its rows sit 6px round inside
// it and hover to neutral-100 and navy; the nav links are as tall as the dropdown buttons. The header stays solid navy
// with its scroll-edge shadow, and nothing on it makes it the containing block of the fixed phone bar inside it (a
// transform, a filter, a backdrop filter, will-change). The phone bar has no upward shadow; Get a Quote stays solid
// amber-dark.
describe("menus, the header and the phone bar (spec 4.11, 4.12)", () => {
  const HEADER = SOURCES["/src/components/layout/Header.tsx"];

  it("kw-pop grows the panel from its button's corner in the components layer, and only fades under reduced motion", () => {
    expect(CSS).toContain(".kw-pop { transform-origin: top left; transition: opacity 150ms var(--kw-ease), transform 150ms var(--kw-ease); }");
    expect(CSS).toContain("@starting-style { .kw-pop { opacity: 0; transform: translateY(-4px) scale(0.98); } }");
    expect(CSS).toContain("@media (prefers-reduced-motion: reduce) { .kw-pop { transition-property: opacity; } }");
    expect(unlayered(CSS)).not.toContain(".kw-pop");
  });

  it("the panel floats on 12px corners with 6px rows, and the nav links are as tall as the dropdown buttons", () => {
    expect(HEADER).toContain('className="kw-pop absolute top-full left-0 mt-3 w-64 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-floating z-50"');
    expect(HEADER).toContain('className="block rounded-md px-3 py-2 pointer-coarse:py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-navy transition-colors"');
    expect(HEADER).toContain('className="text-sm hover:text-amber-light transition-colors flex items-center gap-1 py-4"');
    const links = classSets(HEADER).filter((set) => set.join(" ") === "text-sm hover:text-amber-light transition-colors py-4");
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it("the header keeps its solid navy and its scroll-edge shadow, and nothing on it would hold the fixed phone bar (D4)", () => {
    expect(HEADER).toContain('className={`sticky top-0 z-50 bg-navy text-white transition-shadow duration-300 ${');
    expect(HEADER).toContain('scrolled ? "shadow-lg shadow-navy-dark/30" : ""');
    const header = classSets(HEADER).filter((set) => set.includes("sticky") || set.includes("shadow-navy-dark/30")).flat();
    expect(header.filter((t) => /(^|:)(transform|-?translate|-?scale|-?rotate|filter|blur|backdrop|will-change)/.test(t))).toEqual([]);
    expect(HEADER).not.toContain("data-scrolled");
  });

  it("the phone bar has no upward shadow, its Call cell hovers to white/10 and Get a Quote stays solid amber-dark", () => {
    expect(HEADER).toContain('className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-2 border-t border-white/10 bg-navy text-white"');
    expect(HEADER).toContain('className="flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-white/10 transition-colors"');
    expect(HEADER).toContain('className="flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-amber-dark text-white hover:bg-amber-darker transition-colors"');
  });

  it("the call link and the menu toggle are 44x44 and press", () => {
    expect(HEADER.split('className="kw-press inline-flex size-11 items-center justify-center rounded-lg hover:bg-white/10"')).toHaveLength(3);
  });
});

// Page edges (spec 5.9, 7.3): a rubber-band overscroll shows navy at both ends and the page is white; below 1024px the
// footer, not the body, reserves the phone bar's 52px (the body's padding painted a white strip under the navy
// footer); the browser's own color is the live header's navy.
describe("page edges (spec 5.9, 7.3)", () => {
  const HTML = Object.values(import.meta.glob("/index.html", { query: "?raw", import: "default", eager: true }))[0] as string;
  const MANIFEST = JSON.parse(Object.values(import.meta.glob("/public/manifest.json", { query: "?raw", import: "default", eager: true }))[0] as string) as Record<string, unknown>;

  it("index.html's theme-color is #14223d", () => {
    expect(HTML).toContain('<meta name="theme-color" content="#14223d" />');
    expect(HTML).not.toContain("#1a2744");
  });

  it("the manifest's theme_color is #14223d and its background stays white", () => {
    expect(MANIFEST.theme_color).toBe("#14223d");
    expect(MANIFEST.background_color).toBe("#ffffff");
  });

  it("no body { padding-bottom in src/index.css: html is navy and body white in the base layer, and the footer keeps the bar's 52px", () => {
    expect(CSS).not.toMatch(/body\s*\{\s*padding-bottom/);
    expect(CSS).toMatch(/@layer base \{\s*html \{ background-color: var\(--color-navy\); \}\s*body \{ background-color: #fff; \}\s*\}/);
    expect(SOURCES["/src/components/layout/Footer.tsx"]).toContain('<footer className="bg-navy-dark text-white max-lg:pb-13">');
  });
});

// The phone menu (spec 5.3, 5.4): the menu enters as a kw-pop, from 8px up over 200ms, and only fades under reduced
// motion; every row is a 44px row of 16px text with its ring inside (the menu scrolls); Services and Resources are
// closed kw-disclosure groups (D5); a group's row centers its label, so its chevron takes no first-line margin; the
// space-y stacks are gone.
describe("the phone menu (spec 5.3, 5.4)", () => {
  const NAV = SOURCES["/src/components/layout/MobileNav.tsx"];

  it("the menu enters as a kw-pop, from 8px up over 200ms, in the components layer", () => {
    expect(NAV).toContain('className="kw-pop lg:hidden bg-navy-dark border-t border-white/10 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain"');
    expect(CSS).toContain("#mobile-nav.kw-pop { transform-origin: top center; transition-duration: 200ms; }");
    expect(CSS).toContain("@starting-style { #mobile-nav.kw-pop { transform: translateY(-8px); } }");
    expect(unlayered(CSS)).not.toContain("#mobile-nav");
  });

  it("44px rows of 16px text with the ring inside; the groups are closed disclosures, their chevrons centered on the row; no space-y stacks", () => {
    expect(NAV).toContain('const ROW = "kw-ring-inset flex min-h-11 items-center -mx-3 px-3 rounded-lg text-base";');
    expect(NAV).toContain('<details className="kw-disclosure">');
    expect(CSS).toContain("#mobile-nav .kw-disclosure > summary::after { margin-top: 0; }");
    expect(NAV).not.toMatch(/<details[^>]*\bopen\b/);
    expect(NAV).toContain("<summary className={`${ROW} font-semibold text-white`}>{label}</summary>");
    expect(NAV).not.toMatch(/space-y-/);
  });

  it("the phone number and the Schedule Consultation primary are 44px of 16px text on the primary's recipe", () => {
    expect(NAV).toContain('className="flex min-h-11 items-center gap-2 text-base text-neutral-300"');
    expect(NAV).toMatch(/className="kw-press rounded-lg min-h-11 bg-amber-dark text-white font-semibold hover:bg-amber-darker active:bg-amber-darker inline-flex items-center justify-center px-4 py-2 text-base text-center/);
  });
});

// The footer on phones (spec 5.7): the footer is two columns below 1024px with the company column across both, and on
// touch screens its list links and legal-row links are 44px targets (desktop does not change).
describe("the footer on phones (spec 5.7)", () => {
  const FOOTER = SOURCES["/src/components/layout/Footer.tsx"];

  it("the footer is two columns below 1024px, the company column across both", () => {
    expect(FOOTER).toMatch(/<div className="grid grid-cols-2 lg:grid-cols-\d gap-x-6 gap-y-10">/);
    expect(FOOTER).toMatch(/Column 1: Company Info \*\/\}\s*<div className="col-span-2 lg:col-span-1">/);
  });

  it("on touch screens every list link is a 44px target (pointer-coarse:py-3 around a 20px line), and the legal-row links are 44px too", () => {
    // Each footer list is `space-y-N pointer-coarse:space-y-0` so the 44px targets touch. A list link takes
    // pointer-coarse:py-3 (12 + 20 + 12); a legal-row link pointer-coarse:py-3.5 (14 + 16 + 14). The phone and email
    // rows in the brand column keep their own look, as on the reference site.
    const chunks = FOOTER.split(/<ul className="mt-4 space-y-\d pointer-coarse:space-y-0">/).slice(1).map((chunk) => chunk.slice(0, chunk.indexOf("</ul>")));
    expect(chunks.length).toBeGreaterThanOrEqual(4);
    const listLinks = chunks.flatMap((chunk) => [...chunk.matchAll(/<(?:Link|a)\b[\s\S]*?className="([^"]*)"/g)].map((m) => m[1]));
    expect(listLinks.length).toBeGreaterThanOrEqual(chunks.length);
    expect(listLinks.filter((c) => !/pointer-coarse:py-3\b/.test(c)), "list links below 44px on a touch screen").toEqual(FOOTER_SHORT_LINKS);
    const legal = [...FOOTER.matchAll(/className="([^"]*hover:text-neutral-300[^"]*)"/g)].map((m) => m[1]);
    expect(legal.length).toBeGreaterThanOrEqual(2);
    expect(legal.filter((c) => !/pointer-coarse:py-3\.5\b/.test(c))).toEqual([]);
  });
});

// The stylesheet's tokens and scroll rules (the color rule's palette, spec 1; anchors, spec 2.5, 2.10): the palette is
// the reference design's navy and amber, teal and forest are navy aliases so old class names keep working, the depth, body-size and
// ease tokens exist, html's scroll padding clears the 64px header and the 45px phone bar, and smooth scrolling is
// gated on motion being allowed and forced off under reduced motion.
describe("index.css tokens and scroll rules", () => {
  it("carries the palette: navy, the navy aliases, the amber ramp and the neutrals", () => {
    for (const token of [
      "--color-navy: #14223d;", "--color-navy-light: #2a3a5c;", "--color-navy-dark: #0c1729;",
      "--color-teal: #14223d;", "--color-teal-light: #2a3a5c;", "--color-teal-dark: #0c1729;", "--color-forest: #14223d;",
      "--color-amber: #b8731f;", "--color-amber-light: #d4922e;", "--color-amber-dark: #8a5612;", "--color-amber-darker: #734810;",
      "--color-neutral-50: #f9fafb;", "--color-neutral-300: #d1d5db;", "--color-neutral-400: #9ca3af;", "--color-neutral-500: #6b7280;",
      "--color-neutral-600: #4b5563;", "--color-neutral-700: #374151;", "--color-neutral-900: #111827;",
      "--font-serif:", "--font-sans:", "--font-mono:", "--shadow-raised:", "--shadow-floating:", "--text-body:",
    ]) expect(CSS, token).toContain(token);
  });

  it("html's scroll padding clears the header and the phone bar, in the base layer, and nothing sets a scroll margin", () => {
    expect(CSS).toMatch(/@layer base \{\s*html \{ scroll-padding-top: 5rem; \}\s*@media \(max-width: 1023px\) \{ html \{ scroll-padding-bottom: 3\.5rem; \} \}\s*\}/);
    expect(CSS).not.toMatch(/scroll-margin|scroll-m[trblxyse]?\s*:/);
  });

  it("smooth-scrolls only when motion is allowed, and reduced motion forces it off", () => {
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*html \{ scroll-behavior: smooth; \}\s*\}/);
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?html \{ scroll-behavior: auto; \}/);
  });

  it("kw-link is underlined at rest in navy and turns amber-dark on hover, only under a pointer that hovers (spec 4.6)", () => {
    expect(CSS).toMatch(/\.kw-link, \.kw-prose a \{\s*color: var\(--color-navy\);\s*text-decoration-line: underline;/);
    expect(CSS).toMatch(/@media \(hover: hover\) \{\s*\.kw-link:hover, \.kw-prose a:hover \{ color: var\(--color-amber-dark\);/);
  });
});
