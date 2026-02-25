import {
  json,
  corsHeaders,
  getEnv,
  normalizeEmail,
  escHtml,
  formatLines,
  postSlack,
  postAutomation,
  sendResendEmail,
  getBaseUrlFromEvent,
  parseJsonBody,
} from "./_shared.js";

export async function handler(event) {
  const cors = corsHeaders();
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true }, cors);
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, cors);

  try {
    const body = parseJsonBody(event);

    // Honeypot (optional): if filled, pretend success.
    if (body?.hp && String(body.hp).trim()) return json(200, { ok: true }, cors);

    const toEmail = getEnv("FORMS_TO_EMAIL", "info@workwithfulcrum.com").trim();
    const fromEmail = getEnv("FORMS_FROM_EMAIL", "").trim();
    if (!fromEmail) throw new Error("Missing FORMS_FROM_EMAIL (must be Resend-verified)");

    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);
    const goals = String(body?.goals || "").trim();
    const consent = !!body?.consent;

    if (!name || !email || !goals || !consent) {
      return json(400, { error: "Missing required fields" }, cors);
    }

    const payload = {
      type: "consultation",
      receivedAt: new Date().toISOString(),
      name,
      email,
      phone: String(body?.phone || "").trim(),
      company: String(body?.company || "").trim(),
      website: String(body?.website || "").trim(),
      service: String(body?.service || "").trim(),
      budget: String(body?.budget || "").trim(),
      timeline: String(body?.timeline || "").trim(),
      goals,
      consent,
      sourceUrl: String(body?.sourceUrl || getBaseUrlFromEvent(event) || "").trim(),
    };

    const text = formatLines(payload);
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.45">
        <h2 style="margin:0 0 12px">New consultation request</h2>
        <pre style="background:#f6f6f6;border:1px solid #e7e7e7;border-radius:12px;padding:14px;white-space:pre-wrap">${escHtml(
          text
        )}</pre>
      </div>
    `;

    // Internal email
    await sendResendEmail({
      from: fromEmail,
      to: [toEmail],
      subject: `Consultation request — ${name}`,
      reply_to: email,
      text,
      html,
    });

    // Applicant confirmation
    await sendResendEmail({
      from: fromEmail,
      to: [email],
      subject: "We received your request — Fulcrum",
      html: `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.55">
          <h2 style="margin:0 0 10px">Thanks, ${escHtml(name)}.</h2>
          <p style="margin:0 0 12px;color:#333">
            We received your consultation request. Our team will reach out within 1–2 business days to confirm next steps.
          </p>
          <p style="margin:0;color:#666;font-size:13px">
            If you need anything sooner, reply to this email or contact <b>info@workwithfulcrum.com</b>.
          </p>
        </div>
      `,
    });

    // Slack + Automation are best-effort (don’t fail the submission)
    postSlack({
      text: `New consultation request from ${name} (${email})`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*New consultation request*\n*${name}* — ${email}` },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Company*\n${payload.company || "—"}` },
            { type: "mrkdwn", text: `*Service*\n${payload.service || "—"}` },
            { type: "mrkdwn", text: `*Budget*\n${payload.budget || "—"}` },
            { type: "mrkdwn", text: `*Timeline*\n${payload.timeline || "—"}` },
          ],
        },
        { type: "section", text: { type: "mrkdwn", text: `*Goals*\n${payload.goals}` } },
      ],
    }).catch(() => {});

    postAutomation(payload).catch(() => {});

    return json(200, { ok: true }, cors);
  } catch (e) {
    return json(500, { error: "Server error", detail: String(e?.message || e) }, cors);
  }
}

