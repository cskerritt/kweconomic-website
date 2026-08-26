import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Gift, ShieldCheck } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_URL } from "@/lib/schema";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import {
  RAFFLE_PRIZE,
  RAFFLE_RULES,
  buildRafflePayload,
  normalizeEventSlug,
  validateRaffleFields,
  type RaffleFieldErrors,
  type RaffleFields,
} from "../../lib/raffle.mjs";
import {
  BAR_ASSOCIATION_GROUPS,
  BAR_ASSOCIATION_OTHER,
  BAR_ASSOCIATION_OTHER_MAX_LENGTH,
} from "../../lib/bar-associations.mjs";

// Unlisted conference raffle page (kwvrs.com/raffle). noindex + link-only: not
// in the nav, not in the sitemap, not prerendered, and served with
// X-Robots-Tag: noindex (server.js CLIENT_ONLY_ROUTES). The printed QR code
// carries ?event=<slug>, which rides the entry into the ledger and into the
// Clio Grow lead's from_source; a bare /raffle is the "default" event.
const ENDPOINT = "/api/raffle";

const EMPTY_FIELDS: RaffleFields = {
  firstName: "",
  lastName: "",
  email: "",
  firm: "",
  barAssociation: "",
  barAssociationOther: "",
  phone: "",
};

// Focus order for a failed submit, matching the intake forms. The association is
// required, so it is jumped to before the two optional fields.
const FIELD_FOCUS_ORDER: (keyof RaffleFields)[] = [
  "firstName",
  "lastName",
  "email",
  "barAssociation",
  "barAssociationOther",
  "phone",
  "firm",
];

type Status = "form" | "submitting" | "entered" | "already";
type Notice = null | { kind: "verify" | "busy" };

export default function Raffle() {
  usePageMeta({
    title: `Enter to win a ${RAFFLE_PRIZE} | KWVRS`,
    description:
      "Enter the Kincaid Wolstein Vocational and Rehabilitation Services gift card raffle at this event.",
    canonical: `${ORG_URL}/raffle`,
    noindex: true,
  });

  const [searchParams] = useSearchParams();
  const event = normalizeEventSlug(searchParams.get("event"));

  const [fields, setFields] = useState<RaffleFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<RaffleFieldErrors>({});
  const [status, setStatus] = useState<Status>("form");
  const [notice, setNotice] = useState<Notice>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  const update = <K extends keyof RaffleFields>(key: K, value: RaffleFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateOnBlur = (key: keyof RaffleFields) => {
    const message = validateRaffleFields(fields)[key];
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  };

  const focusFirstError = (errs: RaffleFieldErrors) => {
    if (typeof document === "undefined") return;
    const first = FIELD_FOCUS_ORDER.find((k) => errs[k]);
    if (first) document.getElementById(`rf-${first}`)?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const fieldErrors = validateRaffleFields(fields);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }
    setErrors({});
    setNotice(null);
    setStatus("submitting");

    const payload = buildRafflePayload(fields, event);
    const requestBody = JSON.stringify({ ...payload, turnstileToken, company_website: companyWebsite });

    const attempt = async (): Promise<"ok" | "duplicate" | "verify" | "busy" | "fail"> => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: requestBody,
        });
        // Shared booth wifi puts every attendee behind one IP, so a 429 is a
        // "try again in a moment", not a rejection.
        if (res.status === 429) return "busy";
        // 400 is a Turnstile or validation rejection: it will not fix itself on
        // a blind retry.
        if (res.status === 400) return "verify";
        if (!res.ok) return "fail";
        const body = (await res.json().catch(() => ({}))) as { duplicate?: boolean };
        return body.duplicate ? "duplicate" : "ok";
      } catch {
        return "fail";
      }
    };

    let result = await attempt();
    if (result === "fail") {
      await new Promise((r) => setTimeout(r, 800));
      result = await attempt();
    }

    if (result === "ok") {
      setStatus("entered");
      return;
    }
    if (result === "duplicate") {
      setStatus("already");
      return;
    }
    setStatus("form");
    if (result === "verify") {
      setNotice({ kind: "verify" });
      setTurnstileToken(""); // force the widget to re-challenge
      return;
    }
    setNotice({ kind: "busy" });
  };

  const fieldError = (key: keyof RaffleFields) =>
    errors[key] ? (
      <p id={`rf-${key}-error`} className="mt-1 text-sm text-red-600">
        {errors[key]}
      </p>
    ) : null;

  const inputClass = (key: keyof RaffleFields) =>
    `w-full rounded-lg border px-3 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:border-teal ${
      errors[key] ? "border-red-400" : "border-neutral-300"
    }`;

  const servicesLine = (
    <p className="mt-4 text-sm text-neutral-600">
      Kincaid Wolstein Vocational and Rehabilitation Services provides{" "}
      independent vocational and life care planning analysis nationwide.{" "}
      <a href="/services" className="font-medium text-teal hover:underline">
        See what we do
      </a>
      .
    </p>
  );

  return (
    <article className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6 text-center">
        <Gift className="mx-auto mb-3 h-8 w-8 text-amber" aria-hidden="true" />
        <h1 className="mb-2 font-serif text-3xl text-navy sm:text-4xl">
          Enter to win a {RAFFLE_PRIZE}
        </h1>
        <p className="text-neutral-700">
          Add your details below to enter this event&apos;s drawing. It takes about fifteen seconds.
        </p>
      </header>

      {status === "entered" || status === "already" ? (
        <section
          role="status"
          className="rounded-xl border-2 border-teal bg-teal/5 p-6 text-center shadow-sm"
        >
          <Check className="mx-auto mb-3 h-8 w-8 text-forest" aria-hidden="true" />
          <h2 className="font-serif text-2xl text-navy">
            {status === "already" ? "You are already entered" : "You are entered"}
          </h2>
          <p className="mt-2 text-neutral-700">
            {status === "already"
              ? "Our records already show an entry for this email at this event. One entry per person, so there is nothing more to do."
              : "The drawing takes place at the close of the event. If you win, we will email you."}
          </p>
          {servicesLine}
        </section>
      ) : (
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-1 flex items-center gap-2 font-serif text-xl text-navy">
            <ShieldCheck className="h-5 w-5 text-teal" aria-hidden="true" />
            Your entry
          </h2>
          <p className="mb-5 text-sm text-neutral-600">Fields marked * are required.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor="rf-firstName" className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">First name *</span>
                <input
                  id="rf-firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={fields.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  onBlur={() => validateOnBlur("firstName")}
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "rf-firstName-error" : undefined}
                  className={inputClass("firstName")}
                />
                {fieldError("firstName")}
              </label>

              <label htmlFor="rf-lastName" className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Last name *</span>
                <input
                  id="rf-lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={fields.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  onBlur={() => validateOnBlur("lastName")}
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "rf-lastName-error" : undefined}
                  className={inputClass("lastName")}
                />
                {fieldError("lastName")}
              </label>
            </div>

            <label htmlFor="rf-email" className="block">
              <span className="mb-1 block text-sm font-semibold text-navy">Email *</span>
              <input
                id="rf-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={fields.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => validateOnBlur("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "rf-email-error" : "rf-email-help"}
                className={inputClass("email")}
              />
              {errors.email ? (
                fieldError("email")
              ) : (
                <span id="rf-email-help" className="mt-1 block text-xs text-neutral-600">
                  We notify the winner by email, so please use one you check.
                </span>
              )}
            </label>

            <label htmlFor="rf-firm" className="block">
              <span className="mb-1 block text-sm font-semibold text-navy">
                Law firm or organization{" "}
                <span className="font-normal text-neutral-500">(optional)</span>
              </span>
              <input
                id="rf-firm"
                type="text"
                autoComplete="organization"
                value={fields.firm}
                onChange={(e) => update("firm", e.target.value)}
                className={inputClass("firm")}
              />
            </label>

            {/* Lead-source metric (spec 2026-07-29). Required, with the two
                escape options at the bottom of the roster so the requirement can
                never stop an entry. A native select with optgroups is what works
                on a phone at a booth - no search widget, no extra tap. */}
            <label htmlFor="rf-barAssociation" className="block">
              <span className="mb-1 block text-sm font-semibold text-navy">Bar association membership *</span>
              <select
                id="rf-barAssociation"
                required
                value={fields.barAssociation}
                onChange={(e) => {
                  update("barAssociation", e.target.value);
                  if (e.target.value !== BAR_ASSOCIATION_OTHER) update("barAssociationOther", "");
                }}
                onBlur={() => validateOnBlur("barAssociation")}
                aria-invalid={Boolean(errors.barAssociation)}
                aria-describedby={errors.barAssociation ? "rf-barAssociation-error" : "rf-barAssociation-help"}
                className={inputClass("barAssociation")}
              >
                <option value="">Select your association</option>
                {BAR_ASSOCIATION_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.barAssociation ? (
                fieldError("barAssociation")
              ) : (
                <span id="rf-barAssociation-help" className="mt-1 block text-xs text-neutral-600">
                  Recorded for referral reporting. The last two options cover anything not listed.
                </span>
              )}
            </label>

            {fields.barAssociation === BAR_ASSOCIATION_OTHER && (
              <label htmlFor="rf-barAssociationOther" className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">
                  Which association? <span className="font-normal text-neutral-500">(optional)</span>
                </span>
                <input
                  id="rf-barAssociationOther"
                  type="text"
                  maxLength={BAR_ASSOCIATION_OTHER_MAX_LENGTH}
                  value={fields.barAssociationOther}
                  onChange={(e) => update("barAssociationOther", e.target.value)}
                  aria-invalid={Boolean(errors.barAssociationOther)}
                  aria-describedby={errors.barAssociationOther ? "rf-barAssociationOther-error" : undefined}
                  className={inputClass("barAssociationOther")}
                />
                {fieldError("barAssociationOther")}
              </label>
            )}

            <label htmlFor="rf-phone" className="block">
              <span className="mb-1 block text-sm font-semibold text-navy">
                Mobile phone <span className="font-normal text-neutral-500">(optional)</span>
              </span>
              <input
                id="rf-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={fields.phone}
                onChange={(e) => update("phone", e.target.value)}
                onBlur={() => validateOnBlur("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "rf-phone-error" : undefined}
                className={inputClass("phone")}
              />
              {fieldError("phone")}
            </label>

            <Turnstile onToken={setTurnstileToken} />
            <HoneypotField onChange={setCompanyWebsite} />

            {notice?.kind === "verify" && (
              <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                <p>Please complete the check above, confirm your details, and submit again.</p>
              </div>
            )}

            {notice?.kind === "busy" && (
              <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">The connection at this venue is busy.</p>
                <p className="mt-1">Wait a moment and tap Enter the raffle again. Nothing was lost.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-lg bg-navy px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-teal disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            >
              {status === "submitting" ? "Entering..." : "Enter the raffle"}
            </button>
          </form>

          {servicesLine}
        </section>
      )}

      <section className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <h2 className="mb-2 font-serif text-lg text-navy">Official rules</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
          {RAFFLE_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-neutral-600">
          Questions about this drawing? Email{" "}
          <a href="mailto:info@kwvrs.com" className="font-medium text-teal hover:underline">
            info@kwvrs.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
