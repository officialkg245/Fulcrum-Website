import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import { URL } from "node:url";

// Load .env from project root (no dependency on dotenv)
try {
  const envPath = new URL("../.env", import.meta.url);
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // ignore
}

const PORT = Number(process.env.API_PORT || 5174);

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.LINKEDIN_REDIRECT_URI || "http://localhost:5174/api/linkedin/callback";
const SCOPE =
  process.env.LINKEDIN_SCOPE || "r_organization_social r_organization_admin";
const LINKEDIN_VERSION = process.env.LINKEDIN_VERSION || "202601";

// In-memory auth + caching (good for local dev; for production use a DB/kv).
let token = {
  accessToken: "",
  expiresAt: 0,
};
const validStates = new Set();

const postsCache = new Map(); // companyId -> { ts, posts }
const POSTS_TTL_MS = 5 * 60 * 1000; // 5 minutes

function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

function isTokenValid() {
  return token.accessToken && token.expiresAt && Date.now() < token.expiresAt - 30_000;
}

function pickText(post) {
  // Try common fields for commentary/text across LinkedIn responses.
  const candidates = [
    post?.commentary?.text,
    post?.commentary?.text?.text,
    post?.commentary,
    post?.text,
    post?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

function pickPermalink(post) {
  const candidates = [post?.permalink, post?.url, post?.permaLink, post?.activity];
  for (const c of candidates) {
    if (typeof c === "string" && c.startsWith("http")) return c;
  }
  return "";
}

function pickImage(post) {
  // Best-effort: LinkedIn media extraction varies by API/product.
  const candidates = [
    post?.content?.media?.[0]?.thumbnail?.url,
    post?.content?.media?.[0]?.url,
    post?.content?.media?.[0]?.originalUrl,
    post?.content?.media?.[0]?.thumbnails?.[0]?.url,
    post?.content?.contentEntities?.[0]?.thumbnails?.[0]?.resolvedUrl,
    post?.specificContent?.["com.linkedin.ugc.ShareContent"]?.media?.[0]?.thumbnails?.[0]
      ?.resolvedUrl,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.startsWith("http")) return c;
  }
  return "";
}

async function exchangeCodeForToken(code) {
  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", REDIRECT_URI);
  params.set("client_id", CLIENT_ID);
  params.set("client_secret", CLIENT_SECRET);

  const r = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Token exchange failed: ${r.status} ${txt}`);
  }

  const data = await r.json();
  const accessToken = data.access_token;
  const expiresIn = Number(data.expires_in || 0);
  if (!accessToken || !expiresIn) throw new Error("Token response missing fields");

  token = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

async function fetchOrgPosts({ companyId, limit }) {
  const cached = postsCache.get(companyId);
  if (cached && Date.now() - cached.ts < POSTS_TTL_MS) return cached.posts;

  // LinkedIn REST Posts API (Microsoft Learn):
  // https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
  const api = new URL("https://api.linkedin.com/rest/posts");
  api.searchParams.set("q", "author");
  api.searchParams.set("author", `urn:li:organization:${companyId}`);
  api.searchParams.set("count", String(limit));
  api.searchParams.set("sortBy", "LAST_MODIFIED");

  const r = await fetch(api.toString(), {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": LINKEDIN_VERSION,
    },
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Posts fetch failed: ${r.status} ${txt}`);
  }

  const data = await r.json();
  const items = Array.isArray(data?.elements)
    ? data.elements
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];

  const posts = items.slice(0, limit).map((p) => {
    const text = pickText(p);
    const excerpt = text ? text.slice(0, 170) + (text.length > 170 ? "…" : "") : "";

    const created =
      p?.createdAt ||
      p?.created?.time ||
      p?.lastModifiedAt ||
      p?.lastModified?.time ||
      Date.now();
    const date = new Date(Number(created)).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const permalink = pickPermalink(p);

    return {
      date,
      title: text ? text.split("\n")[0].slice(0, 70) : "LinkedIn update",
      excerpt: excerpt || "New update from Fulcrum.",
      url: permalink,
      image: pickImage(p),
    };
  });

  postsCache.set(companyId, { ts: Date.now(), posts });
  return posts;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true });
    }

    if (url.pathname === "/api/linkedin/auth") {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        return sendJson(res, 500, {
          error: "Missing LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET",
          hint: "Copy .env.example to .env and fill in values, then restart `npm run dev:api`.",
        });
      }

      const state = crypto.randomBytes(16).toString("hex");
      validStates.add(state);

      const auth = new URL("https://www.linkedin.com/oauth/v2/authorization");
      auth.searchParams.set("response_type", "code");
      auth.searchParams.set("client_id", CLIENT_ID);
      auth.searchParams.set("redirect_uri", REDIRECT_URI);
      auth.searchParams.set("state", state);
      auth.searchParams.set("scope", SCOPE.split(/\s+/).join(" "));

      return redirect(res, auth.toString());
    }

    if (url.pathname === "/api/linkedin/callback") {
      const code = url.searchParams.get("code") || "";
      const state = url.searchParams.get("state") || "";
      const error = url.searchParams.get("error");

      if (error) {
        return sendHtml(
          res,
          400,
          `<h1>LinkedIn auth failed</h1><p>${String(error)}</p>`
        );
      }

      if (!code || !state || !validStates.has(state)) {
        return sendHtml(res, 400, "<h1>Invalid auth callback</h1>");
      }

      validStates.delete(state);

      await exchangeCodeForToken(code);

      // Simple success page
      return sendHtml(
        res,
        200,
        `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>LinkedIn Connected</title></head>
  <body style="font-family:system-ui;padding:24px">
    <h1>LinkedIn connected</h1>
    <p>You can close this tab and refresh your site.</p>
  </body>
</html>`
      );
    }

    if (url.pathname === "/api/linkedin/posts") {
      const companyId = url.searchParams.get("companyId") || "";
      const limit = Math.min(12, Math.max(1, Number(url.searchParams.get("limit") || 3)));

      if (!companyId) {
        return sendJson(res, 400, { error: "Missing companyId" });
      }

      if (!isTokenValid()) {
        return sendJson(res, 200, {
          needsAuth: true,
          authUrl: "/api/linkedin/auth",
          posts: [],
        });
      }

      const posts = await fetchOrgPosts({ companyId, limit });
      return sendJson(res, 200, { posts });
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (e) {
    return sendJson(res, 500, { error: "Server error", detail: String(e?.message || e) });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${PORT}`);
});

