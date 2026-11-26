import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { loadStateCities } from "@/data/cities";
import { resolveLocation } from "@/lib/location-search";

/**
 * The /locations finder (Chris, 2026-11-25): one field that takes a ZIP code, a state, or a city and state, and opens
 * the city or state page that covers it (src/lib/location-search.ts). The map below it stays the other way in. A query
 * that cannot be placed leaves a short message in a live region, never an empty page. Nothing differs from the server
 * render until the visitor searches. It is a search landmark, not a form element: it collects and sends nothing, so it
 * stays out of the form rules (the pre-hydration submit guard, the privacy notice), and before hydration the button
 * simply does nothing.
 */
export default function LocationSearch() {
  const navigate = useNavigate();
  const inputId = useId();
  const hintId = useId();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Each search takes a ticket; a city list that loads after a newer search, or after the visitor has left the page,
  // never navigates.
  const ticket = useRef(0);
  // Set synchronously, so a second Enter before the re-render cannot start a second search.
  const inFlight = useRef(false);
  useEffect(() => {
    const mine = ticket;
    return () => {
      mine.current += 1;
    };
  }, []);

  async function find() {
    if (inFlight.current) return;
    // The field as the visitor sees it: text typed before hydration is in the DOM, not yet in state.
    const typed = inputRef.current?.value ?? query;
    if (typed !== query) setQuery(typed);
    const mine = ++ticket.current;
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await resolveLocation(typed, loadStateCities);
      // A newer search, or leaving the page, overrides this one.
      if (mine !== ticket.current) return;
      if ("message" in result) {
        setMessage(result.message);
      } else {
        setMessage("");
        navigate(result.path);
      }
    } finally {
      inFlight.current = false;
      if (mine === ticket.current) setBusy(false);
    }
  }

  return (
    <div role="search" aria-label="Find a location" className="mx-auto max-w-xl">
      <label htmlFor={inputId} className="block text-sm font-semibold text-navy mb-2">
        Search by ZIP code or city and state
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void find();
            }
          }}
          placeholder="07601 or Hackensack, NJ"
          autoComplete="postal-code"
          aria-describedby={hintId}
          className="kw-field min-h-11 w-full rounded-lg border border-neutral-500 bg-white px-3 text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-600 focus:border-navy"
        />
        <button
          type="button"
          onClick={() => void find()}
          disabled={busy}
          className="kw-press inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-amber-dark px-5 font-semibold text-white hover:bg-amber-darker active:bg-amber-darker disabled:opacity-70"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Find
        </button>
      </div>
      <p id={hintId} role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-neutral-600">
        {message}
      </p>
    </div>
  );
}
