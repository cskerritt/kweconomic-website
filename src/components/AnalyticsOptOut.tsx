import { useSyncExternalStore } from "react";
import { hasPrivacySignal, isAnalyticsOptedOut, setAnalyticsOptOut } from "@/lib/analytics";

// Browser state (the stored opt-out, a GPC / DNT signal) is read through
// useSyncExternalStore: the server snapshot is "not ready", so the prerender and
// hydration print a static fallback and nothing touches localStorage off-DOM.
// `chosen` holds this visit's choice so the control still flips when storage is
// blocked and the preference cannot be written.
const listeners = new Set<() => void>();
let chosen: boolean | null = null;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}
/** "" before hydration; otherwise two flags: opted out, privacy signal. */
const getSnapshot = () => `${(chosen ?? isAnalyticsOptedOut()) ? "1" : "0"}${hasPrivacySignal() ? "1" : "0"}`;
const getServerSnapshot = () => "";

/**
 * The analytics opt-out control in the privacy policy's "Your Choices" section.
 * Privacy.tsx renders it only when the build has Google Analytics configured.
 */
export default function AnalyticsOptOut() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = snapshot !== "";
  const optedOut = snapshot[0] === "1";
  const signal = snapshot[1] === "1";

  function toggle() {
    chosen = !optedOut;
    setAnalyticsOptOut(chosen);
    for (const notify of listeners) notify();
  }

  const off = optedOut || signal;

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-navy" role="status" aria-live="polite">
        {!ready
          ? "Analytics preference for this browser"
          : off
            ? "Analytics is off for this browser"
            : "Analytics is on for this browser"}
      </p>
      {ready && signal ? (
        <p className="mt-2 text-sm text-neutral-700">
          Your browser is sending a Global Privacy Control or Do Not Track signal, so analytics is already off.
        </p>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          className="mt-3 bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {optedOut ? "Turn analytics back on" : "Turn analytics off for this browser"}
        </button>
      )}
    </div>
  );
}
