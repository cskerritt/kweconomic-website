import { useState } from "react";
import { Check, Copy, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_URL } from "@/lib/schema";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import {
  buildPaymentIntentPayload,
  formatUsd,
  validatePaymentIntentFields,
  zelleMemo,
  type PaymentIntentFieldErrors,
  type PaymentIntentFields,
} from "@/lib/paymentIntent";

// Unlisted payment page (kwvrs.com/payment). noindex + link-only: not in the
// nav, not in the sitemap, and served with X-Robots-Tag: noindex (server
// CLIENT_ONLY_ROUTES). The QR code and the button both resolve to the SAME
// Zelle payment link (the QR below was regenerated from the bank-issued QR and
// verified to decode to the identical URL).
export const ZELLE_PAYMENT_URL =
  "https://enroll.zellepay.com/qr-codes/?data=eyJuYW1lIjoiS0lOQ0FJRCBXT0xTVEVJTiBWT0NBVElPTkFMICYiLCJ0b2tlbiI6Imt3dnJzMjAyNiIsImFjdGlvbiI6InBheW1lbnQifQ==";

// QR module matrix for ZELLE_PAYMENT_URL as SVG path data (49x49 modules,
// error correction M). Rendered inline so the code stays crisp at any size.
const QR_MODULES = 49;
const QR_PATH =
  "M0 0h7v1H0zM10 0h1v1H10zM12 0h6v1H12zM19 0h1v1H19zM23 0h1v1H23zM25 0h1v1H25zM29 0h3v1H29zM36 0h2v1H36zM40 0h1v1H40zM42 0h7v1H42zM0 1h1v1H0zM6 1h1v1H6zM9 1h2v1H9zM12 1h1v1H12zM14 1h1v1H14zM18 1h1v1H18zM20 1h3v1H20zM24 1h1v1H24zM26 1h2v1H26zM32 1h1v1H32zM34 1h2v1H34zM38 1h3v1H38zM42 1h1v1H42zM48 1h1v1H48zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h5v1H8zM15 2h2v1H15zM18 2h1v1H18zM20 2h3v1H20zM25 2h4v1H25zM30 2h1v1H30zM33 2h2v1H33zM36 2h1v1H36zM39 2h2v1H39zM42 2h1v1H42zM44 2h3v1H44zM48 2h1v1H48zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h2v1H8zM11 3h1v1H11zM14 3h2v1H14zM18 3h1v1H18zM21 3h1v1H21zM23 3h4v1H23zM29 3h3v1H29zM33 3h5v1H33zM39 3h1v1H39zM42 3h1v1H42zM44 3h3v1H44zM48 3h1v1H48zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h1v1H8zM10 4h1v1H10zM12 4h2v1H12zM16 4h2v1H16zM19 4h9v1H19zM29 4h4v1H29zM35 4h3v1H35zM42 4h1v1H42zM44 4h3v1H44zM48 4h1v1H48zM0 5h1v1H0zM6 5h1v1H6zM8 5h2v1H8zM11 5h1v1H11zM17 5h1v1H17zM20 5h1v1H20zM22 5h1v1H22zM26 5h1v1H26zM28 5h2v1H28zM33 5h3v1H33zM37 5h2v1H37zM42 5h1v1H42zM48 5h1v1H48zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14 6h1v1H14zM16 6h1v1H16zM18 6h1v1H18zM20 6h1v1H20zM22 6h1v1H22zM24 6h1v1H24zM26 6h1v1H26zM28 6h1v1H28zM30 6h1v1H30zM32 6h1v1H32zM34 6h1v1H34zM36 6h1v1H36zM38 6h1v1H38zM40 6h1v1H40zM42 6h7v1H42zM8 7h1v1H8zM11 7h2v1H11zM16 7h1v1H16zM18 7h5v1H18zM26 7h2v1H26zM30 7h2v1H30zM34 7h1v1H34zM38 7h1v1H38zM40 7h1v1H40zM0 8h1v1H0zM2 8h5v1H2zM12 8h1v1H12zM14 8h3v1H14zM22 8h5v1H22zM29 8h3v1H29zM34 8h4v1H34zM39 8h2v1H39zM42 8h5v1H42zM0 9h2v1H0zM3 9h3v1H3zM8 9h2v1H8zM13 9h4v1H13zM18 9h2v1H18zM21 9h5v1H21zM28 9h1v1H28zM30 9h3v1H30zM37 9h1v1H37zM41 9h2v1H41zM44 9h3v1H44zM4 10h4v1H4zM9 10h1v1H9zM14 10h1v1H14zM16 10h3v1H16zM20 10h1v1H20zM24 10h4v1H24zM29 10h1v1H29zM31 10h4v1H31zM37 10h1v1H37zM43 10h2v1H43zM47 10h2v1H47zM5 11h1v1H5zM7 11h1v1H7zM9 11h3v1H9zM13 11h2v1H13zM17 11h1v1H17zM19 11h2v1H19zM24 11h1v1H24zM27 11h2v1H27zM32 11h4v1H32zM37 11h4v1H37zM48 11h1v1H48zM1 12h1v1H1zM3 12h1v1H3zM6 12h2v1H6zM10 12h1v1H10zM12 12h1v1H12zM14 12h1v1H14zM16 12h1v1H16zM18 12h1v1H18zM21 12h4v1H21zM26 12h2v1H26zM31 12h1v1H31zM35 12h2v1H35zM39 12h2v1H39zM43 12h1v1H43zM45 12h1v1H45zM47 12h2v1H47zM0 13h2v1H0zM4 13h1v1H4zM7 13h2v1H7zM10 13h2v1H10zM14 13h1v1H14zM17 13h2v1H17zM21 13h2v1H21zM25 13h1v1H25zM30 13h1v1H30zM37 13h1v1H37zM42 13h1v1H42zM46 13h2v1H46zM0 14h1v1H0zM2 14h1v1H2zM4 14h3v1H4zM15 14h1v1H15zM18 14h2v1H18zM23 14h3v1H23zM28 14h2v1H28zM33 14h1v1H33zM35 14h1v1H35zM37 14h1v1H37zM47 14h2v1H47zM0 15h2v1H0zM4 15h1v1H4zM10 15h1v1H10zM12 15h2v1H12zM16 15h5v1H16zM23 15h1v1H23zM28 15h2v1H28zM37 15h2v1H37zM41 15h2v1H41zM44 15h1v1H44zM48 15h1v1H48zM0 16h1v1H0zM2 16h1v1H2zM4 16h4v1H4zM9 16h4v1H9zM15 16h1v1H15zM17 16h2v1H17zM20 16h5v1H20zM26 16h2v1H26zM31 16h1v1H31zM33 16h5v1H33zM41 16h3v1H41zM45 16h2v1H45zM0 17h3v1H0zM7 17h1v1H7zM9 17h4v1H9zM17 17h1v1H17zM19 17h1v1H19zM22 17h1v1H22zM24 17h2v1H24zM28 17h3v1H28zM32 17h1v1H32zM35 17h1v1H35zM37 17h1v1H37zM41 17h3v1H41zM48 17h1v1H48zM0 18h3v1H0zM5 18h3v1H5zM11 18h2v1H11zM15 18h1v1H15zM22 18h1v1H22zM24 18h1v1H24zM26 18h1v1H26zM30 18h2v1H30zM33 18h4v1H33zM41 18h1v1H41zM43 18h3v1H43zM47 18h2v1H47zM1 19h2v1H1zM4 19h1v1H4zM8 19h2v1H8zM11 19h2v1H11zM14 19h3v1H14zM18 19h2v1H18zM25 19h4v1H25zM36 19h1v1H36zM41 19h1v1H41zM43 19h2v1H43zM0 20h1v1H0zM3 20h2v1H3zM6 20h3v1H6zM13 20h1v1H13zM16 20h3v1H16zM21 20h4v1H21zM29 20h3v1H29zM35 20h2v1H35zM38 20h3v1H38zM46 20h1v1H46zM0 21h3v1H0zM10 21h2v1H10zM13 21h2v1H13zM17 21h3v1H17zM23 21h3v1H23zM27 21h1v1H27zM30 21h1v1H30zM37 21h1v1H37zM41 21h5v1H41zM0 22h9v1H0zM10 22h7v1H10zM18 22h1v1H18zM20 22h7v1H20zM31 22h6v1H31zM38 22h1v1H38zM40 22h5v1H40zM47 22h2v1H47zM0 23h3v1H0zM4 23h1v1H4zM8 23h1v1H8zM10 23h1v1H10zM14 23h1v1H14zM16 23h1v1H16zM18 23h2v1H18zM21 23h2v1H21zM26 23h2v1H26zM30 23h1v1H30zM33 23h2v1H33zM37 23h1v1H37zM39 23h2v1H39zM44 23h1v1H44zM48 23h1v1H48zM0 24h1v1H0zM2 24h3v1H2zM6 24h1v1H6zM8 24h1v1H8zM12 24h1v1H12zM14 24h1v1H14zM16 24h1v1H16zM18 24h1v1H18zM20 24h3v1H20zM24 24h1v1H24zM26 24h1v1H26zM30 24h2v1H30zM35 24h4v1H35zM40 24h1v1H40zM42 24h1v1H42zM44 24h1v1H44zM46 24h3v1H46zM0 25h3v1H0zM4 25h1v1H4zM8 25h1v1H8zM10 25h1v1H10zM16 25h1v1H16zM22 25h1v1H22zM26 25h5v1H26zM35 25h2v1H35zM39 25h2v1H39zM44 25h2v1H44zM1 26h2v1H1zM4 26h5v1H4zM10 26h1v1H10zM12 26h2v1H12zM17 26h1v1H17zM19 26h9v1H19zM30 26h3v1H30zM37 26h12v1H37zM0 27h3v1H0zM4 27h1v1H4zM9 27h5v1H9zM15 27h2v1H15zM18 27h1v1H18zM22 27h2v1H22zM26 27h3v1H26zM30 27h4v1H30zM39 27h2v1H39zM42 27h1v1H42zM47 27h1v1H47zM3 28h1v1H3zM5 28h2v1H5zM8 28h2v1H8zM14 28h1v1H14zM16 28h2v1H16zM19 28h6v1H19zM30 28h2v1H30zM34 28h1v1H34zM36 28h1v1H36zM39 28h2v1H39zM47 28h1v1H47zM0 29h1v1H0zM2 29h1v1H2zM7 29h5v1H7zM13 29h1v1H13zM16 29h1v1H16zM21 29h5v1H21zM28 29h4v1H28zM36 29h2v1H36zM41 29h3v1H41zM45 29h2v1H45zM0 30h3v1H0zM4 30h1v1H4zM6 30h1v1H6zM9 30h2v1H9zM13 30h2v1H13zM17 30h1v1H17zM19 30h1v1H19zM22 30h1v1H22zM25 30h1v1H25zM28 30h1v1H28zM31 30h1v1H31zM35 30h1v1H35zM37 30h1v1H37zM39 30h1v1H39zM41 30h3v1H41zM45 30h4v1H45zM0 31h1v1H0zM2 31h3v1H2zM8 31h1v1H8zM11 31h2v1H11zM15 31h9v1H15zM25 31h2v1H25zM30 31h4v1H30zM36 31h2v1H36zM39 31h2v1H39zM42 31h1v1H42zM44 31h1v1H44zM47 31h1v1H47zM0 32h2v1H0zM3 32h1v1H3zM6 32h7v1H6zM14 32h1v1H14zM18 32h1v1H18zM20 32h1v1H20zM22 32h2v1H22zM26 32h1v1H26zM33 32h4v1H33zM38 32h2v1H38zM41 32h1v1H41zM43 32h3v1H43zM47 32h2v1H47zM0 33h2v1H0zM8 33h1v1H8zM10 33h3v1H10zM17 33h1v1H17zM19 33h1v1H19zM21 33h1v1H21zM24 33h1v1H24zM29 33h3v1H29zM36 33h2v1H36zM40 33h2v1H40zM47 33h1v1H47zM0 34h2v1H0zM4 34h1v1H4zM6 34h1v1H6zM9 34h1v1H9zM12 34h1v1H12zM14 34h12v1H14zM32 34h5v1H32zM38 34h3v1H38zM42 34h1v1H42zM45 34h1v1H45zM47 34h2v1H47zM0 35h1v1H0zM2 35h3v1H2zM7 35h3v1H7zM11 35h2v1H11zM15 35h2v1H15zM21 35h2v1H21zM25 35h1v1H25zM28 35h2v1H28zM34 35h1v1H34zM36 35h3v1H36zM40 35h1v1H40zM43 35h1v1H43zM0 36h1v1H0zM2 36h3v1H2zM6 36h5v1H6zM12 36h2v1H12zM15 36h1v1H15zM17 36h3v1H17zM21 36h3v1H21zM26 36h1v1H26zM31 36h1v1H31zM33 36h1v1H33zM35 36h5v1H35zM43 36h2v1H43zM46 36h1v1H46zM1 37h1v1H1zM4 37h2v1H4zM7 37h1v1H7zM10 37h2v1H10zM17 37h3v1H17zM21 37h1v1H21zM24 37h2v1H24zM27 37h5v1H27zM35 37h1v1H35zM37 37h1v1H37zM41 37h2v1H41zM47 37h2v1H47zM1 38h1v1H1zM5 38h2v1H5zM11 38h1v1H11zM15 38h2v1H15zM19 38h1v1H19zM22 38h1v1H22zM24 38h2v1H24zM27 38h1v1H27zM32 38h3v1H32zM38 38h1v1H38zM41 38h3v1H41zM45 38h1v1H45zM47 38h2v1H47zM1 39h3v1H1zM7 39h1v1H7zM9 39h3v1H9zM13 39h3v1H13zM19 39h1v1H19zM21 39h1v1H21zM23 39h2v1H23zM29 39h2v1H29zM32 39h2v1H32zM36 39h1v1H36zM40 39h1v1H40zM42 39h1v1H42zM0 40h3v1H0zM6 40h2v1H6zM12 40h1v1H12zM14 40h1v1H14zM16 40h2v1H16zM19 40h2v1H19zM22 40h5v1H22zM31 40h1v1H31zM34 40h4v1H34zM39 40h8v1H39zM8 41h2v1H8zM13 41h2v1H13zM17 41h1v1H17zM19 41h1v1H19zM22 41h1v1H22zM26 41h5v1H26zM33 41h1v1H33zM36 41h2v1H36zM40 41h1v1H40zM44 41h1v1H44zM47 41h1v1H47zM0 42h7v1H0zM11 42h1v1H11zM13 42h4v1H13zM18 42h2v1H18zM21 42h2v1H21zM24 42h1v1H24zM26 42h3v1H26zM30 42h1v1H30zM34 42h2v1H34zM38 42h1v1H38zM40 42h1v1H40zM42 42h1v1H42zM44 42h1v1H44zM46 42h1v1H46zM48 42h1v1H48zM0 43h1v1H0zM6 43h1v1H6zM8 43h3v1H8zM12 43h1v1H12zM19 43h1v1H19zM21 43h2v1H21zM26 43h3v1H26zM30 43h1v1H30zM32 43h3v1H32zM37 43h1v1H37zM40 43h1v1H40zM44 43h1v1H44zM47 43h1v1H47zM0 44h1v1H0zM2 44h3v1H2zM6 44h1v1H6zM8 44h1v1H8zM10 44h1v1H10zM12 44h4v1H12zM17 44h4v1H17zM22 44h5v1H22zM31 44h1v1H31zM35 44h2v1H35zM40 44h5v1H40zM47 44h1v1H47zM0 45h1v1H0zM2 45h3v1H2zM6 45h1v1H6zM8 45h2v1H8zM11 45h4v1H11zM18 45h1v1H18zM21 45h1v1H21zM28 45h1v1H28zM30 45h1v1H30zM36 45h2v1H36zM40 45h1v1H40zM42 45h4v1H42zM47 45h2v1H47zM0 46h1v1H0zM2 46h3v1H2zM6 46h1v1H6zM8 46h1v1H8zM10 46h1v1H10zM12 46h1v1H12zM14 46h1v1H14zM16 46h1v1H16zM18 46h2v1H18zM24 46h1v1H24zM26 46h2v1H26zM29 46h1v1H29zM31 46h5v1H31zM38 46h1v1H38zM43 46h1v1H43zM0 47h1v1H0zM6 47h1v1H6zM11 47h2v1H11zM15 47h1v1H15zM17 47h2v1H17zM21 47h1v1H21zM25 47h1v1H25zM27 47h2v1H27zM33 47h2v1H33zM38 47h1v1H38zM41 47h2v1H41zM48 47h1v1H48zM0 48h7v1H0zM8 48h2v1H8zM11 48h2v1H11zM14 48h1v1H14zM17 48h5v1H17zM24 48h1v1H24zM26 48h1v1H26zM30 48h2v1H30zM35 48h2v1H35zM38 48h5v1H38zM46 48h3v1H46z";

const ENDPOINT = "/api/payment-intent";

const EMPTY_FIELDS: PaymentIntentFields = {
  name: "",
  email: "",
  firm: "",
  invoiceNumber: "",
  caseName: "",
  amount: "",
};

// Focus order for the required fields, so a failed submit jumps to the first
// problem the same way the intake forms do.
const FIELD_FOCUS_ORDER: (keyof PaymentIntentFields)[] = [
  "name",
  "email",
  "invoiceNumber",
  "caseName",
  "amount",
  "firm",
];

type Status = "form" | "submitting" | "revealed";
type Notice = null | { kind: "verify" | "offline" };
type Confirmed = { invoiceNumber: string; amount: string; recorded: boolean };

export default function Payment() {
  usePageMeta({
    title: "Make a Payment | KWVRS",
    description:
      "Pay a Kincaid Wolstein Vocational and Rehabilitation Services invoice securely with Zelle.",
    canonical: `${ORG_URL}/payment`,
    noindex: true,
  });

  const [fields, setFields] = useState<PaymentIntentFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<PaymentIntentFieldErrors>({});
  const [status, setStatus] = useState<Status>("form");
  const [notice, setNotice] = useState<Notice>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [copied, setCopied] = useState(false);

  const update = <K extends keyof PaymentIntentFields>(key: K, value: PaymentIntentFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Inline UX: clear a field's error as soon as the payer edits it.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateOnBlur = (key: keyof PaymentIntentFields) => {
    const message = validatePaymentIntentFields(fields)[key];
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  };

  const focusFirstError = (errs: PaymentIntentFieldErrors) => {
    if (typeof document === "undefined") return;
    const first = FIELD_FOCUS_ORDER.find((k) => errs[k]);
    if (first) document.getElementById(`pi-${first}`)?.focus();
  };

  // Reveal the Zelle QR + memo. Snapshots the invoice/amount as submitted so the
  // memo panel is stable even if the payer keeps editing the (now hidden) form.
  const reveal = (source: PaymentIntentFields, recorded: boolean) => {
    const payload = buildPaymentIntentPayload(source);
    setConfirmed({
      invoiceNumber: payload.invoiceNumber,
      amount: formatUsd(payload.amount),
      recorded,
    });
    setStatus("revealed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const fieldErrors = validatePaymentIntentFields(fields);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }
    setErrors({});
    setNotice(null);
    setStatus("submitting");

    const payload = buildPaymentIntentPayload(fields);
    const body = JSON.stringify({ ...payload, turnstileToken, company_website: companyWebsite });

    const attempt = async (): Promise<"ok" | "verify" | "fail"> => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body,
        });
        if (res.ok) return "ok";
        // 400 is a Turnstile (or validation) rejection - it won't fix itself on a
        // blind retry, so surface it and let the payer complete the check again.
        if (res.status === 400) return "verify";
        return "fail";
      } catch {
        return "fail";
      }
    };

    let result = await attempt();
    // Retry ONCE on a transient failure (network drop / 5xx) before giving up.
    if (result === "fail") {
      await new Promise((r) => setTimeout(r, 800));
      result = await attempt();
    }

    if (result === "ok") {
      reveal(fields, true);
      return;
    }
    if (result === "verify") {
      setStatus("form");
      setNotice({ kind: "verify" });
      setTurnstileToken(""); // force the widget to re-challenge
      return;
    }
    // Still failing after a retry. The tracking API is best-effort - never block
    // a willing payer on it. Offer to continue straight to the QR (see below).
    setStatus("form");
    setNotice({ kind: "offline" });
  };

  const memo = confirmed ? zelleMemo(confirmed.invoiceNumber) : "";
  const handleCopy = async () => {
    if (!memo) return;
    try {
      await navigator.clipboard.writeText(memo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const fieldError = (key: keyof PaymentIntentFields) =>
    errors[key] ? (
      <p id={`pi-${key}-error`} className="mt-1 text-sm text-red-600">
        {errors[key]}
      </p>
    ) : null;

  const inputClass = (key: keyof PaymentIntentFields) =>
    `w-full rounded-lg border px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:border-teal ${
      errors[key] ? "border-red-400" : "border-neutral-300"
    }`;

  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-4xl text-navy mb-3">Make a Payment</h1>
        <p className="text-neutral-700">
          Kincaid Wolstein Vocational and Rehabilitation Services accepts secure payments through
          Zelle. Tell us which invoice you are paying so we can match your payment to your account,
          then we will show you the Zelle QR code and payment link.
        </p>
      </header>

      {status !== "revealed" ? (
        <>
          <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 font-serif text-xl text-navy">
              <ShieldCheck className="h-5 w-5 text-teal" aria-hidden="true" />
              Tell us what this payment is for
            </h2>
            <p className="mb-5 text-sm text-neutral-600">
              This keeps your payment from sitting unmatched. Fields marked * are required.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label htmlFor="pi-name" className="block">
                  <span className="mb-1 block text-sm font-semibold text-navy">Your name *</span>
                  <input
                    id="pi-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fields.name}
                    onChange={(e) => update("name", e.target.value)}
                    onBlur={() => validateOnBlur("name")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "pi-name-error" : undefined}
                    className={inputClass("name")}
                  />
                  {fieldError("name")}
                </label>

                <label htmlFor="pi-email" className="block">
                  <span className="mb-1 block text-sm font-semibold text-navy">Email *</span>
                  <input
                    id="pi-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={fields.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => validateOnBlur("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "pi-email-error" : undefined}
                    className={inputClass("email")}
                  />
                  {fieldError("email")}
                </label>
              </div>

              <label htmlFor="pi-firm" className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">
                  Law firm or company <span className="font-normal text-neutral-500">(optional)</span>
                </span>
                <input
                  id="pi-firm"
                  type="text"
                  autoComplete="organization"
                  value={fields.firm}
                  onChange={(e) => update("firm", e.target.value)}
                  className={inputClass("firm")}
                />
              </label>

              <label htmlFor="pi-invoiceNumber" className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">Invoice number *</span>
                <input
                  id="pi-invoiceNumber"
                  type="text"
                  inputMode="text"
                  required
                  maxLength={40}
                  placeholder="e.g. INV-10432"
                  value={fields.invoiceNumber}
                  onChange={(e) => update("invoiceNumber", e.target.value)}
                  onBlur={() => validateOnBlur("invoiceNumber")}
                  aria-invalid={Boolean(errors.invoiceNumber)}
                  aria-describedby={
                    errors.invoiceNumber ? "pi-invoiceNumber-error" : "pi-invoiceNumber-help"
                  }
                  className={inputClass("invoiceNumber")}
                />
                {errors.invoiceNumber ? (
                  fieldError("invoiceNumber")
                ) : (
                  <span id="pi-invoiceNumber-help" className="mt-1 block text-xs text-neutral-600">
                    Shown on the invoice or statement we sent you. You will put this in the Zelle memo.
                  </span>
                )}
              </label>

              <label htmlFor="pi-caseName" className="block">
                <span className="mb-1 block text-sm font-semibold text-navy">
                  Case or matter reference{" "}
                  <span className="font-normal text-neutral-500">(optional)</span>
                </span>
                <input
                  id="pi-caseName"
                  type="text"
                  placeholder="Evaluee or case name, if you have it"
                  value={fields.caseName}
                  onChange={(e) => update("caseName", e.target.value)}
                  className={inputClass("caseName")}
                />
              </label>

              <label htmlFor="pi-amount" className="block sm:max-w-xs">
                <span className="mb-1 block text-sm font-semibold text-navy">Amount (USD) *</span>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500"
                  >
                    $
                  </span>
                  <input
                    id="pi-amount"
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="1250.00"
                    value={fields.amount}
                    onChange={(e) => update("amount", e.target.value)}
                    onBlur={() => validateOnBlur("amount")}
                    aria-invalid={Boolean(errors.amount)}
                    aria-describedby={errors.amount ? "pi-amount-error" : undefined}
                    className={`${inputClass("amount")} pl-7`}
                  />
                </div>
                {fieldError("amount")}
              </label>

              <Turnstile onToken={setTurnstileToken} />
              <HoneypotField onChange={setCompanyWebsite} />

              {notice?.kind === "verify" && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700"
                >
                  <p>
                    We could not verify that you are human. Please complete the check above and
                    submit again.
                  </p>
                  <p className="mt-1">
                    If the check will not load, you can still pay - just be sure the Zelle memo
                    includes your invoice number so we can match your payment.
                  </p>
                  <button
                    type="button"
                    onClick={() => reveal(fields, false)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 font-semibold text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
                  >
                    Continue to payment
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {notice?.kind === "offline" && (
                <div
                  role="alert"
                  className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
                >
                  <p className="font-semibold">We could not reach our system to log this payment.</p>
                  <p className="mt-1">
                    You do not have to wait on us - you can pay right now. Please be sure the Zelle
                    memo includes your invoice number so we can still match it.
                  </p>
                  <button
                    type="button"
                    onClick={() => reveal(fields, false)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 font-semibold text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
                  >
                    Continue to payment
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-lg bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-teal disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 sm:w-auto"
              >
                {status === "submitting" ? "Recording..." : "Continue to payment"}
              </button>
            </form>
          </section>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Questions about an invoice or payment? Email{" "}
            <a href="mailto:info@kwvrs.com" className="font-medium text-teal hover:underline">
              info@kwvrs.com
            </a>{" "}
            and we will be glad to help.
          </p>
        </>
      ) : (
        <>
          {confirmed?.recorded && (
            <p
              role="status"
              className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-forest/40 bg-forest/5 p-3 text-sm font-medium text-forest"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Thanks - we have your payment details. One step left.
            </p>
          )}

          {/* Zelle memo: the whole point of this page. The payment cannot be
              matched to an account without the invoice number in the memo, so it
              is the most prominent element on the confirmation view. */}
          <section className="rounded-xl border-2 border-teal bg-teal/5 p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-navy">
              Put this exact memo on your Zelle payment
            </h2>
            <p className="mt-1 text-sm text-neutral-700">
              Your bank may call this the <strong>memo</strong>, <strong>note</strong>, or{" "}
              <strong>what&apos;s it for</strong> field. Without the invoice number we cannot match
              your payment to your account.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 select-all break-words rounded-lg border border-teal/40 bg-white px-4 py-3 font-mono text-lg font-semibold text-navy">
                {memo}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                aria-live="polite"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 font-semibold text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy memo
                  </>
                )}
              </button>
            </div>

            {confirmed?.amount && (
              <p className="mt-4 text-lg text-navy">
                Send <strong>{confirmed.amount}</strong> via Zelle.
              </p>
            )}
          </section>

          <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="mx-auto w-fit rounded-lg border border-neutral-200 bg-white p-6">
              <svg
                viewBox={`0 0 ${QR_MODULES} ${QR_MODULES}`}
                shapeRendering="crispEdges"
                role="img"
                aria-label="Zelle payment QR code for Kincaid Wolstein Vocational and Rehabilitation Services"
                className="h-56 w-56 sm:h-64 sm:w-64"
              >
                <path d={QR_PATH} fill="#1a2744" />
              </svg>
            </div>

            <div className="mt-6 text-center">
              <a
                href={ZELLE_PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
              >
                Pay with Zelle
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-3 text-sm text-neutral-600">
                The button and the QR code open the same secure Zelle payment link.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="mb-3 flex items-center gap-2 font-serif text-xl text-navy">
              <Smartphone className="h-5 w-5 text-teal" aria-hidden="true" />
              How it works
            </h2>
            <ol className="list-decimal space-y-2 pl-5 text-neutral-700">
              <li>
                Open your banking app and choose <strong>Send money with Zelle</strong>, then scan
                the QR code above - or tap the Pay with Zelle button on your phone.
              </li>
              <li>
                Confirm the recipient. The account is registered to{" "}
                <strong>Kincaid Wolstein Vocational and Rehabilitation Services</strong> (your app
                may show a shortened business name).
              </li>
              <li>
                Enter <strong>{confirmed?.amount || "the amount"}</strong> and, in the memo, put{" "}
                <strong>{memo}</strong>. The invoice number in the memo is required so we can match
                the payment to your account.
              </li>
            </ol>
            <p className="mt-4 text-sm text-neutral-600">
              Questions about an invoice or payment? Email{" "}
              <a href="mailto:info@kwvrs.com" className="font-medium text-teal hover:underline">
                info@kwvrs.com
              </a>{" "}
              and we will be glad to help.
            </p>
          </section>
        </>
      )}
    </article>
  );
}
