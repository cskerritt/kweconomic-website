/**
 * Ref callback for every <form> in the app. The prerendered pages ship real
 * forms before their lazy route chunk has hydrated; index.html's inline script
 * cancels any submit on a form without this attribute, so a visitor who
 * submits early never triggers a native GET that would put name, email and
 * message in the URL. The attribute is set at commit (never in render), so it
 * cannot cause a hydration mismatch.
 */
export const FORM_READY_ATTRIBUTE = "data-kw-ready";
export function markFormReady(el: HTMLFormElement | null) {
  el?.setAttribute(FORM_READY_ATTRIBUTE, "");
}
