## Forms backend (Netlify + Resend + Slack)

This site uses **Netlify Functions** to handle form submissions and trigger:
- **Internal email** to `info@workwithfulcrum.com`
- **Confirmation email** to the submitter
- **Slack notification** (incoming webhook)
- Optional **automation webhook** (Zapier/Make/CRM)

### Endpoints
- `POST /api/consultation` → `netlify/functions/consultation.js`
- `POST /api/academy` → `netlify/functions/academy.js` (multipart form-data with resume attachment)

Routing is configured in `netlify.toml` via:
- `/api/*` → `/.netlify/functions/:splat`

### Required Netlify environment variables

#### Email (Resend)
- **`RESEND_API_KEY`**: your Resend API key
- **`FORMS_FROM_EMAIL`**: sender address (must be **Resend-verified**), e.g. `no-reply@workwithfulcrum.com`
- **`FORMS_TO_EMAIL`**: recipient address for internal notifications (set to `info@workwithfulcrum.com`)

Notes:
- Resend requires domain/sender verification before it will send from your address.
- Internal emails set `reply_to` to the submitter’s email.

#### Slack
- **`SLACK_WEBHOOK_URL`**: Slack incoming webhook URL for notifications

#### Automation (optional)
- **`AUTOMATION_WEBHOOK_URL`**: if set, the backend will POST the normalized payload to this URL

#### Optional / advanced
- **`PUBLIC_SITE_URL`**: used as a fallback for `sourceUrl` if request headers don’t include it
- **`ACADEMY_RESUME_MAX_BYTES`**: max resume size in bytes (default: `10485760` = 10MB)

### File upload rules (Academy resumes)
- Allowed extensions: `.pdf`, `.doc`, `.docx`
- Allowed content-types (best-effort): PDF, Word
- Default max size: 10MB (configurable)

### Local dev
For the cleanest local dev experience with Netlify Functions, run using Netlify CLI:

```bash
netlify dev
```

If you don’t use Netlify CLI locally, the frontend will still POST to `/api/...`, but you’ll need a dev proxy that matches Netlify’s function routing.

