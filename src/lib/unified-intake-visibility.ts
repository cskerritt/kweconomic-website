// Pure field-visibility helper for the unified intake form (spec 2026-07-16
// unified-intake-wpec-routing-design.md §3). Kept out of the component file
// (mirrors src/lib/intake-payloads.ts's own "pure logic extracted from the
// component so it stays unit-testable without rendering" precedent) since
// this codebase has no jsdom/React-Testing-Library environment
// (vitest.config.ts's environment is "node") - RetainerIntakeForm.tsx itself
// is exercised only by source-read guard tests (see
// src/components/RetainerIntakeForm.test.mjs), never rendered in a test.
import { routeForCaseType } from "../../lib/case-types.mjs";

export interface UnifiedFieldVisibility {
  /** "Retaining counsel represents" radio row. */
  showSide: boolean;
  /** "Work product(s) authorized" checkbox group. */
  showWorkProducts: boolean;
  /** The e-sign consent block AND the payment-method radio row (WPEC handles
   * its own engagement, so both are hidden together). */
  showEsignAndPayment: boolean;
  /** The "handled by our affiliate WPEC" notice paragraph. */
  showWpecNotice: boolean;
}

/**
 * Field visibility for the unified intake form, driven by the selected case
 * type's route (routeForCaseType). Only meaningful for the unified spec - the
 * other 4 existing intake specs compute their own visibility directly from
 * their fixed representsOptions/workProducts arrays (unchanged), never through
 * this helper.
 *
 * `wpecRoutingEnabled` MUST mirror the server's WPEC_ROUTING_ENABLED flag (the
 * caller passes the build-time VITE_WPEC_ROUTING_ENABLED). The WPEC affiliate
 * notice and its hiding of Work Products / e-sign / Payment must only appear
 * when the server will ACTUALLY route the case to WPEC. That routing is
 * off-by-default in prod; when it is off, an employment/discrimination case is
 * handled by the standard pipeline, so the form must NOT promise a WPEC referral
 * (a false promise) and must show the standard fields (otherwise it submits a
 * malformed standard case with no work products / side / e-sign). Defaults to
 * off so a build without the flag matches the off-by-default server behavior.
 */
export function unifiedFieldVisibility(caseType: string, wpecRoutingEnabled = false): UnifiedFieldVisibility {
  const route = routeForCaseType(caseType);
  const wpec = route === "wpec" && wpecRoutingEnabled;
  return {
    showSide: route === "standard" || (route === "wpec" && !wpecRoutingEnabled),
    showWorkProducts: !wpec,
    showEsignAndPayment: !wpec,
    showWpecNotice: wpec,
  };
}
