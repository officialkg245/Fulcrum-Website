/* global Buffer */

// Smoke-test Netlify functions locally without external calls.
// - Stubs global.fetch so Resend/Slack/automation calls don't hit the network
// - Invokes both handlers with realistic payloads

process.env.RESEND_API_KEY = "test";
process.env.FORMS_FROM_EMAIL = "no-reply@workwithfulcrum.com";
process.env.FORMS_TO_EMAIL = "info@workwithfulcrum.com";
process.env.SLACK_WEBHOOK_URL = "https://slack.example/webhook";
process.env.AUTOMATION_WEBHOOK_URL = "https://auto.example/hook";

global.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({ id: "test" }),
  text: async () => "",
});

const { handler: consultation } = await import("../netlify/functions/consultation.js");
const { handler: academy } = await import("../netlify/functions/academy.js");

const consultRes = await consultation({
  httpMethod: "POST",
  headers: {},
  isBase64Encoded: false,
  body: JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    goals: "Grow pipeline",
    consent: true,
    company: "Acme",
    service: "sales",
    sourceUrl: "http://localhost:8888/consultation",
  }),
});

console.log("[consultation]", consultRes.statusCode, consultRes.body);

const boundary = "----boundary123";
const crlf = "\r\n";
const file = Buffer.from("%PDF-1.4\n%fake\n");
const parts = [];
const pushStr = (s) => parts.push(Buffer.from(s, "utf8"));
const addField = (n, v) =>
  pushStr(
    `--${boundary}${crlf}Content-Disposition: form-data; name="${n}"${crlf}${crlf}${v}${crlf}`
  );

addField("name", "Test Applicant");
addField("email", "applicant@example.com");
addField("phone", "555-555-5555");
addField("status", "student");
addField("why", "I want to learn.");
addField("sourceUrl", "http://localhost:8888/academy");

pushStr(
  `--${boundary}${crlf}Content-Disposition: form-data; name="resume"; filename="resume.pdf"${crlf}Content-Type: application/pdf${crlf}${crlf}`
);
parts.push(file);
pushStr(`${crlf}--${boundary}--${crlf}`);

const academyEvent = {
  httpMethod: "POST",
  headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
  isBase64Encoded: true,
  body: Buffer.concat(parts).toString("base64"),
};

const academyRes = await academy(academyEvent);
console.log("[academy]", academyRes.statusCode, academyRes.body);

