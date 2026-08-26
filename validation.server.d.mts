// Type declarations for the plain-JS server-side validator (validation.server.mjs)
// so it can be imported from typechecked src/ code (e.g. agreementPayload.test.ts)
// without TS7016 "implicitly has an 'any' type".

export function isEmail(v: unknown): boolean;
export function isPhone(v: unknown): boolean;
export function validateRoute(
  type: string,
  data: Record<string, unknown>,
): string | null;

// Payment-intent (/api/payment-intent) validators + normalizer. Kept in lockstep
// with the client copy in src/lib/paymentIntent.ts (src/lib/paymentIntent.parity.test.ts).
export const MAX_PAYMENT_AMOUNT: number;
export const MAX_INVOICE_LENGTH: number;
export function normalizePaymentAmount(raw: unknown): string;
export function paymentAmountError(raw: unknown): string | null;
export function paymentInvoiceError(raw: unknown): string | null;
export function normalizePaymentIntent(data: Record<string, unknown>): void;
export function validatePaymentIntent(data: Record<string, unknown>): string | null;
