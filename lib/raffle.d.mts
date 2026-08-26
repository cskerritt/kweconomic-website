export interface RaffleFields {
  firstName: string;
  lastName: string;
  email: string;
  firm: string;
  barAssociation: string;
  barAssociationOther: string;
  phone: string;
}
export type RaffleFieldErrors = Partial<Record<keyof RaffleFields, string>>;
export interface RafflePayload extends RaffleFields {
  event: string;
}
export interface RaffleEntry extends RafflePayload {
  kind: "raffle-entry";
  entryId: string;
  timestamp: string;
  growDelivered: boolean;
  growAttemptedAt: string | null;
  growLeadId: string | null;
  growError: string | null;
}
export interface InboxLead {
  from_first: string;
  from_last: string;
  from_email: string;
  from_phone: string;
  from_message: string;
  referring_url: string;
  from_source: string;
}
export const RAFFLE_EVENT_MAX_LENGTH: number;
export const DEFAULT_RAFFLE_EVENT: string;
export const RAFFLE_PRIZE: string;
export const RAFFLE_RULES: string[];
export const RAFFLE_SOURCE_PREFIX: string;
export function normalizeEventSlug(raw: unknown): string;
export function raffleUrl(baseUrl: string, event?: unknown): string;
export function raffleEntryKey(event: unknown, email: unknown): string;
export function validateRaffleFields(fields: Partial<RaffleFields>): RaffleFieldErrors;
export function buildRafflePayload(fields: Partial<RaffleFields>, event?: unknown): RafflePayload;
export function buildRaffleEntry(
  data: Partial<RafflePayload>,
  opts?: { entryId?: string; timestamp?: string },
): RaffleEntry;
export function growLeadBody(entry: Partial<RaffleEntry>, opts?: { referringUrl?: string }): InboxLead;
export function foldRaffleEntries(rows: unknown[]): RaffleEntry[];
export function eligibleEntries(entries: RaffleEntry[], event?: unknown): RaffleEntry[];
export function drawRaffleWinners(
  pool: RaffleEntry[],
  randomInt: (max: number) => number,
): { winner: RaffleEntry | null; runnerUp: RaffleEntry | null; entered: number };
