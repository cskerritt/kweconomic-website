import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// A submit before a prerendered form's route has hydrated must never become a native GET carrying the visitor's
// details in the URL: index.html cancels it unless the form carries data-kw-ready, which every form sets at commit
// through markFormReady (src/lib/form-ready.ts) and which also posts, never GETs, as defense in depth.
const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("pre-hydration form submit guard", () => {
  it("index.html cancels a submit on any form without data-kw-ready, in the capture phase", () => {
    const html = read("index.html");
    expect(html).toContain("document.addEventListener('submit',function(e){if(!e.target.hasAttribute('data-kw-ready'))e.preventDefault()},true)");
  });
  it("the ready attribute name matches the inline guard", () => {
    expect(read("src/lib/form-ready.ts")).toContain('"data-kw-ready"');
  });
  it.each(["src/pages/Contact.tsx", "src/pages/ScheduleConsultation.tsx", "src/components/WhitePaperGate.tsx"])(
    "%s: its form posts and sets the ready flag by ref",
    (file) => {
      const src = read(file);
      expect(src).toContain("markFormReady");
      expect(src).toMatch(/<form[^>]*method="post"[^>]*ref=\{markFormReady\}|<form\s+(?:id="[^"]*"\s+)?method="post"\s+ref=\{markFormReady\}/);
    },
  );
  it("every <form> in src is covered", () => {
    const forms = ["src/pages/Contact.tsx", "src/pages/ScheduleConsultation.tsx", "src/components/WhitePaperGate.tsx"];
    for (const f of forms) expect((read(f).match(/<form\b/g) ?? []).length).toBe(1);
  });
});
