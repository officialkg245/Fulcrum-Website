const SITE_NAME = "Fulcrum Sales & Marketing";
const BRAND = "Fulcrum";
const FAVICON = "/brand/fulcrum-mark.png";

const ROUTE_TITLES = {
  "/": SITE_NAME,
  "/about": "About",
  "/services": "Services",
  "/services/core": "Core Services",
  "/industries": "Who We Serve",
  "/industries/government": "Government",
  "/case-studies": "Case Studies",
  "/action": "Action Plan",
  "/blogs": "Blog",
  "/academy": "Academy",
  "/academy/track/sales": "Academy — Sales Track",
  "/academy/track/operations": "Academy — Operations Track",
  "/consultation": "Book a Consultation",
};

function formatTitle(pageTitle) {
  if (!pageTitle || pageTitle === SITE_NAME) return SITE_NAME;
  return `${pageTitle} | ${BRAND}`;
}

function truncate(text, max = 58) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export function getPageTitle(pathname, { blogPosts = [] } = {}) {
  const path = pathname || "/";

  if (path.startsWith("/blogs/") && path.length > "/blogs/".length) {
    const slug = path.slice("/blogs/".length).split("/")[0];
    const post = blogPosts.find((p) => p.slug === slug);
    if (post?.title) return formatTitle(truncate(post.title));
    return formatTitle("Blog Post");
  }

  const exact = ROUTE_TITLES[path];
  if (exact) return exact === SITE_NAME ? SITE_NAME : formatTitle(exact);

  return SITE_NAME;
}

function upsertLink(rel, attrs = {}) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null) link.setAttribute(key, value);
  }
  return link;
}

export function applyBrandFavicon() {
  upsertLink("icon", { type: "image/png", href: FAVICON });
  upsertLink("shortcut icon", { type: "image/png", href: FAVICON });
  upsertLink("apple-touch-icon", { href: FAVICON });
}

export function applyPageMeta(pathname, options) {
  document.title = getPageTitle(pathname, options);
  applyBrandFavicon();
}
