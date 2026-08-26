import { useState } from "react";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import type { StateCourtSystem } from "@/types";

interface CourtInfoPanelProps { courts: StateCourtSystem; stateName: string; }

export default function CourtInfoPanel({ courts, stateName }: CourtInfoPanelProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 transition-colors">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-teal" />
          <h3 className="font-serif text-lg font-semibold text-navy">{stateName} Court System</h3>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
      </button>
      {expanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-neutral-100 pt-4">
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
