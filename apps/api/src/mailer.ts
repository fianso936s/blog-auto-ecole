// Transactional e-mail through Resend's HTTP API. Off (returns null) until
// RESEND_API_KEY and MAIL_FROM are set on the API server.
export type Mail = { to: string; subject: string; text: string };
export function mailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export async function sendMail(mail: Mail): Promise<boolean | null> {
  if (!mailConfigured()) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.to)) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5;color:#1c1719">${mail.text.split("\n").map((l) => l ? `<p style="margin:0 0 8px">${escapeHtml(l)}</p>` : "").join("")}<p style="margin-top:20px;color:#6b6064;font-size:13px">Le Repère Permis</p></div>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error("repere_mail_failed", { status: response.status });
    return response.ok;
  } catch (error) {
    console.error("repere_mail_failed", { name: (error as Error).name });
    return false;
  }
}
