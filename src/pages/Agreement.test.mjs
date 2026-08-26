// Guard test (source-read pattern precedent: src/components/RetainerIntakeForm.test.mjs,
// src/lib/agreementPayload-render.test.mjs). vitest runs environment: "node", so there
// is no DOM to click: the modal wiring is pinned at source level and its behavior is
// covered for real in src/lib/agreementPayload.test.ts (agreementModalRows) and
// src/components/ui/MissingInfoModal.test.mjs.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const agreementSrc = readFileSync(join(here, "Agreement.tsx"), "utf8");
const payloadSrc = readFileSync(join(here, "../lib/agreementPayload.ts"), "utf8");

describe("the /agreements form opens the fill-in-place missing-info modal", () => {
  it("sources its rows from the shared schema helper (via the payload module's adapter)", () => {
    // missingRequiredFields is called in agreementPayload.ts, beside the payload
    // it judges, so the composite form's caveats (label vocabularies, the joined
    // multi-select) are unit-testable instead of source-grepped.
    expect(payloadSrc).toMatch(
      /import\s*\{[^}]*missingRequiredFields[^}]*\}\s*from\s*"\.\.\/\.\.\/lib\/intake-schema\.mjs"/s,
    );
    expect(payloadSrc).toMatch(/export function agreementModalRows\(/);
    expect(agreementSrc).toMatch(/agreementModalRows\(/);
  });

  it("renders the shared MissingInfoModal wired to the submit-time mirror state", () => {
    expect(agreementSrc).toContain('from "@/components/ui/MissingInfoModal"');
    expect(agreementSrc).toMatch(/<MissingInfoModal/);
    expect(agreementSrc).toMatch(/open=\{modalOpen\}/);
    expect(agreementSrc).toMatch(/rows=\{modalRows\}/);
    expect(agreementSrc).toMatch(/values=\{modalValues\}/);
    expect(agreementSrc).toMatch(/onContinue=\{continueFromModal\}/);
  });

  it("the two legacy ad-hoc checks are gone (subsumed by the retainingSide/workProducts rows)", () => {
    expect(agreementSrc).not.toContain("Please select who the retaining counsel represents.");
    expect(agreementSrc).not.toContain("Please select at least one work product.");
  });

  it("keeps the native required attributes as the no-JS backstop", () => {
    // The modal gates the composite/group fields the browser cannot express; the
    // plain text fields stay gated by the browser, so nothing may opt out of it.
    expect(agreementSrc).not.toContain("noValidate");
    expect(agreementSrc).toMatch(/id="individual"[^>]*required/);
    expect(agreementSrc).toMatch(/id="sig"[^>]*required/);
  });

  it("writes a modal answer back into the real (uncontrolled) form control", () => {
    // Without the write-through, Continue would re-read a FormData that still has
    // the gap and the modal would reopen forever.
    expect(agreementSrc).toMatch(/AGREEMENT_KEY_TO_NAME\[key\]/);
    expect(agreementSrc).toMatch(/form\.elements\.namedItem\(/);
    expect(agreementSrc).toMatch(/\.checked =/);
    expect(agreementSrc).toMatch(/agreementControlValue\(/);
    // The one controlled control on the page takes its own setter.
    expect(agreementSrc).toMatch(/if \(key === "retainedExpert"\)/);
    expect(agreementSrc).toMatch(/const formRef = useRef<HTMLFormElement/);
    expect(agreementSrc).toMatch(/ref=\{formRef\}/);
  });

  it("Continue re-runs the submit path against a FRESH FormData", () => {
    expect(agreementSrc).toMatch(/const submitAgreement = useCallback\(/);
    expect(agreementSrc).toMatch(/new FormData\(form\)/);
    expect(agreementSrc).toMatch(/submitAgreement\(form\)/);
    // One in-flight submit at a time, whichever path started it.
    expect(agreementSrc).toMatch(/status === "sending"\) return;/);
  });

  it("the modal's identity-sensitive handlers are useCallback-wrapped", () => {
    // MissingInfoModal's keydown effect depends on onClose's identity; a fresh
    // inline lambda every render would tear down and re-add the listener.
    expect(agreementSrc).toMatch(/const closeModal = useCallback\(/);
    expect(agreementSrc).toMatch(/const continueFromModal = useCallback\(/);
    expect(agreementSrc).toMatch(/const handleModalChange = useCallback\(/);
    expect(agreementSrc).toMatch(/onClose=\{closeModal\}/);
    expect(agreementSrc).toMatch(/onChange=\{handleModalChange\}/);
  });

  it("keeps the red banner for server/network failures only", () => {
    expect(agreementSrc).toContain("Something went wrong submitting the form");
    expect(agreementSrc).toMatch(/setStatus\("error"\)/);
  });
});
