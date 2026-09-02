import { useState } from "react";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import type { StateCourtSystem } from "@/types";

interface CourtInfoPanelProps { courts: StateCourtSystem; stateName: string; }

// The court list is the one block of hand-written per-state venue content the
// geo pages carry, so it renders open on first paint for every renderer (a
// crawler, a static markup render, a visitor without JS) and the toggle is a
// progressive enhancement that only collapses it.
export default function CourtInfoPanel({ courts, stateName }: CourtInfoPanelProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="court-system-panel"
        className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-teal" />
          <h3 className="font-serif text-lg font-semibold text-navy">{stateName} Court System</h3>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
      </button>
      {expanded && (
        <div id="court-system-panel" className="px-6 pb-6 space-y-6 border-t border-neutral-100 pt-4">
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Highest Court</h4>
            <p className="text-sm text-neutral-600">{courts.supremeCourt}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Trial Courts</h4>
            <ul className="space-y-2">
              {courts.trialCourts.map((c) => (
                <li key={c.name}>
                  <span className="text-sm font-medium text-navy">{c.name}</span>
                  <span className="block text-xs text-neutral-500">{c.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Federal Districts</h4>
            <ul className="space-y-1">
              {courts.federalDistricts.map((d) => (
                <li key={d.abbreviation} className="text-sm text-neutral-600">{d.name} <span className="font-mono text-neutral-500">({d.abbreviation})</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
