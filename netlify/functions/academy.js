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
  parseMultipart,
  isAllowedResume,
} from "./_shared.js";

export async function handler(event) {
  const cors = corsHeaders();
  if (event.httpMethod === "OPTIONS") return json(200, { ok: true }, cors);
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" }, cors);

  try {
    const { fields, files } = parseMultipart(event);

    // Honeypot (optional): if filled, pretend success.
    if (fields?.hp && String(fields.hp).trim()) return json(200, { ok: true }, cors);

    const toEmail = getEnv("FORMS_TO_EMAIL", "info@workwithfulcrum.com").trim();
    const fromEmail = getEnv("FORMS_FROM_EMAIL", "").trim();
    if (!fromEmail) throw new Error("Missing FORMS_FROM_EMAIL (must be Resend-verified)");

    const name = String(fields?.name || "").trim();
    const email = normalizeEmail(fields?.email);
    const phone = String(fields?.phone || "").trim();
    const status = String(fields?.status || "").trim();
    const why = String(fields?.why || "").trim();

    const resume = files?.resume || null;
    if (!name || !email || !phone || !why || !resume) {
      return json(400, { error: "Missing required fields" }, cors);
    }

    const maxBytes = Number(getEnv("ACADEMY_RESUME_MAX_BYTES", "10485760")); // 10MB default
    if (resume.size > maxBytes) {
      return json(400, { error: "Resume file is too large" }, cors);
    }

    if (!isAllowedResume(resume.filename, resume.contentType)) {
      return json(400, { error: "Unsupported resume type. Upload PDF, DOC, or DOCX." }, cors);
    }

    const payload = {
      type: "academy",
      receivedAt: new Date().toISOString(),
      name,
      email,
      phone,
      status,
      why,
      resumeFilename: resume.filename,
      resumeBytes: resume.size,
      sourceUrl: String(fields?.sourceUrl || getBaseUrlFromEvent(event) || "").trim(),
    };

    const text = formatLines(payload);
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.45">
        <h2 style="margin:0 0 12px">New Fulcrum Academy application</h2>
        <pre style="background:#f6f6f6;border:1px solid #e7e7e7;border-radius:12px;padding:14px;white-space:pre-wrap">${escHtml(
          text
        )}</pre>
        <p style="margin:12px 0 0;color:#666;font-size:13px">
          Resume attached: <b>${escHtml(resume.filename)}</b>
        </p>
      </div>
    `;

    // Internal email w/ attachment
    await sendResendEmail({
      from: fromEmail,
      to: [toEmail],
      subject: `Fulcrum Academy application — ${name}`,
      reply_to: email,
      text,
      html,
      attachments: [
        {
          filename: resume.filename,
          content: resume.buffer.toString("base64"),
        },
      ],
    });

    // Applicant confirmation
    await sendResendEmail({
      from: fromEmail,
      to: [email],
      subject: "Application received — Fulcrum Academy",
      html: `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.55">
          <h2 style="margin:0 0 10px">Thanks, ${escHtml(name)}.</h2>
          <p style="margin:0 0 12px;color:#333">
            We received your Fulcrum Academy application. Our team will review it and reach out about next steps.
          </p>
          <p style="margin:0;color:#666;font-size:13px">
            If you need anything sooner, reply to this email or contact <b>info@workwithfulcrum.com</b>.
          </p>
        </div>
      `,
    });

    // Slack + Automation best-effort
    postSlack({
      text: `New Fulcrum Academy application from ${name} (${email})`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `*New Academy application*\n*${name}* — ${email}` },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Phone*\n${payload.phone}` },
            { type: "mrkdwn", text: `*Status*\n${payload.status || "—"}` },
            { type: "mrkdwn", text: `*Resume*\n${payload.resumeFilename} (${Math.round(payload.resumeBytes / 1024)} KB)` },
          ],
        },
        { type: "section", text: { type: "mrkdwn", text: `*Why*\n${payload.why}` } },
      ],
    }).catch(() => {});

    postAutomation(payload).catch(() => {});

    return json(200, { ok: true }, cors);
  } catch (e) {
    return json(500, { error: "Server error", detail: String(e?.message || e) }, cors);
  }
}

