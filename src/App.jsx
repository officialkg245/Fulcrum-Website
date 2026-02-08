import React, { useState, useMemo, useRef, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  GraduationCap,
  Briefcase,
  Phone,
  Calendar,
  CheckCircle2,
  BarChart3,
  Megaphone,
  Workflow,
  Handshake,
  Sparkles,
  Linkedin,
  Building2,
  HeartPulse,
  Store,
  Landmark,
  Factory,
  Laptop,
} from "lucide-react";
// TEMP UI COMPONENTS (fast fix – no shadcn needed)
// UI COMPONENTS (no shadcn needed, but styled)
function Button({ className = "", variant = "solid", children, href, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition " +
    "focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed";

  // sensible defaults so buttons don’t look “unstyled”
  const variants = {
    solid:
      "px-6 py-3 rounded-full shadow-sm hover:shadow " +
      "active:translate-y-[1px]",
    ghost:
      "px-6 py-3 rounded-full bg-transparent hover:bg-black/5 border border-transparent",
    outline:
      "px-6 py-3 rounded-full border border-black/10 bg-white hover:bg-black/5",
  };

  const Comp = href ? "a" : "button";
  return (
    <Comp
      {...props}
      href={href}
      className={`${base} ${variants[variant] || variants.solid} ${className}`}
    >
      {children}
    </Comp>
  );
}

function Card({ className = "", children }) {
  return (
    <div
      className={
        "rounded-3xl border border-black/10 bg-white shadow-sm " + className
      }
    >
      {children}
    </div>
  );
}

function CardContent({ className = "", children }) {
  return <div className={"p-8 md:p-10 " + className}>{children}</div>;
}


/*
  FULCRUM LOGO THEME
  Cream:    #F3EFE6
  Gold:     #D6A21E
  Charcoal: #121212
*/

const theme = {
  cream: "#F3EFE6",
  gold: "#D6A21E",
  goldDark: "#B88A16",
  charcoal: "#121212",
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LimitedTimePill({ className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase",
        "px-3 py-1 rounded-full border",
        "bg-[#D6A21E]/15 text-[#D6A21E] border-[#D6A21E]/35",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#D6A21E] shadow-[0_0_18px_rgba(214,162,30,0.7)]" />
      Limited time
    </span>
  );
}

function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="bg-[#0F0F0F] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LimitedTimePill className="bg-[#D6A21E]/20" />
          <p className="text-sm text-white/80">
            <span className="font-semibold text-white">Limited-time free consultation</span> is available for a limited time.
            <span className="hidden sm:inline"> Get a 30-day action plan on the call.</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/consultation">
            <Button className="h-9 rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-5">
              Book now <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white text-sm px-2"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingConsultCTA() {
  return (
    <div className="fixed z-[60] bottom-5 right-5 md:bottom-6 md:right-6">
      <div className="rounded-3xl border border-black/10 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <LimitedTimePill className="bg-[#D6A21E]/15" />
              </div>
              <div className="mt-2 text-sm font-black text-[#121212]">Limited-time free consultation</div>
              <div className="text-xs text-black/60">Get your next 30 days mapped.</div>
            </div>
            <Link to="/consultation">
              <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-5">
                Book
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#121212] border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
        <Link
          to="/"
          className="font-black text-2xl tracking-tight text-[#D6A21E]"
        >
          Fulcrum
        </Link>

        <div className="flex gap-8 text-sm font-semibold items-center text-white">
          <Link className="hover:text-[#D6A21E]" to="/about">
            About & Contact
          </Link>
          <Link className="hover:text-[#D6A21E]" to="/services">
            Services
          </Link>
          <Link className="hover:text-[#D6A21E]" to="/industries">
            Industries
          </Link>
          <Link className="hover:text-[#D6A21E]" to="/case-studies">
            Case Studies
          </Link>
          <Link className="hover:text-[#D6A21E]" to="/academy">
            Academy
          </Link>
          <Link to="/consultation">
            <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-6">
              Limited-Time Free Consultation
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function FulcrumWebsite() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F3EFE6] text-[#121212]">
        <Navbar />
        <AnnouncementBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/consultation" element={<Consultation />} />
        </Routes>

        <FloatingConsultCTA />

        <footer className="py-12 text-center text-sm text-black/60">
          © {new Date().getFullYear()} Fulcrum Sales & Marketing. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

// Brand logos (place these files in /public with these names)
const brands = [
  { src: "/Winrock-grey-1200x350-1-768x224.png", alt: "Winrock International" },
  { src: "/unnamed-2-cdopy.png", alt: "Client brand" },
  { src: "/viemed-grey-768x411.png", alt: "VieMed" },
  { src: "/hello-world.png", alt: "Hello World" },
  { src: "/fdnnsafa.png", alt: "Client brand" },
  { src: "/abre_grey-removebg-preview.png", alt: "Abre" },
  { src: "/Scoutly-grey-1200x172-1-768x110.png", alt: "Scoutly" },
  { src: "/schoolmint-grey-1200x374-1-768x239.png", alt: "SchoolMint" },
  { src: "/Southern-Miss-768x359.png", alt: "The University of Southern Mississippi" },
  { src: "/skillmasters-grey-1200x345-1-768x221.png", alt: "Skillmasters" },
];

// Homepage "Culture" section data (swap with real links/posts anytime)
const cultureLinkedInPosts = [
  {
    date: "Recent post",
    title: "Momentum in the first 30 days",
    excerpt:
      "How we create early wins without sacrificing quality — and what we measure weekly to keep it compounding.",
    url: "", // paste LinkedIn post URL
    image: "", // optional: paste an image path (e.g. "/culture/post-1.jpg")
  },
  {
    date: "Recent post",
    title: "Scorecards that drive behavior",
    excerpt:
      "The simplest scorecard we’ve seen work across roles — and how to run it without turning it into bureaucracy.",
    url: "", // paste LinkedIn post URL
    image: "",
  },
  {
    date: "Recent post",
    title: "Adaptive execution (no chaos)",
    excerpt:
      "What changes when your business changes — and what should stay constant so execution doesn’t drift.",
    url: "", // paste LinkedIn post URL
    image: "",
  },
];

const linkedInCompanyUrl = "https://www.linkedin.com/company/33227086";
const linkedInCompanyId = "33227086";

const culturePartnerships = [
  {
    name: "Stuller",
    desc: "Over 200% increase in closing percentages compared year over year after sales training program implementation.",
    logo: "/partnerships/stuller.png",
    photo: "/partnerships/stuller.png",
    photoPos: "50% 55%",
  },
  {
    name: "VieMed",
    desc: "More than 600 target customers identified, 10 decision makers engaged, $1.5M in new revenue captured leading to 200% ROI.",
    logo: "/viemed-grey-768x411.png",
    photo: "/partnerships/viemed.png",
    photoPos: "50% 35%",
  },
  {
    name: "YPS Anesthesia",
    desc: "Public medical DME launches new geographic markets, trains in-house outside sales team, and launches inside sales program while launching new product lines in new customer markets.",
    logo: "/partnerships/yps.png",
    photo: "/partnerships/yps.png",
    photoPos: "50% 45%",
  },
];

function BrandsMarquee({ items, showFades = true }) {
  const row = [...items, ...items, ...items, ...items];

  return (
    <div className="relative">
      {/* Edge fades */}
      {showFades ? (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
        </>
      ) : null}

      <div className="overflow-hidden">
        <div className="fulcrum-marquee flex items-center gap-12">
          {row.map((b, idx) => (
            <div
              key={`${b.src}-${idx}`}
              className="h-14 md:h-16 w-[180px] md:w-[220px] flex items-center justify-center"
            >
              <img
                src={b.src}
                alt={b.alt}
                className="max-h-full max-w-full object-contain opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:drop-shadow-[0_0_12px_rgba(214,162,30,0.45)]"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .fulcrum-marquee {
          width: max-content;
          will-change: transform;
          animation: fulcrum-marquee 40s linear infinite;
          padding: 10px 0;
        }
        .fulcrum-marquee:hover {
          animation-duration: 70s; /* slow down instead of hard pause */
        }
        @keyframes fulcrum-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fulcrum-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

function LinkedInFollowCompany({ companyId = "33227086" }) {
  // Loads LinkedIn's plugin script once, then renders the widget.
  React.useEffect(() => {
    if (document.querySelector('script[src^="https://platform.linkedin.com/in.js"]')) return;
    const s = document.createElement("script");
    s.src = "https://platform.linkedin.com/in.js";
    s.type = "text/javascript";
    s.async = true;
    s.innerHTML = "lang: en_US";
    document.body.appendChild(s);
  }, []);

  // LinkedIn parses <script type="IN/FollowCompany"> into a widget.
  return (
    <div
      className="linkedin-follow-company"
      dangerouslySetInnerHTML={{
        __html: `<script type="IN/FollowCompany" data-id="${companyId}" data-counter="right"></script>`,
      }}
    />
  );
}

function useLinkedInPosts({ companyId, limit = 3, fallbackPosts = [] }) {
  const cacheKey = `fulcrum:linkedin:${companyId}:posts:v1`;
  const ttlMs = 15 * 60 * 1000; // 15 minutes

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return { status: "loading", posts: fallbackPosts, needsAuth: false, authUrl: "" };
      const parsed = JSON.parse(raw);
      const isFresh = parsed?.ts && Date.now() - parsed.ts < ttlMs;
      const cachedPosts = Array.isArray(parsed?.posts) ? parsed.posts : null;
      if (cachedPosts?.length) {
        return { status: isFresh ? "ready" : "stale", posts: cachedPosts, needsAuth: false, authUrl: "" };
      }
      return { status: "loading", posts: fallbackPosts, needsAuth: false, authUrl: "" };
    } catch {
      return { status: "loading", posts: fallbackPosts, needsAuth: false, authUrl: "" };
    }
  });

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      // If we're already fresh, don't refetch immediately.
      if (state.status === "ready") return;

      try {
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        const res = await fetch(
          `/api/linkedin/posts?companyId=${encodeURIComponent(companyId)}&limit=${encodeURIComponent(
            String(limit)
          )}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Bad response: ${res.status}`);

        const data = await res.json();
        if (data?.needsAuth) {
          if (!cancelled) {
            setState((prev) => ({
              status: prev.posts?.length ? "ready" : "needs_auth",
              posts: prev.posts?.length ? prev.posts : fallbackPosts,
              needsAuth: true,
              authUrl: data.authUrl || "/api/linkedin/auth",
            }));
          }
          return;
        }
        const posts = Array.isArray(data?.posts) ? data.posts : null;
        if (!posts?.length) throw new Error("No posts returned");

        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), posts }));
        } catch {
          // ignore quota errors
        }

        if (!cancelled) setState({ status: "ready", posts, needsAuth: false, authUrl: "" });
      } catch {
        if (!cancelled) {
          // Keep whatever we have (cached/fallback), just mark as ready-ish
          setState((prev) => ({ ...prev, status: prev.posts?.length ? "ready" : "error" }));
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, limit]);

  return state;
}

function LinkedInPostSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="h-40 bg-black/20 border-b border-white/10" />
      <div className="p-7">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="mt-4 h-4 w-3/4 rounded bg-white/10" />
        <div className="mt-3 h-4 w-5/6 rounded bg-white/10" />
        <div className="mt-3 h-4 w-2/3 rounded bg-white/10" />
        <div className="mt-6 h-4 w-28 rounded bg-white/10" />
      </div>
    </div>
  );
}

function Home() {
  const li = useLinkedInPosts({
    companyId: linkedInCompanyId,
    limit: 3,
    fallbackPosts: cultureLinkedInPosts,
  });

  return (
    <>
      {/* BBB badge (home only) */}
      <div className="fixed z-[40] left-4 bottom-4 md:left-6 md:bottom-6">
        <div className="rounded-2xl border border-white/10 bg-[#121212]/55 backdrop-blur-md shadow-lg px-4 py-3">
          <img
            src="/badges/bbb-accredited.png"
            alt="BBB Accredited Business"
            className="h-8 md:h-9 w-auto opacity-80 brightness-0 invert"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      {/* HERO (Luxury, centered) */}
      <section className="relative overflow-hidden bg-[#121212] text-white overflow-hidden">
        

        {/* Ambient gold glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#D6A21E]/20 blur-[120px]" />
          <div className="absolute -bottom-64 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/10 blur-[160px]" />
        </div>
        {/* Logo backdrop */}
        <div className="pointer-events-none absolute inset-0">
          <svg
            className="absolute right-36 md:right-[20rem] top-0 md:top-[-0.5rem] w-[620px] md:w-[760px] opacity-[0.08] rotate-3"
            viewBox="0 0 1024 1024"
            aria-hidden="true"
          >
            <g fill="#D6A21E">
              <polygon points="260,280 900,280 860,380 220,380" />
              <polygon points="300,470 720,470 680,585 260,585" />
              <polygon points="360,660 560,660 530,770 330,770" />
            </g>
          </svg>
          <div className="absolute left-10 bottom-10 h-40 w-40 rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-[1px]" />
          <div className="absolute right-28 bottom-16 h-20 w-20 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute left-1/2 top-6 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute right-20 top-40 h-16 w-16 rounded-full bg-[#D6A21E]/10 blur-[2px]" />
        </div>
        {/* Texture + pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-screen">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="hero-dots-dark" width="26" height="26" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(214,162,30,0.25)" />
              </pattern>
              <linearGradient id="hero-sweep-dark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(214,162,30,0.08)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-dark)" />
            <rect width="100%" height="100%" fill="url(#hero-sweep-dark)" />
            <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
              <line x1="-10%" y1="20%" x2="110%" y2="0%" />
              <line x1="-10%" y1="55%" x2="110%" y2="35%" />
              <line x1="-10%" y1="90%" x2="110%" y2="70%" />
            </g>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-28">
          <div className="grid lg:grid-cols-3 gap-10 items-center">
            {/* Left luxury copy */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.55)]" />
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                  Sales & Marketing
                </p>
              </div>

              {/* Brand wordmark */}
              <h1 className="mt-5 leading-none">
                <span className="block text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                  Fulcrum
                </span>
                <span className="block mt-4 text-3xl md:text-5xl font-black tracking-tight text-white">
                  Elite execution for predictable revenue.
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mt-6 max-w-2xl">
                We design sales systems, train performers, and install execution rhythms
                that compound results — without chaos.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/consultation">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-12 py-6 text-lg shadow-[0_0_40px_rgba(214,162,30,0.35)]">
                    Limited-time free consultation <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/case-studies">
                  <Button className="bg-white/10 text-white hover:bg-white/20 rounded-full px-12 py-6 text-lg">
                    View results
                  </Button>
                </Link>
              </div>

            </div>

            {/* Right glass card */}
            <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
              <p className="text-sm font-semibold text-white/70">Fulcrum Advantage</p>
              <div className="mt-6 space-y-4 text-white/80">
                <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Sales + marketing aligned into one system</span></div>
                <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Live coaching and execution cadence</span></div>
                <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Metrics tied directly to revenue</span></div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Lift</div>
                  <div className="font-black mt-1">2–4w</div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Focus</div>
                  <div className="font-black mt-1">KPIs</div>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Model</div>
                  <div className="font-black mt-1">Repeatable</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Full-bleed marquee */}
        <div className="mt-14 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
          <div className="bg-white/5 border-y border-white/10 backdrop-blur-sm py-6 w-screen overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    Trusted by teams building real revenue
                  </h2>
                  <p className="text-white/70 mt-2">A few of the brands we’ve worked with.</p>
                </div>
                <Link to="/case-studies">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-6">
                    See results <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-6 w-screen">
              <BrandsMarquee items={brands} showFades={false} />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="px-6 pt-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.35)]" />
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                  Services
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3">
                What we <span className="text-[#D6A21E]">do</span>
              </h2>
              <div className="mt-4 h-px w-56 bg-gradient-to-r from-[#D6A21E] via-black/20 to-transparent" />
              <p className="text-black/70 mt-3 max-w-2xl">
                Fulcrum helps organizations of all types create momentum quickly. We help you compound that momentum over time through continuous learning, clear scorecards, and adaptive execution as your business changes.
              </p>
            </div>
            <Link to="/services">
              <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8">Explore services</Button>
            </Link>
          </div>

          <div className="mt-10 grid lg:grid-cols-3 gap-8">
            <PreviewCard
              icon={<TrendingUp />}
              title="Business development"
              desc="Building predictable revenue through sales systems, partnerships, and execution." 
            />
            <PreviewCard
              icon={<Briefcase />}
              title="Corporate development"
              desc="Optimizing strategy, operations, and growth initiatives to scale organizations." 
            />
            <PreviewCard
              icon={<Users />}
              title="People development"
              desc="Training, coaching, and leadership pipelines that turn talent into performers." 
            />
          </div>
        </div>
      </section>

      {/* EXPLORE OUR CULTURE (multi-section, content-ready) */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#121212] text-white">
            {/* ambient accents */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-[#D6A21E]/18 rotate-12 rounded-[88px] blur-[40px]" />
              <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] bg-white/10 -rotate-12 rounded-[88px] blur-[60px]" />
              <div className="absolute left-1/2 top-10 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <div className="relative p-10 md:p-12">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.35)]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                      Explore our culture
                    </p>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
                    High standards. <span className="text-[#D6A21E]">Higher</span> support.
                  </h2>
                  <p className="text-white/70 mt-5 text-lg">
                    A living snapshot — updates, partnerships, and the people building the work.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/about">
                    <Button className="rounded-full bg-white/10 text-white hover:bg-white/15 px-8">
                      Meet the team <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                  <Link to="/academy">
                    <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-8">
                      Fulcrum Academy <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-10 grid md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-white/60">
                    Accountability
                  </div>
                  <div className="font-black text-xl mt-3">Scorecards + ownership</div>
                  <p className="text-white/70 mt-3">
                    We measure what matters weekly and execute what moves the needle.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-white/60">
                    Coaching
                  </div>
                  <div className="font-black text-xl mt-3">Reps + feedback loops</div>
                  <p className="text-white/70 mt-3">
                    Continuous learning built into execution — not “training once.”
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-white/60">
                    Systems-first
                  </div>
                  <div className="font-black text-xl mt-3">Repeatable playbooks</div>
                  <p className="text-white/70 mt-3">
                    Processes that scale outcomes without relying on heroics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ON LINKEDIN */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#121212] text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/16 rotate-12 rounded-[88px] blur-[50px]" />
              <div className="absolute -bottom-36 -left-36 w-[520px] h-[520px] bg-white/10 -rotate-12 rounded-[88px] blur-[70px]" />
              <div className="absolute left-1/2 top-10 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            <div className="relative p-10 md:p-12">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.35)]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                      Explore our culture • Latest on LinkedIn
                    </p>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mt-4">
                    Posts, wins, and what we’re learning.
                  </h3>
                  <p className="text-white/70 mt-4">
                    This section is ready for your newest posts. Add links and optional images when you’re ready.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a href={linkedInCompanyUrl} target="_blank" rel="noreferrer">
                  <Button className="rounded-full bg-white/10 text-white hover:bg-white/15 px-8">
                    Follow on LinkedIn <ArrowRight className="ml-2" />
                  </Button>
                  </a>
                  {li.needsAuth ? (
                    <a href={li.authUrl || "/api/linkedin/auth"}>
                      <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-8">
                        Connect LinkedIn <ArrowRight className="ml-2" />
                      </Button>
                    </a>
                  ) : null}
                  <div className="hidden md:block">
                    <LinkedInFollowCompany companyId={linkedInCompanyId} />
                  </div>
                </div>
              </div>

              <div className="mt-10 grid md:grid-cols-3 gap-6">
                {li.status === "loading" && !li.posts?.length ? (
                  <>
                    <LinkedInPostSkeleton />
                    <LinkedInPostSkeleton />
                    <LinkedInPostSkeleton />
                  </>
                ) : (
                  li.posts.slice(0, 3).map((p) => (
                    <div
                      key={p.url || p.title}
                      className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
                    >
                      <div className="h-40 bg-black/20 border-b border-white/10 relative overflow-hidden">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-white/45 text-sm font-semibold">
                            Post image / preview
                          </div>
                        )}
                      </div>
                      <div className="p-7">
                        <div className="text-xs font-semibold uppercase tracking-wide text-white/55">
                          {p.date}
                        </div>
                        <div className="font-black text-xl mt-3">{p.title}</div>
                        <p className="text-white/70 mt-3 leading-relaxed">{p.excerpt}</p>
                        <div className="mt-5">
                          {p.url ? (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D6A21E] hover:text-[#F2D27A]"
                            >
                              View post <ArrowRight size={16} />
                            </a>
                          ) : (
                            <span className="text-xs text-white/50">Add post URL to enable link</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIPS */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#121212] text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 -left-28 w-[420px] h-[420px] bg-[#D6A21E]/14 -rotate-12 rounded-[88px] blur-[50px]" />
              <div className="absolute -bottom-36 -right-36 w-[520px] h-[520px] bg-white/10 rotate-12 rounded-[88px] blur-[70px]" />
            </div>

            <div className="relative p-10 md:p-12">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                      Client outcomes
                    </p>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mt-4">
                    Work that creates measurable momentum.
                  </h3>
                  <p className="text-white/70 mt-4">
                    A few examples of the results we’ve helped clients capture — with systems, coaching, and execution.
                  </p>
                </div>

                <Link to="/about">
                  <Button className="rounded-full bg-white/10 text-white hover:bg-white/15 px-8">
                    See more <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid md:grid-cols-3 gap-6">
                {culturePartnerships.map((p) => (
                  <div
                    key={p.name}
                    className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-sm hover:shadow-lg transition"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
                      {p.photo ? (
                        <img
                          src={p.photo}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          style={{ objectPosition: p.photoPos || "50% 50%" }}
                          loading="lazy"
                          draggable={false}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb =
                              e.currentTarget.parentElement?.querySelector("[data-fallback]");
                            if (fb) fb.style.display = "grid";
                          }}
                        />
                      ) : null}
                      <div
                        data-fallback
                        style={{ display: p.photo ? "none" : "grid" }}
                        className="absolute inset-0 grid place-items-center text-white/45 text-sm font-semibold"
                      >
                        Partnership photo
                      </div>
                    </div>
                    <div className="p-7 md:p-8">
                      <div className="flex items-center gap-3">
                        <div className="font-black text-xl text-white">{p.name}</div>
                      </div>
                      <p className="text-white/75 mt-4 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PEOPLE PATHWAYS */}
      <section className="px-6 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#121212] text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 -left-28 w-[420px] h-[420px] bg-[#D6A21E]/14 -rotate-12 rounded-[88px] blur-[50px]" />
              <div className="absolute -bottom-36 -right-36 w-[520px] h-[520px] bg-white/10 rotate-12 rounded-[88px] blur-[70px]" />
              <div className="absolute left-1/2 top-10 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            <div className="relative p-10 md:p-12">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.35)]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                      Explore our culture • People + pathways
                    </p>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mt-4">
                    Meet leadership or join the pipeline.
                  </h3>
                  <p className="text-white/70 mt-4">
                    Two clear paths — get to know the team, or explore the Academy for growth and coaching.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid md:grid-cols-2 gap-6">
                <Link to="/about" className="group">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-10 hover:bg-white/[0.07] transition">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                      Meet the team
                    </div>
                    <div className="mt-4 text-2xl font-black group-hover:text-[#D6A21E] transition">
                      The people behind the work
                    </div>
                    <div className="mt-4 text-white/70">
                      Leadership profiles, roles, and what we’re building.
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 font-semibold text-[#D6A21E]">
                      Explore <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>

                <Link to="/academy" className="group">
                  <div className="rounded-3xl border border-white/10 bg-white/5 text-white p-10 hover:bg-white/[0.07] transition relative overflow-hidden">
                    <div className="pointer-events-none absolute -top-24 -right-24 w-[260px] h-[260px] bg-[#D6A21E]/18 rotate-12 rounded-[56px]" />
                    <div className="relative">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                        Fulcrum Academy
                      </div>
                      <div className="mt-4 text-2xl font-black group-hover:text-[#D6A21E] transition">
                        Coaching + growth path
                      </div>
                      <div className="mt-4 text-white/70">
                        Recruiting + onboarding funnel for people who want reps and leadership.
                      </div>
                      <div className="mt-8 inline-flex items-center gap-2 font-semibold text-[#D6A21E]">
                        Explore <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mt-10 flex justify-center">
                <Link to="/consultation">
                  <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-10 py-6 text-lg">
                    Book a consultation <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/55">
        {label}
      </div>
      <div className="text-white font-bold mt-1">{value}</div>
    </div>
  );
}

function MiniMetric({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</div>
      <div className="text-3xl font-black text-white mt-2">{value}</div>
      <div className="text-xs text-white/60 mt-2">{note}</div>
    </div>
  );
}

function PreviewCard({ icon, title, desc }) {
  return (
    <Card className="group relative rounded-3xl border border-black/10 bg-gradient-to-br from-white to-[#F3EFE6] shadow-md overflow-hidden">
      {/* gold accent */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[220px] h-[220px] bg-[#D6A21E]/20 rotate-12 rounded-[40px] blur-[20px] transition-opacity duration-300 group-hover:opacity-80" />

      <CardContent className="relative p-10">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center shadow">
            {icon}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-black/50">Core</span>
        </div>

        <h4 className="text-2xl font-black mt-6 group-hover:text-[#D6A21E] transition">{title}</h4>
        <p className="text-black/70 mt-3 leading-relaxed">{desc}</p>

        <div className="mt-8 flex items-center gap-3">
          <Link to="/consultation">
            <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-8">
              Get started
            </Button>
          </Link>
          <span className="text-sm text-black/50 group-hover:text-black/70 transition">→</span>
        </div>
      </CardContent>
    </Card>
  );
}

function About() {
  return (
    <>
      {/* About Hero (light + unique) */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F3EFE6]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-[#D6A21E]/12 rotate-12 rounded-[72px]" />
          <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-[#121212]/6 -rotate-12 rounded-[72px]" />
          <div className="absolute right-10 top-14 h-24 w-24 rounded-full border border-black/10 bg-white/60" />
          <div className="absolute left-16 bottom-10 h-32 w-32 rounded-[40px] border border-black/10 bg-white/50 rotate-6" />
          <div className="absolute left-1/2 top-6 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/15 to-transparent" />
          <div className="absolute right-24 bottom-16 h-12 w-12 rounded-full bg-[#D6A21E]/15" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.2]">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="hero-dots-light" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(0,0,0,0.15)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-light)" />
            <g stroke="rgba(0,0,0,0.08)" strokeWidth="1">
              <line x1="-10%" y1="15%" x2="110%" y2="-5%" />
              <line x1="-10%" y1="50%" x2="110%" y2="30%" />
              <line x1="-10%" y1="85%" x2="110%" y2="65%" />
            </g>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full">
              About Fulcrum
            </p>
            <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
              Built for <span className="text-[#D6A21E]">performance</span>.
            </h2>
            <p className="text-black/70 text-lg md:text-xl mt-6">
              We build sales + marketing systems, train people to run them, and keep execution tight with accountability.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/consultation">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg">
                  Book a free consult <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <a href="#contact">
                <Button className="bg-white text-black hover:bg-white/90 border border-black/10 rounded-full px-10 py-6 text-lg">
                  Contact info
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto space-y-20">
        {/* About Intro */}
        <div className="max-w-4xl relative">
          {/* Louisiana culture silhouettes (background) */}
          <div className="pointer-events-none select-none hidden sm:block absolute -right-96 -top-16 w-[720px] h-[420px] overflow-hidden">
            <img
              src="/shapes/louisiana-silhouette.png"
              alt=""
              aria-hidden="true"
              className="absolute right-10 top-0 w-[420px] opacity-[0.05] mix-blend-multiply blur-[0.2px]"
              style={{ filter: "grayscale(1) contrast(6)" }}
              draggable={false}
            />
            <img
              src="/shapes/crawfish.png"
              alt=""
              aria-hidden="true"
              className="absolute right-[28rem] -top-14 w-[220px] rotate-[-8deg] opacity-[0.05] brightness-0 contrast-200 mix-blend-multiply blur-[0.2px]"
              draggable={false}
            />
          </div>
          <div className="relative inline-block mb-6">
            {/* Beads: original image, pushed further right */}
            <div className="pointer-events-none select-none hidden sm:block absolute -right-72 top-1/2 -translate-y-1/2 w-[260px] h-[220px] overflow-hidden opacity-[0.16] mix-blend-multiply blur-[0.2px]">
              <img
                src="/shapes/beads.png"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-top rotate-[6deg]"
                style={{ filter: "grayscale(1) contrast(10)" }}
                draggable={false}
              />
            </div>
            <h3 className="relative z-10 text-4xl md:text-5xl font-black">Who We Are</h3>
          </div>
          <p className="text-lg text-black/70">
            Founded almost 10 years ago, Fulcrum is a full-service business development firm rooted in Louisiana culture that specializes in proactively growing businesses organically (getting customers) or inorganically (acquisitions).
            <br />
            <br />
            Whether you are a startup, diversifying revenue, launching new products / services, or simply desiring more market-share, Fulcrum has a service offering for you.
          </p>
        </div>

        {/* Values + Mission */}
        <div className="grid md:grid-cols-2 gap-10">
          <Card className="rounded-3xl border border-black/10 bg-white">
            <CardContent className="p-10">
              <h4 className="text-2xl font-black mb-4">Our Mission</h4>
              <p className="text-black/70">
                Help our people achieve their personal, professional, and financial goals.
                <br />
                <br />
                We’re here to build lives we’re proud of — together.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-black/10 bg-white">
            <CardContent className="p-10">
              <h4 className="text-2xl font-black mb-4">What We Value</h4>
              <ul className="space-y-3 text-black/70">
                <li>• Love First, Eat Last</li>
                <li>• Think Big, Act Small</li>
                <li>• Plan for Tomorrow, Execute Today</li>
                <li>• Always Care, Always Compete</li>
                <li>• Beauty Is in the Eye of the Beholder</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="relative">
          <div className="relative z-10 flex items-end justify-between gap-8 flex-wrap mb-10">
            {/* Watermark logo near header */}
            <div className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 z-0">
              <img
                src="/fulcrum-logo.jpg"
                alt=""
                aria-hidden="true"
                className="w-[300px] md:w-[380px] opacity-[0.08] grayscale contrast-125 mix-blend-multiply blur-[0.3px]"
                draggable={false}
              />
            </div>
            <div className="max-w-3xl">
              <h3 className="text-4xl md:text-5xl font-black tracking-tight mt-5">
                Meet the <span className="text-[#D6A21E]">Team</span>
              </h3>
              <div className="mt-4 h-px w-48 bg-gradient-to-r from-[#D6A21E] via-black/20 to-transparent" />
              
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm font-semibold text-black/60">
              <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_18px_rgba(214,162,30,0.45)]" />
              Built on accountability
            </div>
          </div>

          <div className="relative z-10 mt-8">
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member) => (
                <a
                  key={member.name + member.role}
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-3xl border border-black/10 shadow-md hover:shadow-xl transition">
                    <div className="aspect-[3/4] bg-black/5 relative overflow-hidden">
                      {member.img ? (
                        <img
                          src={member.img}
                          alt={member.name}
                          className="h-full w-full object-cover object-[50%_20%] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                          loading="lazy"
                          draggable={false}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = e.currentTarget.parentElement?.querySelector("[data-fallback]");
                            if (fb) fb.style.display = "grid";
                          }}
                        />
                      ) : null}
                      <div
                        data-fallback
                        style={{ display: member.img ? "none" : "grid" }}
                        className="absolute inset-0 grid place-items-center text-black/40"
                      >
                        Photo Slot
                      </div>
                      {/* readability gradient (no blur) */}
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      {/* blur only behind text */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-black/35 backdrop-blur-sm text-center">
                        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 z-20">
                          <div className="h-9 w-9 rounded-full bg-white text-[#121212] grid place-items-center shadow-lg ring-1 ring-black/10">
                            <Linkedin size={16} className="text-[#121212]" />
                          </div>
                        </div>
                        <h4 className="font-black text-lg text-white group-hover:text-[#D6A21E] transition">
                          {member.name}
                        </h4>
                        <p className="text-sm text-white/80 mt-1">{member.role}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="grid md:grid-cols-2 gap-10 items-start">
          <Card className="rounded-3xl border border-black/10 bg-white">
            <CardContent className="p-10">
              <h3 className="text-2xl font-black mb-4">Get in Touch</h3>
              <p className="text-black/70 mb-6">
                Want to work with us, partner with us, or learn more? Reach out directly or book a consultation.
              </p>
              <div className="space-y-3 text-black/70">
                <div className="flex items-center gap-3"><span className="text-[#D6A21E]"><Phone size={18} /></span><span>info@workwithfulcrum.com</span></div>
                <div className="flex items-center gap-3"><span className="text-[#D6A21E]"><Phone size={18} /></span><span>337-306-9436</span></div>
                <div className="flex items-center gap-3"><span className="text-[#D6A21E]"><Target size={18} /></span><span>108 Kol Dr, Broussard, LA 70518</span></div>
              </div>
              <div className="mt-8">
                <Link to="/consultation">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6">
                    Free Consultation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-black/10 bg-white">
            <CardContent className="p-10">
              <h3 className="text-2xl font-black mb-4">Location + Hours</h3>
              <p className="text-black/70 mb-6">
                Remote-friendly, field-ready. We work with teams across regions.
              </p>
              <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Response window</p>
                <p className="text-black/70 mt-2">Mon–Fri • 7:30am–5:30pm</p>
                <p className="text-black/70 mt-2">Average reply: 1–2 business days</p>
              </div>
              <div className="mt-8">
                <Link to="/case-studies">
                  <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6">
                    View case studies <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Google Maps (full-bleed within page) */}
        <div className="mt-16 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <div className="relative overflow-hidden border-y border-black/10">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#F3EFE6] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F3EFE6] to-transparent pointer-events-none" />

            <iframe
              title="Fulcrum Location"
              src="https://www.google.com/maps?q=108%20Kol%20Dr.%20Broussard%2C%20LA%2070518&output=embed"
              className="w-full h-[520px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="absolute bottom-6 right-6">
              <a
                href="https://www.google.com/maps/search/?api=1&query=108%20Kol%20Dr.%20Broussard%2C%20LA%2070518"
                target="_blank"
                rel="noreferrer"
              >
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-6">
                  Get Directions <ArrowRight className="ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const team = [
  {
    name: "Reece Theriot, MBA",
    role: "Founder & CEO",
    description:
      "Leads company vision, strategy, and execution. Focused on building scalable sales systems and developing high-performing leaders.",
    linkedin: "https://www.linkedin.com/in/reecetheriot/",
    img: "/team/reece.png",
  },
  {
    name: "Patrick Hundley",
    role: "Director of Systems & Account Manager",
    description:
      "Designs and manages internal systems and client operations to ensure consistency, performance, and accountability across accounts.",
    linkedin: "https://www.linkedin.com/in/patrick-hundley-78a38313b/",
    img: "/team/patrick.png",
  },
  {
    name: "Brian Dupont",
    role: "Director of Value & Account Manager",
    description:
      "Ensures client value delivery by aligning strategy with execution and optimizing performance outcomes.",
    linkedin: "https://www.linkedin.com/in/brian-dupont-092b79129/",
    img: "/team/brian.png",
  },
  {
    name: "Tristin Tauzin",
    role: "Director of Talent & Account Manager",
    description:
      "Leads recruiting, onboarding, and talent development while supporting client growth initiatives.",
    linkedin: "https://www.linkedin.com/in/tristin-tauzin-6225b8164/",
    img: "/team/tristin.png",
  },
  {
    name: "Bret Blanchard",
    role: "Director of Process & Account Manager",
    description:
      "Builds and refines operational processes that keep teams efficient, consistent, and scalable.",
    linkedin: "https://www.linkedin.com/in/bret-blanchard/",
    img: "/team/bret.png",
  },
  {
    name: "Lauren Day",
    role: "Head of Accounting & Finance",
    description:
      "Oversees financial operations, budgeting, and reporting to support sustainable growth.",
    linkedin: "https://www.linkedin.com/in/laurenschoeffler/",
    img: "/team/lauren.png",
  },
];

function Services() {
  const offerings = [
    {
      icon: <Workflow />,
      title: "Sales Systems & Execution",
      summary: "Build a repeatable pipeline and close process — then run it with discipline.",
      bullets: [
        "Pipeline + funnel audit",
        "Offer + script refinement",
        "Outbound/field execution playbook",
        "Lead tracking + reporting cadence",
        "Team performance coaching",
      ],
      outcomes: ["More qualified conversations", "Higher close rate", "Cleaner follow-up"],
    },
    {
      icon: <Megaphone />,
      title: "Growth Marketing",
      summary: "Get in front of the right people with messaging that converts.",
      bullets: [
        "Positioning + audience targeting",
        "Campaign planning + rollout",
        "Landing page + offer alignment",
        "Retargeting + nurture strategy",
        "Weekly optimization review",
      ],
      outcomes: ["Better lead quality", "Lower acquisition cost", "Consistent demand"],
    },
    {
      icon: <BarChart3 />,
      title: "Performance & Strategy",
      summary: "Measure what matters, cut the noise, and make decisions fast.",
      bullets: [
        "KPI setup (leads, CAC, LTV, close rate)",
        "Sales cycle + bottleneck analysis",
        "Weekly growth scorecard",
        "Quarterly strategy refresh",
        "Team accountability rhythms",
      ],
      outcomes: ["Clear visibility", "Faster iterations", "Less wasted spend"],
    },
    {
      icon: <Handshake />,
      title: "Field Marketing & Partnerships",
      summary: "In-person and partner-driven growth — done with structure and follow-through.",
      bullets: [
        "Event/field team setup",
        "Partnership outreach + scripts",
        "Booth/table messaging kits",
        "Lead capture + follow-up system",
        "Post-event conversion sprint",
      ],
      outcomes: ["More booked meetings", "Stronger relationships", "Higher event ROI"],
    },
    {
      icon: <Target />,
      title: "Brand Positioning",
      summary: "Tight messaging, strong offers, and a brand that earns trust fast.",
      bullets: [
        "Messaging framework",
        "Offer packaging",
        "Brand voice + tone",
        "Sales enablement one-pagers",
        "Website copy refinement",
      ],
      outcomes: ["Clear differentiation", "Higher conversion", "More confidence"],
    },
    {
      icon: <Sparkles />,
      title: "Team Training (Fulcrum Method)",
      summary: "Training programs that turn reps into consistent performers.",
      bullets: [
        "Onboarding curriculum",
        "Role-play + objection handling",
        "Daily/weekly cadence",
        "Leadership development",
        "Performance improvement plans",
      ],
      outcomes: ["Faster ramp", "Better consistency", "Strong culture"],
    },
  ];

  const process = [
    {
      step: "01",
      title: "Audit",
      desc: "We review your pipeline, messaging, and execution to find leverage points.",
    },
    {
      step: "02",
      title: "Plan",
      desc: "We build a simple, repeatable plan with clear metrics and ownership.",
    },
    {
      step: "03",
      title: "Execute",
      desc: "We launch fast, train the team, and run the cadence with you.",
    },
    {
      step: "04",
      title: "Optimize",
      desc: "Weekly scorecards + iteration so results keep compounding.",
    },
  ];

  const packages = [
    {
      name: "Launch",
      tag: "Best for new systems",
      bullets: [
        "Audit + 30-day plan",
        "Core scripts + offers",
        "Weekly scorecard",
        "Team coaching session",
      ],
    },
    {
      name: "Scale",
      tag: "Best for growth",
      bullets: [
        "Everything in Launch",
        "Campaign + channel buildout",
        "Process + cadence implementation",
        "Conversion optimization",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      tag: "Best for teams",
      bullets: [
        "Everything in Scale",
        "Multi-team training",
        "Custom reporting",
        "Partnership/field program",
      ],
    },
  ];

  const faqs = [
    {
      q: "What industries do you work with?",
      a: "We work with growth-focused teams across industries. If you have a real offer and want consistent pipeline + execution, we can help.",
    },
    {
      q: "Do you do only marketing or only sales?",
      a: "Both — but always tied to results. We align messaging, acquisition, and the close process so leads don’t die on the vine.",
    },
    {
      q: "How fast can we see results?",
      a: "Usually you’ll see movement within 2–4 weeks (more conversations + cleaner pipeline). Bigger lifts compound over 60–90 days.",
    },
    {
      q: "What do you need from us to start?",
      a: "Access to your current metrics (even if messy), clarity on your offer, and a point person who can move quickly.",
    },
  ];

  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* Services Hero */}
      <section className="relative bg-[#121212] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-44 -left-44 w-[640px] h-[640px] bg-[#D6A21E]/18 rotate-12 rounded-[80px]" />
          <div className="absolute -bottom-52 -right-52 w-[640px] h-[640px] bg-white/8 -rotate-12 rounded-[80px]" />
          <div className="absolute right-24 top-20 h-28 w-28 rounded-full border border-white/10 bg-white/5" />
          <div className="absolute left-20 bottom-16 h-40 w-40 rounded-[52px] border border-white/10 bg-white/5 rotate-12" />
          <div className="absolute left-1/2 top-8 h-px w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute right-12 bottom-12 h-10 w-10 rounded-full bg-[#D6A21E]/20" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-screen">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="hero-dots-services" width="26" height="26" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(214,162,30,0.22)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-services)" />
            <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
              <line x1="-10%" y1="18%" x2="110%" y2="-2%" />
              <line x1="-10%" y1="52%" x2="110%" y2="32%" />
              <line x1="-10%" y1="86%" x2="110%" y2="66%" />
            </g>
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-white/75 bg-white/10 px-4 py-2 rounded-full">
              Services
            </p>
            <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
              Services that turn activity into <span className="text-[#D6A21E]">revenue</span>.
            </h2>
            <p className="text-white/70 text-lg md:text-xl mt-6">
              Strategy is useless without execution. We build the system, train the people, and run the cadence.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Get a Free Plan <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/case-studies">
                <Button className="bg-white/10 text-white hover:bg-white/15 rounded-full px-10 py-6 text-lg">
                  View Case Studies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-3xl md:text-4xl font-black">Core service lines</h3>
              <p className="text-black/70 mt-3 max-w-2xl">
                Pick one lane or combine them — we’ll build the most efficient path to growth.
              </p>
            </div>
            <Link to="/consultation">
              <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8">
                Talk to us
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid lg:grid-cols-3 gap-8">
            {offerings.map((s) => (
              <ServiceBlock key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-black/10 p-10 md:p-12">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h3 className="text-3xl md:text-4xl font-black">How we work</h3>
                <p className="text-black/70 mt-3 max-w-2xl">
                  Simple process, high accountability. No chaos. No guessing.
                </p>
              </div>
              <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full">
                Fulcrum Method
              </span>
            </div>

            <div className="mt-10 grid md:grid-cols-4 gap-6">
              {process.map((p) => (
                <div key={p.step} className="rounded-3xl border border-black/10 bg-[#F3EFE6] p-8">
                  <div className="text-[#D6A21E] font-black text-3xl">{p.step}</div>
                  <div className="font-black text-xl mt-3">{p.title}</div>
                  <p className="text-black/70 mt-3 text-sm">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-3xl md:text-4xl font-black">Engagement options</h3>
              <p className="text-black/70 mt-3 max-w-2xl">
                Choose the intensity that matches your goals. We’ll recommend the best fit during the consultation.
              </p>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {packages.map((p) => (
              <PackageCard key={p.name} {...p} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/consultation">
              <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                Get recommended package <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-black">FAQ</h3>
          <p className="text-black/70 mt-3">Quick answers before we talk.</p>

          <div className="mt-8 space-y-4">
            {faqs.map((f, idx) => (
              <FAQItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={openFaq === idx}
                onToggle={() => setOpenFaq((v) => (v === idx ? -1 : idx))}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-[#121212] text-white p-10 md:p-12 border border-white/10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#D6A21E]/20 rotate-12 rounded-[56px]" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-black">Want a plan in 60 minutes?</h3>
                <p className="text-white/70 mt-3 max-w-2xl">
                  Book the free consultation. We’ll identify leverage points and map your next 30 days.
                </p>
              </div>
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Book free consultation <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Industries() {
  const industries = [
    {
      icon: <Sparkles />,
      title: "Startups",
      desc: "Clarify the offer, pick the right ICP, and build a simple system that creates pipeline without chaos.",
      bullets: ["Offer + ICP clarity", "Early outbound + messaging", "Founder-led sales system"],
      caseCategory: "Marketing",
      exampleImage: "/industries/conveymd-vertical.png",
      exampleAlt: "ConveyMD",
    },
    {
      icon: <Building2 />,
      title: "Enterprise Teams",
      desc: "Tighten execution across stakeholders, regions, and teams with scorecards, cadence, and accountable follow-through.",
      bullets: ["Pipeline + forecast hygiene", "Sales execution cadence", "Cross-team enablement"],
      caseCategory: "Sales",
      exampleImage: "/industries/lhc-vertical.png",
      exampleAlt: "LHC Group",
    },
    {
      icon: <Handshake />,
      title: "Nonprofits",
      desc: "Build sustainable growth through partnerships, clearer messaging, and consistent outreach that supports the mission.",
      bullets: ["Partner + donor outreach", "Message clarity + positioning", "Execution scorecards"],
      caseCategory: "Partnerships",
      exampleImage: "/industries/catholic-charities-vertical.png",
      exampleAlt: "Catholic Charities",
    },
    {
      icon: <Landmark />,
      title: "Government",
      desc: "Stakeholder-first communication and structured execution for initiatives that require alignment and visibility.",
      bullets: ["Stakeholder mapping + outreach", "Program rollout planning", "Visibility + reporting"],
      caseCategory: "Partnerships",
      exampleImage: "/industries/ull-vertical.png",
      exampleAlt: "UL Lafayette",
    },
    {
      icon: <Store />,
      title: "Small Businesses",
      desc: "Make growth repeatable with a stronger offer, better follow-up, and a simple cadence your team can keep.",
      bullets: ["Offer packaging", "Nurture + follow-up", "Conversion-focused campaigns"],
      caseCategory: "Marketing",
      exampleImage: "/industries/jjs-vertical.png",
      exampleAlt: "JJ’s Prescription Specialties",
    },
    {
      icon: <HeartPulse />,
      title: "Healthcare & Medical",
      desc: "Grow referrals and patient acquisition with disciplined outreach, clean processes, and rep accountability.",
      bullets: ["Referral partnerships", "Outbound + inside sales playbooks", "Scorecards + rep coaching"],
      caseCategory: "Sales",
      exampleImage: "/industries/cardiovascular-institute-vertical.png",
      exampleAlt: "Cardiovascular Institute",
    },
    {
      icon: <Briefcase />,
      title: "M&A Services",
      desc: "Support sourcing, outreach, and post-close execution so acquisitions compound instead of distract.",
      bullets: ["Target list + outreach system", "Deal flow cadence", "Post-close execution plan"],
      caseCategory: "Sales",
      isScoutly: true,
      linkTo: "https://scoutly.agency/",
    },
  ];

  return (
    <>
      {/* Industries Hero */}
      <section className="relative bg-[#121212] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* depth + vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(214,162,30,0.22),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(0,0,0,0.65),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

          {/* ambient shapes */}
          <div className="absolute -top-44 -right-44 w-[720px] h-[720px] bg-[#D6A21E]/18 rotate-12 rounded-[92px] blur-[2px]" />
          <div className="absolute -bottom-56 -left-56 w-[760px] h-[760px] bg-white/8 -rotate-12 rounded-[92px]" />
          <div className="absolute -top-20 left-1/3 w-[520px] h-[520px] rounded-full border border-white/10" />
          <div className="absolute -top-44 left-1/3 w-[820px] h-[820px] rounded-full border border-white/5" />

          {/* subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* premium rules */}
          <div className="absolute left-1/2 top-8 h-px w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute left-1/2 top-[4.25rem] h-px w-[58%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D6A21E]/25 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-white/75 bg-white/10 px-4 py-2 rounded-full">
              Industries
            </p>
            <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
              Who we serve — and how we drive <span className="text-[#D6A21E]">momentum</span>.
            </h2>
            <p className="text-white/70 text-lg md:text-xl mt-6">
              We work with organizations that want disciplined execution: clean offers, consistent outreach, and scorecards tied to revenue outcomes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Book a consultation <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/case-studies">
                <Button className="bg-white/10 text-white hover:bg-white/15 rounded-full px-10 py-6 text-lg">
                  View proof
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industry blocks */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#D6A21E]" />
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                  Coverage
                </p>
              </div>
              <h3 className="text-3xl md:text-4xl font-black mt-4">Industries we support</h3>
              <p className="text-black/70 mt-3 max-w-2xl">
                If you have a real offer and want predictable pipeline + execution, we can help — even if you don’t fit perfectly into a box.
              </p>
            </div>
            <Link to="/services">
              <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8">
                Explore services <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 space-y-6">
            {industries.map((i, idx) => (
              <div
                key={i.title}
                className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen"
              >
                <div
                  className={cx(
                    "relative overflow-hidden border-y border-black/10",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE6]"
                  )}
                >
                    {/* Example image rail (edge-to-edge, top-to-bottom) */}
                    {!i.isScoutly ? (
                      <div className="hidden lg:block absolute inset-y-0 right-0 w-[300px] xl:w-[380px] border-l border-black/10 z-[1] overflow-hidden">
                        {i.exampleImage ? (
                          <>
                            <img
                              src={i.exampleImage}
                              alt={i.exampleAlt || `${i.title} example`}
                              className="absolute inset-0 w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* premium overlay so photos blend with the strip */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10" />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-white/45" />
                            <div className="absolute inset-0 opacity-[0.14] [background:radial-gradient(circle_at_20%_20%,rgba(214,162,30,0.35),transparent_55%)]" />
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent" />
                            <div className="absolute inset-0 opacity-[0.22] [background:radial-gradient(circle_at_20%_20%,rgba(214,162,30,0.25),transparent_55%),radial-gradient(circle_at_70%_40%,rgba(0,0,0,0.12),transparent_55%),radial-gradient(circle_at_40%_90%,rgba(214,162,30,0.18),transparent_60%)]" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55),transparent_35%,rgba(0,0,0,0.05))]" />
                          </>
                        )}
                      </div>
                    ) : null}

                  {/* premium accents */}
                    <div className="pointer-events-none absolute inset-0 z-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/60 to-transparent" />
                    <div className="absolute -top-28 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/10 rotate-12 rounded-[96px] blur-[70px]" />
                    <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[80px]" />
                    <div className="absolute left-1/2 top-10 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                  </div>

                  <div
                    className={cx(
                      "relative z-[2] max-w-7xl mx-auto px-6 py-10 md:py-12",
                      !i.isScoutly ? "lg:pr-[340px] xl:pr-[420px]" : ""
                    )}
                  >
                    <div className={cx("flex flex-col gap-10", i.isScoutly ? "items-center" : "lg:flex-row items-start")}>
                      {i.isScoutly ? (
                        <>
                          <div className="w-full max-w-5xl">
                            <div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/65 backdrop-blur-sm shadow-sm px-8 py-10 md:px-12 md:py-12 text-center">
                              {/* premium panel accents */}
                              <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                                <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-[#121212]/8 rotate-12 rounded-[96px] blur-[70px]" />
                                <div className="absolute -bottom-28 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px] blur-[80px]" />
                                <div
                                  className="absolute inset-0 opacity-[0.10]"
                                  style={{
                                    backgroundImage:
                                      "radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)",
                                    backgroundSize: "26px 26px",
                                  }}
                                />
                                {/* Scoutly watermark */}
                                <img
                                  src="/industries/scoutly-logo.png"
                                  alt=""
                                  aria-hidden="true"
                                  className="absolute left-1/2 top-1/2 w-[720px] max-w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
                                />
                              </div>

                              <div className="relative">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="h-12 w-12 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center shadow-sm">
                                    {i.icon}
                                  </div>
                                  <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                                    Scoutly
                                  </span>
                                </div>

                                <a
                                  href={i.linkTo || "https://scoutly.agency/"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#121212] px-5 py-3 shadow-sm hover:bg-black transition"
                                >
                                  <img
                                    src="/industries/scoutly-logo.png"
                                    alt="Scoutly"
                                    className="h-7 md:h-8 w-auto"
                                    loading="lazy"
                                  />
                                  <span className="h-5 w-px bg-white/15" />
                                  <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
                                    M&amp;A services
                                  </span>
                                </a>

                                <h4 className="text-4xl md:text-5xl font-black mt-7 tracking-tight">
                                  Looking to sell or buy a business?
                                </h4>
                                <p className="text-black/70 mt-5 text-lg md:text-xl leading-relaxed">
                                  Scoutly is our M&amp;A company — built for owners who want clarity, confidentiality, and a
                                  disciplined plan to move forward.
                                </p>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                  {["Confidential by default", "No-cost discovery call", "Vetted buyer network"].map(
                                    (pill) => (
                                      <span
                                        key={pill}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/70 border border-black/10 text-black/70"
                                      >
                                        {pill}
                                      </span>
                                    )
                                  )}
                                </div>

                                <div className="mt-8 grid gap-3 md:grid-cols-3">
                                  {i.bullets.map((b) => (
                                    <div
                                      key={b}
                                      className="group rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-5 py-4 text-left shadow-sm hover:shadow transition"
                                    >
                                      <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                                        Focus
                                      </p>
                                      <p className="mt-2 font-semibold text-black/80">{b}</p>
                                      <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                                      <p className="mt-3 text-xs text-black/55 leading-relaxed">
                                        Built to keep momentum high while protecting confidentiality.
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                                  <Button
                                    href={i.linkTo || "https://scoutly.agency/"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-auto rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-10 py-6 text-lg"
                                  >
                                    Visit Scoutly <ArrowRight className="ml-2" size={18} />
                                  </Button>
                                  <Link to="/consultation">
                                    <Button
                                      variant="outline"
                                      className="w-full sm:w-auto rounded-full bg-white text-[#121212] hover:bg-white/90 border border-black/10 px-10 py-6 text-lg"
                                    >
                                      Talk to Fulcrum <ArrowRight className="ml-2" size={18} />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="max-w-2xl lg:flex-1">
                            <div className="flex items-start justify-between gap-6">
                              <div className="h-12 w-12 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center shadow-sm">
                                {i.icon}
                              </div>
                              <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                                Industry
                              </span>
                            </div>

                            <h4 className="text-3xl md:text-4xl font-black mt-6 tracking-tight">{i.title}</h4>
                            <p className="text-black/70 mt-4 text-lg leading-relaxed">{i.desc}</p>
                          </div>

                          <div className="w-full lg:w-[340px] xl:w-[360px] lg:shrink-0 rounded-3xl border border-black/10 bg-white/75 backdrop-blur-sm p-8 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                              Typical focus
                            </p>
                            <ul className="mt-4 space-y-3 text-sm text-black/75">
                              {i.bullets.map((b) => (
                                <li key={b} className="flex items-start gap-2">
                                  <span className="text-[#D6A21E]">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-7 flex flex-col gap-3">
                              <Link to="/consultation">
                                <Button className="w-full rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-6">
                                  Book a consultation <ArrowRight className="ml-2" size={18} />
                                </Button>
                              </Link>
                              <Link to={`/case-studies?industry=${encodeURIComponent(i.title)}`}>
                                <Button
                                  variant="outline"
                                  className="w-full rounded-full bg-white text-[#121212] hover:bg-white/90 border border-black/10 px-6"
                                >
                                  View case study <ArrowRight className="ml-2" size={18} />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-[#121212] text-white p-10 md:p-12 border border-white/10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#D6A21E]/20 rotate-12 rounded-[56px]" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-black">Not sure where you fit?</h3>
                <p className="text-white/70 mt-3 max-w-2xl">
                  If you want disciplined growth, we’ll help you find the fastest path to momentum.
                </p>
              </div>
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Book a consultation <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceBlock({ icon, title, summary, bullets, outcomes }) {
  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-sm">
      <CardContent className="p-10">
        <div className="flex items-start justify-between gap-6">
          <div className="text-[#D6A21E]">{icon}</div>
          <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full">
            Core
          </span>
        </div>

        <h4 className="text-2xl font-black mt-6">{title}</h4>
        <p className="text-black/70 mt-3">{summary}</p>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Deliverables</p>
          <ul className="mt-3 space-y-2 text-sm text-black/75">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="text-[#D6A21E]">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 rounded-2xl border border-black/10 bg-[#F3EFE6] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Outcomes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {outcomes.map((o) => (
              <span
                key={o}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-black/10"
              >
                {o}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link to="/consultation">
            <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-8">
              Get started
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function PackageCard({ name, tag, bullets, highlight }) {
  return (
    <Card
      className={cx(
        "rounded-3xl border bg-white shadow-sm",
        highlight ? "border-[#D6A21E]" : "border-black/10"
      )}
    >
      <CardContent className="p-10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-black">{name}</h4>
            <p className="text-black/60 text-sm mt-1">{tag}</p>
          </div>
          {highlight ? (
            <span className="text-xs font-semibold bg-[#D6A21E] text-black px-3 py-1 rounded-full">
              Most Popular
            </span>
          ) : null}
        </div>

        <div className="mt-7">
          <ul className="space-y-3 text-sm text-black/75">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <CheckCircle2 className="text-[#D6A21E] mt-0.5" size={18} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <Link to="/consultation">
            <Button
              className={cx(
                "w-full rounded-full px-8 py-6 text-lg",
                highlight
                  ? "bg-[#D6A21E] text-black hover:bg-[#B88A16]"
                  : "bg-[#121212] text-[#D6A21E] hover:bg-black"
              )}
            >
              Choose {name}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ q, a, open, onToggle }) {
  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-sm">
      <CardContent className="p-8">
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left flex items-start justify-between gap-6"
        >
          <div>
            <div className="text-lg font-black">{q}</div>
            <div className="text-sm text-black/60 mt-1">
              {open ? "Click to collapse" : "Click to expand"}
            </div>
          </div>
          <div
            className={cx(
              "mt-1 text-xs font-semibold px-3 py-1 rounded-full border",
              open
                ? "bg-[#121212] text-[#D6A21E] border-white/10"
                : "bg-[#F3EFE6] text-black border-black/10"
            )}
          >
            {open ? "–" : "+"}
          </div>
        </button>

        {open ? (
          <p className="text-black/70 mt-6">{a}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CaseStudies() {
  const location = useLocation();
  const caseStudies = useMemo(
    () => [
      {
        slug: "abre",
        company: "Abre",
        website: "https://abre.io",
        industry: "Startups",
        category: "Sales",
        featured: true,
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Venture-backed EdTech startup secures product-market fit and grows sales organization 3x and leading to largest fundraising round.",
        downloadUrl: "/case-studies/abre.pdf",
        image: "/case-study-images/abre.webp",
        imagePos: "50% 50%",
      },
      {
        slug: "quicktake",
        company: "QuickTake",
        industry: "Startups",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Gathered market feedback and discovered 3 pilot opportunities in 90 days.",
        image: "/case-study-images/quicktake.png",
        imagePos: "58% 35%",
      },
      {
        slug: "brainscientific",
        company: "BrainScientific",
        industry: "Startups",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description: "Generated dozens of qualified leads in less than 6 months.",
        image: "/case-study-images/brainscientific.png",
        imagePos: "62% 55%",
      },
      {
        slug: "conveymd",
        company: "ConveyMD",
        industry: "Startups",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Market feedback led to complete pivot and company re-branding.",
        image: "/industries/conveymd-vertical.png",
        imagePos: "50% 20%",
      },
      {
        slug: "nightware",
        company: "Nightware",
        industry: "Startups",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Secured over 50 net new orders from more than 12 new VA locations.",
        image: "/case-study-images/nightware.png",
        imagePos: "50% 50%",
      },
      {
        slug: "hello-world",
        company: "Hello World",
        industry: "Startups",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Secures net new district contracts and internalizes repeatable lead generation strategy.",
        image: "/case-study-images/hello-world.png",
        imagePos: "50% 45%",
      },
      {
        slug: "us-frame-factory",
        company: "US Frame Factory",
        industry: "Startups",
        category: "Training",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description: "Identified path to building internal sales team.",
        image: "/case-study-images/us-frame-factory.png",
        imagePos: "50% 55%",
      },
      {
        slug: "tachyus",
        company: "Tachyus",
        industry: "Startups",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description: "Over 100% ROI and new enterprise customers secured.",
        image: "/case-study-images/tachyus.png",
        imagePos: "50% 45%",
      },
      {
        slug: "coursemojo",
        company: "CourseMojo",
        industry: "Startups",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Market insights lead to strategic pivot at company and corporate re-brand.",
        image: "/case-study-images/coursemojo.png",
        imagePos: "50% 25%",
      },
      {
        slug: "automated-productions",
        company: "Automated Productions",
        industry: "Small Businesses",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description:
          "Local fabrication shop launches new website and drives over $200k in revenue with over 150% ROI.",
        downloadUrl: "/case-studies/automated-productions.pdf",
        image: "/case-study-images/automated-productions.png",
        imagePos: "50% 45%",
      },
      {
        slug: "jjs-pharmacy",
        company: "JJ’s Pharmacy",
        industry: "Small Businesses",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description: "New product launched and increased walk-in traffic obtained.",
        image: "/industries/jjs-vertical.png",
        imagePos: "50% 55%",
      },
      {
        slug: "american-tank-company",
        company: "American Tank Company",
        industry: "Small Businesses",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description: "New orders secured and quoting tool created for sales team.",
        image: "/case-study-images/american-tank-company.png",
        imagePos: "50% 45%",
      },
      {
        slug: "park-place-surgical-hospital",
        company: "Park Place Surgical Hospital",
        industry: "Small Businesses",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description: "Physician satisfaction survey results secured and reported.",
        image: "/case-study-images/park-place-surgical-hospital.png",
        imagePos: "50% 50%",
      },
      {
        slug: "american-integrated",
        company: "American Integrated",
        industry: "Small Businesses",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description:
          "New website and brand guide launched leading to a new manufacturing partner.",
        image: "/case-study-images/american-integrated.png",
        imagePos: "52% 42%",
      },
      {
        slug: "family-engagement-lab",
        company: "Family Engagement Lab",
        industry: "Small Businesses",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description: "Net new opportunities secured for further exploration.",
        image: "/case-study-images/family-engagement-lab.png",
        imagePos: "55% 45%",
      },
      {
        slug: "flyguys",
        company: "FlyGuys",
        industry: "Startups",
        category: "Marketing",
        featured: true,
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Venture-backed drone startup build proactive lead generation strategy and raises largest round of funding.",
        downloadUrl: "/case-studies/flyguys.pdf",
        image: "/case-study-images/flyguys.png",
        imagePos: "50% 60%",
      },
      {
        slug: "scpdc",
        company: "SCPDC",
        industry: "Government",
        category: "Partnerships",
        featured: true,
        serviceLine: "Fulcrum business development",
        label: "Government",
        description:
          "Identified and recruited participants in governmental programs.",
        downloadUrl: "/case-studies/scpdc.pdf",
        image: "/case-study-images/scpdc.png",
        imagePos: "50% 45%",
      },
      {
        slug: "pes",
        company: "PES",
        industry: "Small Businesses",
        category: "Training",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description:
          "Entire team learns how to sell and market company, which leads to largest month in sales by 2x.",
        downloadUrl: "/case-studies/pes.pdf",
        image: "/case-study-images/pes.png",
        imagePos: "50% 55%",
      },
      {
        slug: "tier1mro",
        company: "Tier 1 MRO",
        industry: "Small Businesses",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description:
          "Entire corporate strategy identified and adjusted based on compelling market insights and customer feedback.",
        downloadUrl: "/case-studies/tier1mro.pdf",
        image: "/case-study-images/tier1mro.png",
        imagePos: "50% 55%",
      },
      {
        slug: "lhc-group",
        company: "LHC Group",
        industry: "Healthcare & Medical",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Healthcare",
        description:
          "A publicly traded healthcare giant further penetrates markets while identifying net new accounts for their national sales team.",
        image: "/industries/lhc-vertical.png",
        imagePos: "50% 45%",
      },
      {
        slug: "teach-town",
        company: "Teach Town",
        industry: "Enterprise Teams",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Enterprise",
        description:
          "Over 100 sales meetings qualified and booked for national sales team of AEs.",
        image: "/case-study-images/teach-town.png",
        imagePos: "50% 45%",
      },
      {
        slug: "cardiovascular-institute-of-the-south",
        company: "Cardiovascular Institute of the South",
        industry: "Enterprise Teams",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Enterprise",
        description:
          "Largest independent cardiology practice launches new services line that captures hospital contracts across several states.",
        image: "/industries/cardiovascular-institute-vertical.png",
        imagePos: "50% 50%",
      },
      {
        slug: "viemed",
        company: "VieMed, Inc",
        website: "https://www.viemed.com",
        industry: "Healthcare & Medical",
        category: "Sales",
        featured: true,
        serviceLine: "Fulcrum business development",
        label: "Healthcare",
        description:
          "Public medical DME launches new geographic markets, trains in-house outside sales team, and launches inside sales program while launching new product lines in new customer markets.",
        downloadUrl: "/case-studies/viemed.pdf",
        image: "/partnerships/viemed.png",
        imagePos: "50% 50%",
      },
      {
        slug: "yps-anesthesia",
        company: "YPS Anesthesia",
        industry: "Small Businesses",
        category: "Sales",
        featured: true,
        serviceLine: "Fulcrum business development",
        label: "Small Businesses",
        description:
          "More than 600 target customers identified, 10 decision makers engaged, $1.5M in new revenue captured leading to 200% ROI.",
        downloadUrl: "/case-studies/yps-anesthesia.pdf",
        image: "/partnerships/yps.png",
        imagePos: "50% 50%",
      },
      {
        slug: "vermillion-eda",
        company: "Vermillion Economic Development",
        industry: "Government",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Government",
        description:
          "New product launched and increased walk-in traffic obtained.",
        downloadUrl: "/case-studies/vermillion-eda.pdf",
        image: "/case-study-images/vermillion.png",
        imagePos: "50% 55%",
      },
      {
        slug: "ull",
        company: "University of Louisiana at Lafayette",
        industry: "Government",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Government",
        description:
          "Recruited first-time out-of-state freshmen to increase enrollment.",
        image: "/industries/ull-vertical.png",
        imagePos: "50% 55%",
      },
      {
        slug: "st-martin-parish",
        company: "St. Martin Parish",
        industry: "Government",
        category: "Training",
        serviceLine: "Fulcrum business development",
        label: "Government",
        description: "Trained local business owners on marketing strategy.",
        image: "/case-study-images/st-martin-parish.png",
        imagePos: "50% 55%",
      },
      {
        slug: "city-of-broussard",
        company: "City of Broussard",
        industry: "Government",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Government",
        description:
          "Engaged local businesses and generated 200% ROI in sponsorship sales.",
        image: "/case-study-images/city-of-broussard.png",
        imagePos: "50% 52%",
      },
      {
        slug: "americas-sbdc-louisiana",
        company: "America's SBDC Louisiana",
        industry: "Government",
        category: "Training",
        serviceLine: "Fulcrum business development",
        label: "Government",
        description: "Trained local business startups on sales strategy.",
        image: "/case-study-images/americas-sbdc.png",
        imagePos: "50% 48%",
      },
      {
        slug: "slcc",
        company: "SLCC",
        industry: "Government",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Government",
        description: "Physician satisfaction survey results secured and reported.",
        image: "/case-study-images/slcc.png",
        imagePos: "50% 55%",
      },
      {
        slug: "united-way-of-acadiana",
        company: "United Way of Acadiana",
        industry: "Nonprofits",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Nonprofits",
        description: "400+ donors targeted and 17 opportunities secured.",
        image: "/case-study-images/united-way.png",
        imagePos: "50% 50%",
      },
      {
        slug: "mission-coffee",
        company: "Mission Coffee",
        industry: "Nonprofits",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Nonprofits",
        description:
          "New website and branding guide launched with new donors obtained.",
        image: "/case-study-images/mission-coffee.png",
        imagePos: "62% 45%",
      },
      {
        slug: "miles-perret-cancer-services",
        company: "Miles Perret Cancer Services",
        industry: "Nonprofits",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Nonprofits",
        description:
          "Outreach campaign completed with new fundraising team member placed.",
        image: "/case-study-images/miles-perret.png",
        imagePos: "52% 40%",
      },
      {
        slug: "catholic-charities-of-acadiana",
        company: "Catholic Charities of Acadiana",
        industry: "Nonprofits",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Nonprofits",
        description: "New programming developed and funds secured.",
        image: "/industries/catholic-charities-vertical.png",
        imagePos: "50% 50%",
      },
      {
        slug: "winrock-international",
        company: "Winrock International",
        industry: "Nonprofits",
        category: "Partnerships",
        serviceLine: "Fulcrum business development",
        label: "Nonprofits",
        description:
          "Healthcare focused business accelerator launched and sustained.",
        image: "/case-study-images/winrock.png",
        imagePos: "50% 42%",
      },
      {
        slug: "muse-engines",
        company: "Muse Engines",
        industry: "Startups",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "NSF funded startup identified niche based on market insight and customer feedback.",
        downloadUrl: "/case-studies/muse-engines.pdf",
        image: "/case-study-images/muse-engines.png",
        imagePos: "50% 40%",
      },
      {
        slug: "logojet",
        company: "LogoJet",
        industry: "Small Businesses",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Over $70,000 in net profit generated while capturing $1M in lifetime revenue with 10X ROI.",
        downloadUrl: "/case-studies/logojet.pdf",
        image: "/case-study-images/logojet.png",
        imagePos: "65% 45%",
      },
      {
        slug: "stuller",
        company: "Stuller",
        industry: "Enterprise Teams",
        category: "Training",
        featured: true,
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Over 200% increase in closing percentages compared year over year after sales training program implementation.",
        downloadUrl: "/case-studies/stuller-sales-training.pptx",
        image: "/partnerships/stuller.png",
        imagePos: "50% 50%",
      },
      {
        slug: "chronic-disease-solutions",
        company: "Chronic Disease Solutions",
        industry: "Healthcare & Medical",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Results",
        description:
          "Primary care practice engages and educates hundreds of patients leading to highest enrollment numbers ever.",
        downloadUrl: "/case-studies/chronic-disease-solutions.pdf",
        image: "/case-study-images/chronic-disease-solutions.png",
        imagePos: "50% 45%",
      },
      {
        slug: "health-heart-clinics-of-america",
        company: "Health Heart Clinics of America",
        industry: "Healthcare & Medical",
        category: "Marketing",
        serviceLine: "Fulcrum business development",
        label: "Healthcare",
        description:
          "Launched patient engagement and education program leading to added therapy exposure.",
        image: "/case-study-images/health-heart.png",
        imagePos: "55% 45%",
      },
      {
        slug: "dr-kevins-wellness-center",
        company: "Dr. Kevin's Wellness Center",
        industry: "Healthcare & Medical",
        category: "Sales",
        serviceLine: "Fulcrum business development",
        label: "Healthcare Providers & Clinics",
        description:
          "Created new B2B channel and built proactive referral base.",
        image: "/case-study-images/dr-kevins.png",
        imagePos: "62% 45%",
      },
    ],
    []
  );

  const filters = useMemo(() => {
    const preferred = [
      "Startups",
      "Enterprise Teams",
      "Nonprofits",
      "Government",
      "Small Businesses",
      "Healthcare & Medical",
      "M&A Services",
    ];
    const set = new Set(caseStudies.map((c) => c.industry).filter(Boolean));
    // Always show Nonprofits (even if not populated yet)
    set.add("Nonprofits");
    const unique = Array.from(set);
    unique.sort((a, b) => {
      const ia = preferred.indexOf(a);
      const ib = preferred.indexOf(b);
      const sa = ia === -1 ? 999 : ia;
      const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) return sa - sb;
      return a.localeCompare(b);
    });
    return ["Featured", "All", ...unique];
  }, [caseStudies]);
  const [active, setActive] = useState(() => {
    const params = new URLSearchParams(location.search);
    const industry = params.get("industry");
    return industry && filters.includes(industry) ? industry : "Featured";
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const industry = params.get("industry");
    if (industry && filters.includes(industry)) setActive(industry);
  }, [location.search, filters]);

  const filtered = useMemo(() => {
    if (active === "Featured") return caseStudies.filter((c) => c.featured);
    if (active === "All") return caseStudies;
    return caseStudies.filter((c) => c.industry === active);
  }, [active, caseStudies]);

  const testimonials = useMemo(
    () => [
      {
        title: "Exceeding Expectations with Professionalism",
        quote: `The team at Fulcrum was super professional and exceeded our expectations. They completed the project ahead of schedule and with great results. Working with them was a fantastic experience!`,
        who: "Anne Falgout",
        meta: "Director of Communications, SLCC (Formerly Executive Director of VEDA)",
        avatar: "/testimonials/anne.png",
        avatarAlt: "Anne Falgout",
        avatarPos: "50% 30%",
        tag: "Delivery",
      },
      {
        title: "Effective Lead Generation for Targeted Growth",
        quote: `We engaged Fulcrum to help us get in front of viable prospects. We had a good pitch, but didn’t know how to reach our target audience. Fulcrum has done a terrific job finding companies that are in our sweet spot. Their knowledge of the healthcare industry, as well as software sales, was a key to early successes. The buyers on the call were the right level decision makers and actively interested in our solution. I would recommend Fulcrum to any company that is looking to grow their business and needs professional sales to augment their team.`,
        who: "Nandip Kathari",
        meta: "CEO of smartMD",
        avatar: "/testimonials/nandip.png",
        avatarAlt: "Nandip Kathari",
        avatarPos: "50% 35%",
        tag: "Pipeline",
      },
      {
        title: "Consistent, Qualified Leads with Hands-Off Management",
        quote: `We have been using the services of Fulcrum for over a year and are completely satisfied with the end product of what they provide. Not only do we get consistent and regular leads to pursue but the leads are qualified and interested in our pain management services. Fulcrum incentivizes the leads to attend the initial meeting and thereafter provides follow-up services for the proposal and ultimately the close. Having Fulcrum as a sales and marketing partner is like having an ultra sharp sales team but without the management of that team — Fulcrum takes care of those details.`,
        who: "Peter Bechtel",
        meta: "CEO of CareOne Concierge",
        avatar: "/testimonials/peter.png",
        avatarAlt: "Peter Bechtel",
        avatarPos: "50% 28%",
        tag: "Consistency",
      },
      {
        title: "A Strategic Sales Partner for Business Growth",
        quote: `Business owners are always looking for ways to generate leads. What I’ve come to learn is that generating qualified sales leads is extremely challenging if you don’t have the right resources, skills, people, and processes in place. If opportunity generation (professional sales) is not your strength, consider outsourcing that part of your business to Fulcrum’s team. Fulcrum provides companies with an elite, out-sourced sales force that bolts on to your team and drives profitability. Fulcrum’s partnership offers a wide range of inbound and outbound sales and marketing services to companies that are serious about creating win-win relationships with their target market.`,
        who: "Skip Boudreaux, MBA",
        meta: "CEO of Acadiana Capital",
        avatar: "/testimonials/skip.png",
        avatarAlt: "Skip Boudreaux",
        avatarPos: "55% 18%",
        tag: "Strategy",
      },
      {
        title: "Expanding Business Development Effortlessly",
        quote: `Fulcrum has put together an awesome team and expanded our Business Development bandwidth overnight! Strong work ethic, proven process and outstanding results! Glad our paths crossed months ago in Lafayette!`,
        who: "Mike Sheff",
        meta: "CEO of TierOne MRO",
        avatar: "/testimonials/mike.png",
        avatarAlt: "Mike Sheff",
        avatarPos: "50% 30%",
        tag: "Bandwidth",
      },
      {
        title: "A Key Partner for Research Institutions and Tech Programs",
        quote: `Fulcrum Sales and Marketing has been an incredible development partner for us here at the University of Southern Mississippi and the Gulf Blue Navigator Program. Without them, we would not have recruited such a star-studded cohort in such a short amount of time with so little headache. Fulcrum’s team has deep knowledge and expertise in the technology transfer and acceleration space and works diligently to make sure that our objectives are being met. Would highly recommend to other research institutions that are looking to expand their programming, develop community, recruit stakeholders, and or develop business relationships.`,
        who: "Brian Ceuvas, PhD",
        meta: "Director of Office of Innovation Management, University of Southern Mississippi",
        avatar: "/testimonials/brian.png",
        avatarAlt: "Brian Ceuvas",
        avatarPos: "50% 28%",
        tag: "Programs",
      },
    ],
    []
  );

  return (
    <>
      {/* Hero (unique vs Services) */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F3EFE6]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -left-28 w-[560px] h-[560px] bg-[#121212]/6 rotate-12 rounded-[84px]" />
          <div className="absolute -bottom-28 -right-28 w-[560px] h-[560px] bg-[#D6A21E]/12 -rotate-12 rounded-[84px]" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/80 to-transparent" />
          <div className="absolute right-16 bottom-10 h-24 w-24 rounded-full border border-black/10 bg-white/60" />
          <div className="absolute left-12 top-16 h-36 w-36 rounded-[48px] border border-black/10 bg-white/50 -rotate-6" />
          <div className="absolute left-1/2 top-8 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/12 to-transparent" />
          <div className="absolute right-10 top-28 h-10 w-10 rounded-full bg-[#D6A21E]/15" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.2]">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="hero-dots-case" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(0,0,0,0.12)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-case)" />
            <g stroke="rgba(0,0,0,0.08)" strokeWidth="1">
              <line x1="-10%" y1="12%" x2="110%" y2="-8%" />
              <line x1="-10%" y1="46%" x2="110%" y2="26%" />
              <line x1="-10%" y1="80%" x2="110%" y2="60%" />
            </g>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full">
                Case Studies
              </p>
              <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
                Proof you can <span className="text-[#D6A21E]">feel</span>.
              </h2>
              <p className="text-black/70 text-lg md:text-xl mt-6">
                We don’t just “run campaigns.” We build a repeatable growth system and show the receipts.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/consultation">
                  <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg">
                    Get a growth plan <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button className="bg-white text-black hover:bg-white/90 border border-black/10 rounded-full px-10 py-6 text-lg">
                    Explore services
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-8 md:p-10 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-black/70">What you’ll see</p>
                <span className="text-xs font-semibold bg-[#D6A21E] text-black px-3 py-1 rounded-full">Clarity</span>
              </div>
              <div className="mt-6 space-y-3 text-black/70">
                <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Challenge → Approach → Results (no fluff)</span></div>
                <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Metrics that map to revenue outcomes</span></div>
                <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Systems you can repeat and scale</span></div>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Speed</div>
                  <div className="font-black mt-1">2–4w</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Cadence</div>
                  <div className="font-black mt-1">Weekly</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Focus</div>
                  <div className="font-black mt-1">KPI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <ProofCard title="System-first" desc="We don’t do random tactics. We build a repeatable machine." />
            <ProofCard title="Coaching + cadence" desc="Training, scorecards, and accountability that sticks." />
            <ProofCard title="Measured outcomes" desc="Clear KPIs so you can see what’s working fast." />
          </div>
        </div>
      </section>

      {/* Filters + cards */}
      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-3xl md:text-4xl font-black">Featured work</h3>
              <p className="text-black/70 mt-3">
                A few examples of what disciplined execution looks like in the real world.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActive(f)}
                  className={cx(
                    "px-4 py-2 rounded-full text-sm font-semibold border transition",
                    active === f
                      ? "bg-[#121212] text-[#D6A21E] border-black"
                      : "bg-white text-black/70 border-black/10 hover:border-black/20"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-8">
            {filtered.map((c) => (
              <CaseStudyCard key={c.slug || c.company} cs={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials strip */}
      <section className="py-16">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#121212] text-white overflow-hidden border-y border-white/10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
            <div className="absolute -top-36 -right-36 w-[720px] h-[720px] bg-[#D6A21E]/14 rotate-12 rounded-[110px] blur-[85px]" />
            <div className="absolute -bottom-44 -left-44 w-[760px] h-[760px] bg-white/6 -rotate-12 rounded-[110px] blur-[95px]" />
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage: "radial-gradient(rgba(214,162,30,0.20) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="py-14">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                      Client words
                    </p>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black mt-4">
                    What people say after we build the system.
                  </h3>
                  <p className="text-white/70 mt-3">
                    A few words from leaders we’ve partnered with — focused on outcomes, professionalism, and repeatable growth.
                  </p>
                </div>
                <Link to="/consultation">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                    Book a consultation <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="mt-10 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#121212] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#121212] to-transparent" />
                <TestimonialMarquee items={testimonials} baseSpeed={26} hoverSpeed={8} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-[#121212] text-white p-10 md:p-12 border border-white/10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#D6A21E]/20 rotate-12 rounded-[56px]" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-black">Want your next case study?</h3>
                <p className="text-white/70 mt-3 max-w-2xl">
                  Book the free consultation and we’ll map out the system that gets you there.
                </p>
              </div>
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Book free consultation <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProofCard({ title, desc }) {
  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-sm">
      <CardContent className="p-8">
        <div className="text-[#D6A21E]">
          <Briefcase />
        </div>
        <h4 className="text-xl font-black mt-4">{title}</h4>
        <p className="text-black/70 mt-3">{desc}</p>
      </CardContent>
    </Card>
  );
}

function MiniStep({ n, t, d }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-[#F3EFE6] p-8">
      <div className="text-[#D6A21E] font-black text-3xl">{n}</div>
      <div className="font-black text-xl mt-3">{t}</div>
      <p className="text-black/70 mt-3 text-sm">{d}</p>
    </div>
  );
}

function TestimonialCard({ t }) {
  const initials = (t.who || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="group relative w-[460px] md:w-[720px] max-w-[90vw] rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#D6A21E]/[0.12] backdrop-blur-sm p-8 md:p-10 shadow-[0_12px_34px_rgba(0,0,0,0.30)] overflow-hidden transition-shadow hover:shadow-[0_18px_52px_rgba(0,0,0,0.38)]">
      {/* premium accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/60 to-transparent" />
        <div className="absolute -top-32 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/14 rotate-12 rounded-[120px] blur-[80px]" />
        <div className="absolute -bottom-36 -left-32 w-[560px] h-[560px] bg-white/8 -rotate-12 rounded-[130px] blur-[95px]" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.20) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />
      </div>

      {/* subtle quote watermark */}
      <div className="pointer-events-none absolute -top-10 -right-8 text-[150px] leading-none font-black text-white/6 select-none">
        “
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative h-16 w-16 rounded-full border border-white/15 bg-gradient-to-br from-white/12 via-white/6 to-transparent overflow-hidden shrink-0">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.avatarAlt || t.who || "Testimonial photo"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: t.avatarPos || "50% 35%" }}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-[#D6A21E] font-black text-lg">
                  {initials || "F"}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-[#D6A21E]/28" />
            </div>
            <div className="min-w-0">
              <div className="text-sm md:text-base font-semibold text-white truncate">
                {t.who}
              </div>
              <div className="text-xs md:text-sm text-white/65 mt-1 leading-snug line-clamp-2">
                {t.meta}
              </div>
            </div>
          </div>

          <span className="shrink-0 text-xs font-semibold bg-[#D6A21E]/15 text-[#F6E4A6] px-3 py-1 rounded-full border border-[#D6A21E]/25">
            {t.tag}
          </span>
        </div>

        <div className="mt-7 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <h4 className="mt-6 text-lg md:text-2xl font-black text-white leading-snug">
          {t.title}
        </h4>

        <blockquote className="mt-4 text-white/85 text-lg md:text-xl leading-relaxed">
          “{t.quote}”
        </blockquote>
      </div>
    </div>
  );
}

function TestimonialMarquee({ items = [], baseSpeed = 32, hoverSpeed = 10 }) {
  const trackRef = useRef(null);
  const singleRef = useRef(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(null);
  const offsetRef = useRef(0);
  const singleWidthRef = useRef(0);
  const speedRef = useRef(baseSpeed);
  const targetSpeedRef = useRef(baseSpeed);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotionRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  useEffect(() => {
    if (!singleRef.current) return;
    const update = () => {
      const w = singleRef.current?.getBoundingClientRect?.().width || 0;
      singleWidthRef.current = w;
      if (offsetRef.current >= w && w > 0) offsetRef.current = offsetRef.current % w;
    };

    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(singleRef.current);
    return () => ro.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (reducedMotionRef.current) return;

    const tick = (ts) => {
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      if (!last) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(0.05, (ts - last) / 1000);
      // smooth speed changes (hover slow-down)
      const s = speedRef.current;
      const target = targetSpeedRef.current;
      const nextSpeed = s + (target - s) * Math.min(1, dt * 4.5);
      speedRef.current = nextSpeed;

      const w = singleWidthRef.current || 0;
      if (w > 0) {
        offsetRef.current = offsetRef.current + nextSpeed * dt;
        if (offsetRef.current >= w) offsetRef.current -= w;
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!items?.length) return null;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => (targetSpeedRef.current = hoverSpeed)}
      onMouseLeave={() => (targetSpeedRef.current = baseSpeed)}
      onFocus={() => (targetSpeedRef.current = hoverSpeed)}
      onBlur={() => (targetSpeedRef.current = baseSpeed)}
    >
      <div
        ref={trackRef}
        className="flex gap-6 will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        <div ref={singleRef} className="flex gap-6 pr-6">
          {items.map((t, idx) => (
            <TestimonialCard key={`${t.who}-${idx}`} t={t} />
          ))}
        </div>
        <div className="flex gap-6 pr-6" aria-hidden="true">
          {items.map((t, idx) => (
            <TestimonialCard key={`dup-${t.who}-${idx}`} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseStudyCard({ cs }) {
  const initials = (cs.company || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <Card className="group relative rounded-3xl border border-black/10 bg-gradient-to-br from-white via-white to-[#F3EFE6] shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* premium accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
        <div className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-[#D6A21E]/10 rotate-12 rounded-[84px] blur-[75px]" />
        <div className="absolute -bottom-28 -left-28 w-[420px] h-[420px] bg-black/5 -rotate-12 rounded-[84px] blur-[85px]" />
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      <CardContent className="relative p-10">
        <div className="grid md:grid-cols-[1fr_240px] gap-8 items-stretch">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                  {cs.industry}
                </span>
                <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                  {cs.category}
                </span>
              </div>
              <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
                {cs.label || "Results"}
              </span>
            </div>

            <h4 className="text-2xl md:text-3xl font-black mt-3">{cs.company}</h4>

            <p className="text-black/70 mt-5 text-base leading-relaxed">{cs.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-black/10 text-black/70">
                {cs.serviceLine || "Fulcrum"}
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F3EFE6] border border-black/10 text-black/70">
                {cs.label || "Results"}
              </span>
            </div>

            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            <div className="mt-7 flex flex-col gap-3">
              {cs.downloadUrl ? (
                <Button
                  href={cs.downloadUrl}
                  download
                  className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-8 shadow-sm hover:shadow transition"
                >
                  Download case study <ArrowRight className="ml-2" size={18} />
                </Button>
              ) : null}
              <Link to="/consultation">
                <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-8 shadow-sm hover:shadow transition">
                  Talk to us <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl border border-black/10 bg-[#F3EFE6] overflow-hidden min-h-[220px] md:min-h-full shadow-sm">
            {cs.image ? (
              <>
                <img
                  src={cs.image}
                  alt={`${cs.company} image`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: cs.imagePos || "50% 50%" }}
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-white/35" />
              </>
            ) : (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F3EFE6] to-white" />
                <div className="absolute inset-0 opacity-[0.22] [background:radial-gradient(circle_at_20%_20%,rgba(214,162,30,0.35),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(0,0,0,0.10),transparent_55%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.6),transparent_40%,rgba(0,0,0,0.03))]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-16 w-16 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center font-black text-xl shadow-sm ring-1 ring-white/10">
                    {initials || "CS"}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                    Add image
                  </p>
                  <p className="text-xs text-black/60 mt-1">
                    Drop a photo into <span className="font-semibold">/public/case-study-images</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Academy() {
  return (
    <>
      {/* Academy Hero (unique vs Services) */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F3EFE6]">
        <div className="absolute inset-0 pointer-events-none">
          {/* tonal wash */}
          <div className="absolute inset-0 opacity-[0.35] [background:radial-gradient(circle_at_20%_0%,rgba(214,162,30,0.28),transparent_48%),radial-gradient(circle_at_85%_18%,rgba(0,0,0,0.10),transparent_55%),radial-gradient(circle_at_50%_110%,rgba(214,162,30,0.18),transparent_52%)]" />
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(0,0,0,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:84px_84px]" />
          {/* ambient shapes */}
          <div className="absolute -top-44 -right-44 w-[760px] h-[760px] bg-[#121212]/7 rotate-12 rounded-[110px] blur-[1px]" />
          <div className="absolute -bottom-56 -left-56 w-[860px] h-[860px] bg-[#D6A21E]/14 -rotate-12 rounded-[120px] blur-[1px]" />
          <div className="absolute right-14 top-16 h-32 w-32 rounded-full border border-black/10 bg-white/60 backdrop-blur-sm" />
          <div className="absolute left-16 bottom-12 h-52 w-52 rounded-[68px] border border-black/10 bg-white/55 backdrop-blur-sm rotate-6" />
          {/* extra decoration (premium) */}
          <div className="absolute -left-28 top-24 h-[420px] w-[420px] rounded-full border border-black/10 opacity-[0.35]" />
          <div className="absolute -right-40 bottom-10 h-[520px] w-[520px] rounded-full border border-black/10 opacity-[0.28]" />
          <div className="absolute left-10 top-40 h-16 w-16 rounded-2xl border border-black/10 bg-white/40 rotate-[14deg]" />
          <div className="absolute right-24 bottom-40 h-20 w-20 rounded-[26px] border border-black/10 bg-white/35 -rotate-[10deg]" />
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-black/10 to-transparent opacity-[0.65]" />
          <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-black/10 to-transparent opacity-[0.45]" />
          <div className="absolute left-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-[0.55]" />
          <div className="absolute -top-24 left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#D6A21E]/10 blur-[70px]" />
          <div className="absolute -bottom-28 left-[20%] h-[320px] w-[320px] rounded-full bg-black/5 blur-[80px]" />
          {/* corner ornaments */}
          <div className="absolute -left-28 -top-28 h-80 w-80 rotate-12 rounded-[80px] border border-black/10 bg-white/20" />
          <div className="absolute -right-28 -bottom-28 h-80 w-80 -rotate-12 rounded-[80px] border border-black/10 bg-white/15" />
          {/* premium rules */}
          <div className="absolute left-1/2 top-8 h-px w-[68%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/12 to-transparent" />
          <div className="absolute left-1/2 top-[4.25rem] h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D6A21E]/35 to-transparent" />
          {/* typographic watermark */}
          <div
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 font-black tracking-tight uppercase text-transparent opacity-[0.14] select-none"
            style={{
              fontSize: "clamp(84px, 14vw, 240px)",
              WebkitTextStroke: "1px rgba(0,0,0,0.16)",
              letterSpacing: "-0.04em",
            }}
          >
            ACADEMY
          </div>
          {/* vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.75),transparent_52%),radial-gradient(circle_at_50%_85%,rgba(0,0,0,0.06),transparent_48%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="hero-dots-academy" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(0,0,0,0.12)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-academy)" />
            <g stroke="rgba(0,0,0,0.08)" strokeWidth="1">
              <line x1="-10%" y1="14%" x2="110%" y2="-6%" />
              <line x1="-10%" y1="48%" x2="110%" y2="28%" />
              <line x1="-10%" y1="82%" x2="110%" y2="62%" />
            </g>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
              Academy
            </p>

            <div className="mt-7 flex justify-center">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[#D6A21E]/20 blur-[22px]" />
                <div className="pointer-events-none absolute -inset-2 rounded-[2.25rem] border border-black/10 bg-white/45 backdrop-blur-sm" />
                <div className="relative h-16 w-16 rounded-2xl bg-white/75 border border-black/10 grid place-items-center shadow-sm">
                  <GraduationCap className="text-[#D6A21E]" size={28} />
                </div>
                <Sparkles
                  className="pointer-events-none absolute -right-5 -top-4 text-[#D6A21E]/70"
                  size={18}
                />
              </div>
            </div>

            <h2 className="text-6xl md:text-7xl font-black mt-7 tracking-tight leading-[0.95]">
              Fulcrum <span className="text-[#D6A21E]">Academy</span>
            </h2>
            <div className="mt-7 h-px w-[220px] md:w-[280px] mx-auto bg-gradient-to-r from-transparent via-black/15 to-transparent" />
            <p className="text-black/70 text-lg md:text-2xl mt-6 max-w-3xl mx-auto leading-relaxed">
              A recruiting + onboarding funnel for people who want growth, coaching, and a clear path to leadership.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#apply">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg shadow-sm hover:shadow transition">
                  Apply now <ArrowRight className="ml-2" />
                </Button>
              </a>
              <Link to="/about">
                <Button className="bg-white/80 text-black hover:bg-white border border-black/10 rounded-full px-10 py-6 text-lg shadow-sm hover:shadow transition">
                  Meet the team
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-5 py-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Training</div>
                <div className="font-black mt-1 text-lg">Daily reps</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-5 py-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Coaching</div>
                <div className="font-black mt-1 text-lg">Weekly</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-5 py-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Path</div>
                <div className="font-black mt-1 text-lg">Leader track</div>
              </div>
            </div>
          </div>

          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-sm p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                <div className="absolute -top-28 -left-24 w-[420px] h-[420px] bg-[#121212]/6 rotate-12 rounded-[84px] blur-[80px]" />
                <div className="absolute -bottom-28 -right-24 w-[520px] h-[520px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px] blur-[90px]" />
              </div>

              <div className="relative grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
                <div>
                  <p className="text-sm font-semibold text-black/70">Who it’s for</p>
                  <div className="mt-5 space-y-3 text-black/70">
                    <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>People who want real sales experience</span></div>
                    <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Competitive, coachable, consistent</span></div>
                    <div className="flex items-start gap-3"><span className="text-[#D6A21E]">•</span><span>Ready to build skills and earn promotions</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-7 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                    Recruiting → Onboarding → Performance
                  </p>
                  <p className="text-black/70 mt-2">
                    This isn’t a “course.” It’s a structured ramp with clear milestones.
                  </p>
                  <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Reps</div>
                      <div className="font-black mt-1">Daily</div>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Scorecards</div>
                      <div className="font-black mt-1">Weekly</div>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Growth</div>
                      <div className="font-black mt-1">Fast</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notable apprentices (auto-moving) */}
      <section className="px-6 py-12 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Notable apprentices</p>
              <h3 className="text-3xl md:text-4xl font-black mt-3">
                Proof of the <span className="text-[#D6A21E]">pipeline</span>.
              </h3>
              <p className="text-black/70 mt-3 max-w-2xl">
                A few faces from the Academy who showed up, put in reps, and leveled up.
              </p>
            </div>
            <a href="#apply">
              <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8">
                Apply now <ArrowRight className="ml-2" />
              </Button>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10">
          <div className="grid md:grid-cols-3 gap-8">
            {apprentices.map((a) => (
              <div key={a.name + a.role} className="group">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 shadow-md hover:shadow-xl transition">
                  <div className="aspect-[3/4] bg-black/5 relative overflow-hidden">
                    {a.img ? (
                      <img
                        src={a.img}
                        alt={a.name}
                        className="h-full w-full object-cover object-[50%_20%] transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        loading="lazy"
                        draggable={false}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fb = e.currentTarget.parentElement?.querySelector("[data-fallback]");
                          if (fb) fb.style.display = "grid";
                        }}
                      />
                    ) : null}
                    <div
                      data-fallback
                      style={{ display: a.img ? "none" : "grid" }}
                      className="absolute inset-0 grid place-items-center text-black/40"
                    >
                      Photo Slot
                    </div>
                    {/* readability gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    {/* blur only behind text */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-black/35 backdrop-blur-sm text-center">
                      <h4 className="font-black text-lg text-white group-hover:text-[#D6A21E] transition">
                        {a.name}
                      </h4>
                      <p className="text-sm text-white/80 mt-1">{a.role}</p>
                      <p className="text-xs text-white/70 mt-2 italic leading-relaxed line-clamp-2">
                        “{a.quote}”
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto space-y-20">
        {/* Why Join */}
        <div className="grid md:grid-cols-3 gap-10">
          <FunnelCard title="Hands-On Experience" body="Real campaigns. Real conversations. Real skill." />
          <FunnelCard title="Paid Growth Path" body="Clear advancement based on performance." />
          <FunnelCard title="Mentorship" body="Learn directly from leaders and top performers." />
        </div>

        {/* Onboarding Path */}
        <div className="bg-white rounded-3xl border border-black/10 p-10">
          <h3 className="text-3xl font-black text-center mb-10">The Academy Path</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Step number="1" title="Apply" desc="Tell us who you are." />
            <Step number="2" title="Interview" desc="Quick call to assess fit." />
            <Step number="3" title="Onboard" desc="Training + shadowing + reps." />
            <Step number="4" title="Advance" desc="Earn more, lead more." />
          </div>
        </div>

        {/* Application */}
        <div id="apply" className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-8">Apply to Fulcrum Academy</h3>
          <AcademyApplication />
          <p className="text-xs text-black/55 mt-4 text-center">
            This form is a frontend demo. Connect it to your ATS/CRM (Airtable, HubSpot, etc.) when you’re ready.
          </p>
        </div>
      </section>
    </>
  );
}

function Consultation() {
  return (
    <section className="relative py-28 px-6 max-w-4xl mx-auto overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-20 h-64 w-64 rounded-[72px] bg-[#D6A21E]/10 rotate-12" />
        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-black/5" />
        <div className="absolute right-10 bottom-12 h-20 w-20 rounded-full border border-black/10 bg-white/70" />
        <div className="absolute left-1/2 top-6 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/15 to-transparent" />
        <div className="absolute left-12 top-16 h-10 w-10 rounded-full bg-[#D6A21E]/15" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="hero-dots-consult" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(0,0,0,0.12)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots-consult)" />
          <g stroke="rgba(0,0,0,0.08)" strokeWidth="1">
            <line x1="-10%" y1="18%" x2="110%" y2="-2%" />
            <line x1="-10%" y1="52%" x2="110%" y2="32%" />
            <line x1="-10%" y1="86%" x2="110%" y2="66%" />
          </g>
        </svg>
      </div>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <LimitedTimePill />
          <span className="text-sm font-semibold text-black/60">Limited-time offer</span>
        </div>
        <h2 className="flex items-center gap-3 text-5xl font-black mb-6">
          <Calendar /> Free 1-Hour Consultation
        </h2>
        <p className="text-lg text-black/70 mb-10">
          Tell us what you’re trying to achieve — we’ll come prepared with a plan.
        </p>
      </div>

      <ConsultationForm />

      <div className="mt-10 text-black/60 text-sm">
        Prefer a quick call? Email <span className="font-semibold">info@workwithfulcrum.com</span>
      </div>
    </section>
  );
}

function ConsultationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    service: "",
    budget: "",
    timeline: "",
    goals: "",
    consent: false,
  });

  const canSubmit = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.goals.trim() && form.consent;
  }, [form]);

  function update(key) {
    return (e) => {
      const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="rounded-3xl border border-black/10 bg-white">
        <CardContent className="p-12">
          <div className="flex items-start gap-4">
            <div className="mt-1 text-[#D6A21E]"><CheckCircle2 size={28} /></div>
            <div>
              <h3 className="text-2xl font-black">Request received</h3>
              <p className="text-black/70 mt-2">
                We’ll reach out within 1–2 business days to confirm your time and next steps.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another
                </Button>
                <Link to="/services">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-8">
                    View services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-black/10 bg-white">
      <CardContent className="p-10">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name" required>
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" required>
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.email}
                onChange={update("email")}
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Phone">
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.phone}
                onChange={update("phone")}
                placeholder="(555) 555-5555"
              />
            </Field>
            <Field label="Company">
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.company}
                onChange={update("company")}
                placeholder="Company name"
              />
            </Field>
            <Field label="Website">
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.website}
                onChange={update("website")}
                placeholder="https://"
              />
            </Field>
            <Field label="Service interest">
              <select
                className="w-full border border-black/10 rounded-xl p-4 bg-white"
                value={form.service}
                onChange={update("service")}
              >
                <option value="">Select one</option>
                <option value="sales">Sales growth</option>
                <option value="acquisition">Customer acquisition</option>
                <option value="brand">Brand strategy</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Budget range">
              <select
                className="w-full border border-black/10 rounded-xl p-4 bg-white"
                value={form.budget}
                onChange={update("budget")}
              >
                <option value="">Select one</option>
                <option value="lt2k">Under $2k</option>
                <option value="2-5k">$2k–$5k</option>
                <option value="5-10k">$5k–$10k</option>
                <option value="10k+">$10k+</option>
              </select>
            </Field>
            <Field label="Timeline">
              <select
                className="w-full border border-black/10 rounded-xl p-4 bg-white"
                value={form.timeline}
                onChange={update("timeline")}
              >
                <option value="">Select one</option>
                <option value="now">ASAP</option>
                <option value="30">Next 30 days</option>
                <option value="60">Next 60 days</option>
                <option value="later">Later</option>
              </select>
            </Field>
          </div>

          <Field label="What are your goals?" required>
            <textarea
              className="w-full border border-black/10 rounded-xl p-4"
              rows={5}
              value={form.goals}
              onChange={update("goals")}
              placeholder="Ex: Increase sales by 20%, build a repeatable acquisition system, improve messaging..."
            />
          </Field>

          <label className="flex items-start gap-3 text-sm text-black/70">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.consent}
              onChange={update("consent")}
            />
            <span>
              I agree to be contacted by Fulcrum Sales & Marketing about my request.
              <span className="text-[#D6A21E] font-semibold"> *</span>
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              className={cx(
                "rounded-full px-10 py-6 text-lg",
                canSubmit
                  ? "bg-[#D6A21E] text-black hover:bg-[#B88A16]"
                  : "bg-black/10 text-black/40 cursor-not-allowed hover:bg-black/10"
              )}
            >
              Request my free consultation
            </Button>
            <Link to="/about">
              <Button className="rounded-full px-10 py-6 text-lg bg-[#121212] text-[#D6A21E] hover:bg-black">
                Contact info
              </Button>
            </Link>
          </div>

          {!canSubmit && (
            <p className="text-xs text-black/55">
              Fill out name + email + goals and check consent to submit.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

const apprentices = [
  {
    name: "Keijae Eeves",
    role: "Social Media Manager",
    quote: "The Academy gave me real-world reps and confidence I couldn’t get in a classroom.",
    img: "/apprentices/keijae.jpg",
  },
  {
    name: "Aaron Simon",
    role: "Project Manager",
    quote: "I learned how to manage projects under pressure and deliver consistently.",
    img: "/apprentices/aaron.jpg",
  },
  {
    name: "Jacob McCullars",
    role: "Brand Ambassador",
    quote: "It pushed me out of my comfort zone and into leadership fast.",
    img: "/apprentices/jacob.jpg",
  },
  {
    name: "Christian Merrick",
    role: "Project Manager",
    quote: "The coaching and structure helped me level up my execution.",
    img: "/apprentices/christian.jpg",
  },
  {
    name: "Kirstianna Bounds",
    role: "Apprentice",
    quote: "I finally understand how sales and marketing work together.",
    img: "/apprentices/kirstianna.jpg",
  },
  {
    name: "Emanuel Thomas",
    role: "Brand Ambassador",
    quote: "Best hands-on learning experience I’ve had so far.",
    img: "/apprentices/emanuel.jpg",
  },
];

function ApprenticeMarquee() {
  const row = [...apprentices, ...apprentices];

  return (
    <div className="relative">
      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F3EFE6] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F3EFE6] to-transparent z-10" />

      <div className="overflow-hidden">
        <div className="flex gap-8 fulcrum-apprentice-marquee items-stretch">
          {row.map((a, i) => (
            <div key={i} className="min-w-[220px] md:min-w-[260px]">
              <Card className="rounded-3xl border border-black/10 bg-white overflow-hidden shadow-sm">
                <div className="h-56 bg-[#F3EFE6] relative">
                  <img
                    src={a.img}
                    alt={a.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fb = e.currentTarget.parentElement?.querySelector("[data-fallback]");
                      if (fb) fb.style.display = "grid";
                    }}
                  />
                  <div
                    data-fallback
                    style={{ display: "none" }}
                    className="absolute inset-0 grid place-items-center text-black/35 text-sm font-semibold"
                  >
                    Photo
                  </div>
                </div>
                <CardContent className="p-5">
                  <h4 className="font-black">{a.name}</h4>
                  <p className="text-sm text-black/60">{a.role}</p>
                  <p className="text-xs text-black/70 mt-2 italic leading-relaxed">“{a.quote}”</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .fulcrum-apprentice-marquee {
          width: max-content;
          will-change: transform;
          animation: apprentice-scroll 32s linear infinite;
          padding: 8px 0;
        }
        .fulcrum-apprentice-marquee:hover { animation-duration: 70s; }
        @keyframes apprentice-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fulcrum-apprentice-marquee { animation: none; }
        }
      `}</style>
    </div>
  );
}

function AcademyApplication() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    
    why: "",
  });

  const canSubmit = useMemo(() => {
    return form.name.trim() && form.email.trim() && form.phone.trim() && form.why.trim();
  }, [form]);

  function update(key) {
    return (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="rounded-3xl border border-black/10 bg-white">
        <CardContent className="p-12">
          <div className="flex items-start gap-4">
            <div className="mt-1 text-[#D6A21E]"><CheckCircle2 size={28} /></div>
            <div>
              <h4 className="text-2xl font-black">Application submitted</h4>
              <p className="text-black/70 mt-2">
                Next step: we’ll reach out to schedule a quick interview.
              </p>
              <Button
                className="mt-6 bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-8"
                onClick={() => setSubmitted(false)}
              >
                Submit another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-black/10 bg-white">
      <CardContent className="p-10">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name" required>
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                placeholder="Your name"
                value={form.name}
                onChange={update("name")}
              />
            </Field>
            <Field label="Email" required>
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                placeholder="you@email.com"
                value={form.email}
                onChange={update("email")}
              />
            </Field>
            <Field label="Phone" required>
              <input
                className="w-full border border-black/10 rounded-xl p-4"
                placeholder="(555) 555-5555"
                value={form.phone}
                onChange={update("phone")}
              />
            </Field>
            <Field label="Current status">
              <select
                className="w-full border border-black/10 rounded-xl p-4 bg-white"
                value={form.status}
                onChange={update("status")}
              >
                <option value="">Select one</option>
                <option value="student">Student</option>
                <option value="grad">Recent graduate</option>
                <option value="switch">Career switcher</option>
                <option value="other">Other</option>
              </select>
            </Field>
            
          </div>

          <Field label="Why do you want to join Fulcrum Academy?" required>
            <textarea
              className="w-full border border-black/10 rounded-xl p-4"
              rows={5}
              placeholder="Tell us what you’re aiming for and what makes you a good fit..."
              value={form.why}
              onChange={update("why")}
            />
          </Field>

          <Button
            type="submit"
            className={cx(
              "w-full rounded-full py-6 text-lg",
              canSubmit
                ? "bg-[#D6A21E] text-black hover:bg-[#B88A16]"
                : "bg-black/10 text-black/40 cursor-not-allowed hover:bg-black/10"
            )}
          >
            Submit application
          </Button>

          {!canSubmit && (
            <p className="text-xs text-black/55 text-center">
              Fill out name, email, phone, and your “why” to submit.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function Service({ icon, title, desc }) {
  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-sm text-center">
      <CardContent className="p-10">
        <div className="mx-auto mb-6 text-[#D6A21E]">{icon}</div>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-black/70">{desc}</p>
      </CardContent>
    </Card>
  );
}

function FunnelCard({ title, body }) {
  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-sm">
      <CardContent className="p-10">
        <h3 className="text-2xl font-black mb-3">{title}</h3>
        <p className="text-black/70">{body}</p>
      </CardContent>
    </Card>
  );
}

function Step({ number, title, desc }) {
  return (
    <div>
      <div className="text-[#D6A21E] font-black text-4xl mb-2">{number}</div>
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-black/60 text-sm mt-1">{desc}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
        {label}
      </div>
      <div className="text-2xl font-black mt-2">{value}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-2 text-black">
        {label} {required ? <span className="text-[#D6A21E]">*</span> : null}
      </div>
      {children}
    </label>
  );
}
