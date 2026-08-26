// Minimal Resend REST client (no SDK dependency). Never throws: any failure
// resolves to { ok:false, error }, so a mail outage can never break a request.
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail({ to, from, replyTo, subject, html, text }, deps = {}) {
  const apiKey = deps.apiKey ?? process.env.RESEND_API_KEY ?? "";
  const _fetch = deps.fetch ?? fetch;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY unset - email skipped" };
  const recipients = Array.isArray(to) ? to : [to];
  const payload = { from, to: recipients, subject, html };
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;
  try {
    const res = await _fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `resend ${res.status} ${body.slice(0, 200)}` };
    }
    const json = await res.json().catch(() => ({}));
    return { ok: true, id: json.id ?? null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
