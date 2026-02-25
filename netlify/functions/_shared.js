/* global process, Buffer */

function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function getEnv(name, fallback = "") {
  const v = process.env[name];
  return typeof v === "string" ? v : fallback;
}

function normalizeEmail(s) {
  return String(s || "").trim().toLowerCase();
}

function escHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatLines(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join("\n");
}

async function postSlack({ text, blocks }) {
  const url = getEnv("SLACK_WEBHOOK_URL", "").trim();
  if (!url) return { ok: false, skipped: true };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });
  return { ok: r.ok, status: r.status };
}

async function postAutomation(payload) {
  const url = getEnv("AUTOMATION_WEBHOOK_URL", "").trim();
  if (!url) return { ok: false, skipped: true };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: r.ok, status: r.status };
}

async function sendResendEmail(message) {
  const apiKey = getEnv("RESEND_API_KEY", "").trim();
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data?.message || data?.error || `Resend error (${r.status})`;
    throw new Error(msg);
  }
  return data;
}

function getBaseUrlFromEvent(event) {
  // Best-effort. On Netlify, referer/origin are often present.
  const origin = event?.headers?.origin || event?.headers?.Origin;
  if (origin) return String(origin);
  const referer = event?.headers?.referer || event?.headers?.Referer;
  if (referer) {
    try {
      return new URL(String(referer)).origin;
    } catch {
      // ignore
    }
  }
  return getEnv("PUBLIC_SITE_URL", "").trim();
}

function decodeEventBody(event) {
  const body = event?.body || "";
  if (!body) return Buffer.from("");
  if (event?.isBase64Encoded) return Buffer.from(body, "base64");
  return Buffer.from(body, "utf8");
}

function parseJsonBody(event) {
  const buf = decodeEventBody(event);
  const txt = buf.toString("utf8");
  return txt ? JSON.parse(txt) : {};
}

function parseMultipart(event) {
  const contentType = String(event?.headers?.["content-type"] || event?.headers?.["Content-Type"] || "");
  const match = contentType.match(/boundary=([^;]+)/i);
  if (!match) throw new Error("Missing multipart boundary");
  const boundary = match[1].replace(/^"|"$/g, "");
  const buf = decodeEventBody(event);
  const boundaryBuf = Buffer.from(`--${boundary}`);

  // Split by boundary markers
  const parts = [];
  let start = buf.indexOf(boundaryBuf);
  while (start !== -1) {
    const next = buf.indexOf(boundaryBuf, start + boundaryBuf.length);
    if (next === -1) break;
    const part = buf.slice(start + boundaryBuf.length, next);
    parts.push(part);
    start = next;
  }

  const fields = {};
  const files = {};

  for (const rawPart of parts) {
    // Trim leading CRLF
    let part = rawPart;
    if (part.slice(0, 2).toString() === "\r\n") part = part.slice(2);
    // End marker contains '--\r\n'
    if (part.length <= 0) continue;

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;

    const headerText = part.slice(0, headerEnd).toString("utf8");
    let content = part.slice(headerEnd + 4);
    // strip trailing CRLF
    if (content.slice(-2).toString() === "\r\n") content = content.slice(0, -2);

    const disp = headerText.match(/content-disposition:\s*form-data;\s*([^\\r\\n]+)/i);
    if (!disp) continue;

    const nameMatch = headerText.match(/name="([^"]+)"/i);
    if (!nameMatch) continue;
    const fieldName = nameMatch[1];
    const filenameMatch = headerText.match(/filename="([^"]*)"/i);
    const typeMatch = headerText.match(/content-type:\s*([^\\r\\n]+)/i);
    const contentTypePart = typeMatch ? typeMatch[1].trim() : "";

    if (filenameMatch && filenameMatch[1]) {
      files[fieldName] = {
        filename: filenameMatch[1],
        contentType: contentTypePart,
        buffer: content,
        size: content.length,
      };
    } else {
      fields[fieldName] = content.toString("utf8");
    }
  }

  return { fields, files };
}

function isAllowedResume(filename = "", contentType = "") {
  const lower = String(filename).toLowerCase();
  const allowedExt = [".pdf", ".doc", ".docx"];
  const okExt = allowedExt.some((e) => lower.endsWith(e));
  // MIME-type is best-effort and inconsistent across clients; enforce via extension.
  // (We still pass contentType through to logs/metadata if needed.)
  void contentType;
  return okExt;
}

export {
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
  parseMultipart,
  isAllowedResume,
};

