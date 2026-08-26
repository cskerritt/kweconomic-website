import { useState } from "react";

// Anti-spam honeypot: visually hidden, tabIndex -1. Humans never see or fill
// it; form-filling bots do. The value rides the JSON payload as company_website
// (the key is set by the form, not by this input's DOM name) and the server
// quarantines any submission where it is non-empty. The input is NOT
// display:none / type=hidden (some bots skip those) - it is offscreen so it
// stays in the DOM, but out of a sighted or keyboard user's way.
//
// The DOM name and label are deliberately meaningless (hp_x7q / "Leave blank"):
// on 2026-08-25 Edge's organization autofill - which ignores autocomplete="off"
// - matched name="company_website" + label "Company website" and filled a real
// attorney's firm name in, quarantining 4 genuine intake submissions. The server
// also treats an own-firm-name honeypot as a soft signal (lib/spam-heuristics).
export default function HoneypotField({ onChange }: { onChange: (v: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave blank
        <input
          type="text"
          name="hp_x7q"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            onChange(e.target.value);
          }}
        />
      </label>
    </div>
  );
}
