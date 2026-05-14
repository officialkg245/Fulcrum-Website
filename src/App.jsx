import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useParams,
} from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  GraduationCap,
  Briefcase,
  Menu,
  X,
  Mail,
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

import navigatingNewMarkets from "./blogs/navigating-new-markets";
import healthcareServiceLaunch from "./blogs/healthcare-service-launch";
import salesPipelineFailing from "./blogs/sales-pipeline-failing";
import healthcareSpecializedFirm from "./blogs/healthcare-specialized-firm";
import telehealthMarketing2025 from "./blogs/telehealth-marketing-2025";
import conversionRateMistakes from "./blogs/conversion-rate-mistakes";

let _pdfjs = null;
let _pdfjsLoading = null;
async function getPdfjs() {
  if (_pdfjs) return _pdfjs;
  if (_pdfjsLoading) return _pdfjsLoading;
  _pdfjsLoading = (async () => {
    const pdfjs = await import("pdfjs-dist");
    const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    _pdfjs = pdfjs;
    return pdfjs;
  })();
  return _pdfjsLoading;
}

const NETLIFY_FORM_CONSULTATION = "consultation-request";
const NETLIFY_FORM_ACTION_ROI = "action-roi";
const NETLIFY_FORM_ACADEMY = "academy-application";

async function submitNetlifyUrlEncoded(formName, fields) {
  const body = new URLSearchParams();
  body.append("form-name", formName);
  for (const [key, value] of Object.entries(fields)) {
    if (key === "form-name" || value === undefined || value === null) continue;
    body.append(key, String(value));
  }
  const r = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!r.ok) throw new Error("Unable to submit. Please try again.");
}

async function submitNetlifyMultipart(formName, formData) {
  const out = new FormData();
  out.append("form-name", formName);
  for (const [key, value] of formData.entries()) {
    if (key === "form-name") continue;
    out.append(key, value);
  }
  const r = await fetch("/", { method: "POST", body: out });
  if (!r.ok) throw new Error("Unable to submit. Please try again.");
}

function PdfPageImage({
  url,
  page = 1,
  scaleCap = 2.25,
  className = "",
  alt = "PDF preview",
}) {
  const hostRef = useRef(null);
  const [hostW, setHostW] = useState(0);
  const [imgSrc, setImgSrc] = useState(null);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHostW(el.clientWidth || 0));
    ro.observe(el);
    setHostW(el.clientWidth || 0);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setImgSrc(null);
    if (!url || !hostW) return;

    (async () => {
      try {
        const pdfjs = await getPdfjs();
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        const p = await pdf.getPage(page);

        const baseViewport = p.getViewport({ scale: 1 });
        const fitScale = hostW / baseViewport.width;
        const scale = Math.max(1, Math.min(scaleCap, fitScale));
        const viewport = p.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = p.render({
          canvasContext: ctx,
          viewport,
          background: "#ffffff",
        });
        await renderTask.promise;

        const dataUrl = canvas.toDataURL("image/png");
        if (!cancelled) setImgSrc(dataUrl);

        try {
          pdf.destroy?.();
        } catch {
          // ignore
        }
      } catch {
        if (!cancelled) setImgSrc(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, page, hostW, scaleCap]);

  return (
    <div ref={hostRef} className={cx("relative", className)}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="h-full w-full grid place-items-center text-black/55 text-sm font-semibold">
          Loading preview…
        </div>
      )}
    </div>
  );
}

function PdfDocumentImages({ url, renderScale = 1.6, className = "" }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setLoading(true);
    if (!url) return;

    (async () => {
      try {
        const pdfjs = await getPdfjs();
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;

        const imgs = [];
        for (let n = 1; n <= pdf.numPages; n += 1) {
          if (cancelled) break;
          const p = await pdf.getPage(n);
          const viewport = p.getViewport({ scale: renderScale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) continue;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const renderTask = p.render({
            canvasContext: ctx,
            viewport,
            background: "#ffffff",
          });
          await renderTask.promise;

          const dataUrl = canvas.toDataURL("image/png");
          imgs.push({ page: n, src: dataUrl });
          if (!cancelled) setPages([...imgs]);
        }

        try {
          pdf.destroy?.();
        } catch {
          // ignore
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [renderScale, url]);

  return (
    <div className={cx("space-y-6", className)}>
      {loading ? (
        <div className="rounded-3xl border border-black/10 bg-white p-10 shadow-sm text-black/60 font-semibold">
          Loading document…
        </div>
      ) : null}

      {pages.map((p) => (
        <div
          key={p.page}
          className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_26px_70px_rgba(18,18,18,0.12)]"
        >
          <img
            src={p.src}
            alt={`Capabilities statement page ${p.page}`}
            className="w-full h-auto block"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
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

function TransparentWordmark({ className = "", alt = "Fulcrum" }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = "/brand/fulcrum-wordmark-white.png";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Remove near-black background while preserving antialiased edges
        const hard = 10; // fully transparent below this
        const soft = 42; // fade up to this
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          const lum = (r + g + b) / 3;
          if (lum <= hard) {
            data[i + 3] = 0;
          } else if (lum < soft) {
            const t = (lum - hard) / (soft - hard);
            data[i + 3] = Math.round(a * t);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const url = canvas.toDataURL("image/png");
        if (!cancelled) setSrc(url);
      } catch {
        // If canvas fails (rare), fall back to original asset
        if (!cancelled) setSrc("/brand/fulcrum-wordmark-white.png");
      }
    };

    img.onerror = () => {
      if (!cancelled) setSrc("/brand/fulcrum-wordmark-white.png");
    };

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <img
      src={src || "/brand/fulcrum-wordmark-white.png"}
      alt={alt}
      className={className}
      loading="eager"
      draggable={false}
    />
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

function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function useHeaderReveal({ threshold = 10, topReveal = 8 } = {}) {
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);
  const visibleRef = useRef(true);
  const rafRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY || 0;
    visibleRef.current = true;
    setVisible(true);

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        const y = window.scrollY || 0;
        const last = lastYRef.current;
        const dy = y - last;

        // Always show near the top
        if (y <= topReveal) {
          if (!visibleRef.current) {
            visibleRef.current = true;
            setVisible(true);
          }
          lastYRef.current = y;
          return;
        }

        // Ignore tiny scroll jitter
        if (Math.abs(dy) < threshold) {
          lastYRef.current = y;
          return;
        }

        const shouldShow = dy < 0; // scrolling up
        if (shouldShow !== visibleRef.current) {
          visibleRef.current = shouldShow;
          setVisible(shouldShow);
        }

        lastYRef.current = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [threshold, topReveal]);

  return visible;
}

function useCountUp(target, { duration = 1200, start = 0 } = {}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    let raf = 0;
    let startTs = 0;

    const step = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min(1, (ts - startTs) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(start + (target - start) * eased);
      if (p < 1) raf = window.requestAnimationFrame(step);
    };

    raf = window.requestAnimationFrame(step);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [duration, start, target]);

  return value;
}

function formatInt(n) {
  return Math.round(n).toLocaleString();
}

function formatCurrencyCompact(n) {
  const v = Math.max(0, n);
  if (v >= 1e9) return `$${Math.round(v / 1e9)}B`;
  if (v >= 1e6) return `$${Math.round(v / 1e6)}M`;
  return `$${Math.round(v).toLocaleString()}`;
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

function AnnouncementBar({ open = true, onClose }) {
  if (!open) return null;

  return (
    <div className="bg-[#0F0F0F] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <LimitedTimePill className="bg-[#D6A21E]/20" />
          <p className="text-xs sm:text-sm text-white/80 leading-snug">
            <span className="font-semibold text-white">Limited Time:</span>{" "}
            <span className="font-semibold text-white">Service consultation</span>{" "}
            with a{" "}
            <span className="font-semibold text-[#D6A21E]">free ROI assessment</span>{" "}
            on the call.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/consultation" className="hidden sm:inline-flex">
            <Button className="h-9 rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-5">
              Book now <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="bg-[#121212] border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5">
        <Link to="/" aria-label="Fulcrum home" className="group relative">
          {/* hover glow that radiates from the mark (no box) */}
          <div
            className="pointer-events-none absolute -inset-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[28px]"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(214,162,30,0.30), transparent 62%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.12), transparent 55%)",
              maskImage: "radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 78%)",
              WebkitMaskImage:
                "radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 78%)",
            }}
          />
          <TransparentWordmark className="relative z-10 h-7 md:h-8 w-auto drop-shadow-[0_16px_26px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out will-change-transform origin-left group-hover:scale-[1.06]" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center text-sm font-semibold text-white">
          <Link className="px-3 py-2 hover:text-[#D6A21E]" to="/about">
            About & Contact
          </Link>
          <span className="mx-2 h-5 w-px bg-gradient-to-b from-transparent via-[#D6A21E]/55 to-transparent opacity-80" />
          <Link className="px-3 py-2 hover:text-[#D6A21E]" to="/services">
            Services
          </Link>
          <span className="mx-2 h-5 w-px bg-gradient-to-b from-transparent via-[#D6A21E]/55 to-transparent opacity-80" />
          <div className="relative group">
            <div className="rounded-2xl border border-transparent group-hover:border-white/10 group-hover:bg-white/5 transition overflow-hidden group-hover:rounded-b-none">
              <Link
                className="block px-3 py-2 hover:text-[#D6A21E]"
                to="/industries"
              >
                Who We Serve
              </Link>
            </div>
            {/* Dropdown visually attached inside the Industries pill */}
            <div className="absolute left-0 top-full z-[95] w-full -mt-px opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition duration-200">
              <div className="rounded-b-2xl border border-white/10 border-t-0 bg-[#121212] text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] overflow-hidden">
                {[
                  { label: "Startups", to: "/industries?focus=Startups" },
                  { label: "Technology Companies", to: "/industries?focus=Technology%20Companies" },
                  { label: "Enterprise Teams", to: "/industries?focus=Enterprise%20Teams" },
                  { label: "Professional Services", to: "/industries?focus=Professional%20Services" },
                  { label: "Nonprofits", to: "/industries?focus=Nonprofits" },
                  { label: "Government", to: "/industries/government" },
                  { label: "Small Businesses", to: "/industries?focus=Small%20Businesses" },
                  { label: "Healthcare & Medical", to: "/industries?focus=Healthcare%20%26%20Medical" },
                  { label: "Oil and Gas", to: "/industries?focus=Oil%20and%20Gas" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-3 py-2 text-[12px] font-semibold text-white/90 hover:text-white hover:bg-white/10 transition text-center"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <span className="mx-2 h-5 w-px bg-gradient-to-b from-transparent via-[#D6A21E]/55 to-transparent opacity-80" />
          <Link className="px-3 py-2 hover:text-[#D6A21E]" to="/case-studies">
            Case Studies
          </Link>
          <span className="mx-2 h-5 w-px bg-gradient-to-b from-transparent via-[#D6A21E]/55 to-transparent opacity-80" />
          <Link className="px-3 py-2 hover:text-[#D6A21E]" to="/academy">
            Academy
          </Link>
          <span className="mx-2 h-5 w-px bg-gradient-to-b from-transparent via-[#D6A21E]/55 to-transparent opacity-80" />
          <Link className="px-3 py-2 hover:text-[#D6A21E]" to="/blogs">
            Blogs
          </Link>
          <span className="mx-3 h-6 w-px bg-gradient-to-b from-transparent via-[#D6A21E]/55 to-transparent opacity-80" />
          <div className="relative group pl-1">
            <Link to="/consultation" className="inline-flex">
              <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-6">
                Limited-Time ROI Assessment
              </Button>
            </Link>

            {/* Dropdown: no hover-gap (wrapper touches trigger) */}
            <div className="absolute right-0 top-full z-[90] w-[360px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition duration-200">
              <div className="rounded-2xl border border-white/10 bg-[#121212] text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    Data we need for ROI assessment
                  </div>
                </div>
                <div className="p-5 space-y-3 text-sm text-white/80">
                  {[
                    "Initial order value",
                    "Lifetime value of customer",
                    "Gross profit margin (Revenue - COGS)",
                    "Win rate (close rate)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#D6A21E] shadow-[0_0_18px_rgba(214,162,30,0.55)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 pt-0">
                  <Link to="/consultation" className="inline-flex">
                    <Button className="rounded-full bg-white/10 text-white hover:bg-white/15 px-5">
                      Start ROI assessment <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet nav */}
        <div className="flex lg:hidden items-center gap-2">
          <Link to="/consultation" className="hidden sm:inline-flex">
            <Button className="h-10 bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-4">
              ROI Assessment
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile slide-over menu */}
      <div
        className={cx(
          "lg:hidden fixed inset-0 z-[140] transition",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cx(
            "absolute inset-0 bg-black/85 supports-[backdrop-filter]:bg-black/65 backdrop-blur-xl backdrop-saturate-50 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cx(
            "absolute right-0 top-0 h-full w-[86%] max-w-[420px] bg-[#121212] border-l border-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.6)] transition-transform duration-200 flex flex-col",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <Link
              to="/"
              className="relative group"
              aria-label="Fulcrum home"
              onClick={() => setMobileOpen(false)}
            >
              <TransparentWordmark className="h-7 w-auto drop-shadow-[0_16px_26px_rgba(0,0,0,0.55)]" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="rounded-[2rem] border border-white/10 bg-black/35 supports-[backdrop-filter]:bg-black/30 backdrop-blur-md shadow-[0_18px_70px_rgba(0,0,0,0.45)] p-3">
              <div className="grid grid-cols-1 gap-2 text-[13px] font-semibold">
                {[
                  { to: "/about", label: "About & Contact" },
                  { to: "/services", label: "Services" },
                  { to: "/industries", label: "Who We Serve" },
                  { to: "/industries/government", label: "Government" },
                  { to: "/case-studies", label: "Case Studies" },
                  { to: "/academy", label: "Academy" },
                  { to: "/blogs", label: "Blogs" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-white hover:bg-white/15 transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-black/35 via-black/25 to-[#D6A21E]/10 supports-[backdrop-filter]:bg-black/20 backdrop-blur-md p-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
                  Contact
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <a
                    href="mailto:info@workwithfulcrum.com"
                    className="group rounded-2xl border border-white/10 bg-white/10 px-3 py-3 hover:bg-white/15 transition"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="h-9 w-9 rounded-2xl bg-black/35 border border-white/10 grid place-items-center text-[#D6A21E]">
                        <Mail size={16} />
                      </div>
                      <div className="mt-2 text-[11px] font-semibold text-white/85">Email</div>
                    </div>
                  </a>

                  <a
                    href="tel:+13373350046"
                    className="group rounded-2xl border border-white/10 bg-white/10 px-3 py-3 hover:bg-white/15 transition"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="h-9 w-9 rounded-2xl bg-black/35 border border-white/10 grid place-items-center text-[#D6A21E]">
                        <Phone size={16} />
                      </div>
                      <div className="mt-2 text-[11px] font-semibold text-white/85">Call</div>
                    </div>
                  </a>

                  <a
                    href={linkedInCompanyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-2xl border border-white/10 bg-white/10 px-3 py-3 hover:bg-white/15 transition"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="h-9 w-9 rounded-2xl bg-black/35 border border-white/10 grid place-items-center text-[#D6A21E]">
                        <Linkedin size={16} />
                      </div>
                      <div className="mt-2 text-[11px] font-semibold text-white/85">LinkedIn</div>
                    </div>
                  </a>
                </div>

                <div className="mt-3 grid gap-2">
                  <Link to="/consultation" onClick={() => setMobileOpen(false)} className="inline-flex w-full">
                    <Button className="w-full rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-6 py-3">
                      Get in touch <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                  <Link
                    to="/about#contact"
                    onClick={() => setMobileOpen(false)}
                    className="text-xs font-semibold text-white/70 hover:text-white inline-flex items-center justify-center gap-2"
                  >
                    Contact details <ArrowRight size={16} className="text-[#D6A21E]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function SiteFooter() {
  const { pathname } = useLocation();
  const key = (pathname.split("?")[0].split("#")[0].split("/")[1] || "home").toLowerCase();

  const quickLinksByKey = {
    home: [
      { to: "/services", label: "Services" },
      { to: "/case-studies", label: "Case studies" },
      { to: "/consultation", label: "Consultation" },
    ],
    about: [
      { to: "/services", label: "Services" },
      { to: "/academy", label: "Academy" },
      { to: "/consultation", label: "Consultation" },
    ],
    services: [
      { to: "/industries", label: "Who We Serve" },
      { to: "/case-studies", label: "Case studies" },
      { to: "/consultation", label: "Consultation" },
    ],
    industries: [
      { to: "/services", label: "Services" },
      { to: "/case-studies", label: "Case studies" },
      { to: "/blogs", label: "Blogs" },
    ],
    "case-studies": [
      { to: "/industries", label: "Who We Serve" },
      { to: "/services", label: "Services" },
      { to: "/blogs", label: "Blogs" },
    ],
    blogs: [
      { to: "/services", label: "Services" },
      { to: "/case-studies", label: "Case studies" },
      { to: "/consultation", label: "Consultation" },
    ],
    academy: [
      { to: "/about", label: "About" },
      { to: "/consultation", label: "Consultation" },
      { to: "/blogs", label: "Blogs" },
    ],
    consultation: [
      { to: "/services", label: "Services" },
      { to: "/case-studies", label: "Case studies" },
      { to: "/academy", label: "Academy" },
    ],
  };

  const quickLinks = quickLinksByKey[key] || quickLinksByKey.home;

  return (
    <footer className="border-t border-black/10 bg-[#F3EFE6]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="max-w-sm">
            <div className="inline-flex items-center">
              <img
                src="/brand/fulcrum-wordmark.png"
                alt="Fulcrum"
                className="h-8 w-auto opacity-90"
                loading="lazy"
                draggable={false}
              />
            </div>

            <div className="mt-6 inline-flex flex-col items-start gap-2 rounded-3xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/55">
                Contract vehicles
              </div>
              <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
                <img
                  src="/badges/gsa-contract.png"
                  alt="GSA Contract Holder — Contract # 47QRAA25D00AV"
                  className="h-8 sm:h-9 w-auto opacity-85 grayscale contrast-125"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full md:max-w-3xl">
            <div>
              <div className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Contact</div>
              <div className="mt-4 space-y-3 text-sm font-semibold text-black/80">
                <a className="block hover:text-black" href="mailto:info@workwithfulcrum.com">
                  info@workwithfulcrum.com
                </a>
                <a className="block hover:text-black" href="tel:+13373350046">
                  337-335-0046
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Visit</div>
              <div className="mt-4 text-sm text-black/70 leading-relaxed">
                108 Kol Dr
                <br />
                Broussard, LA 70518
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Quick links</div>
              <div className="mt-4 space-y-3 text-sm font-semibold text-black/70">
                {quickLinks.map((l) => (
                  <Link key={l.to} className="block hover:text-black" to={l.to}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-black/60">
            © {new Date().getFullYear()} Fulcrum Sales &amp; Marketing. All rights reserved.
          </p>
          <a
            href="https://www.workwithfulcrum.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-black/70 hover:text-black"
          >
            workwithfulcrum.com <ArrowRight className="inline-block ml-1" size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTopOnNavigate() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch {}
    }
  }, []);

  useLayoutEffect(() => {
    // Robust cross-browser reset (some browsers ignore the object form)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    // One more tick after paint to prevent any snap-back
    const raf = window.requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [pathname, search, hash]);

  return null;
}

export default function FulcrumWebsite() {
  const headerVisible = useHeaderReveal();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [announcementOpen, setAnnouncementOpen] = useState(() => {
    try {
      return sessionStorage.getItem("fulcrum_announcement_dismissed") !== "1";
    } catch {
      return true;
    }
  });

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height || 0);
      setHeaderHeight(h);
    };
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Router>
      <ScrollToTopOnNavigate />
      <div className="min-h-screen bg-[#F3EFE6] text-[#121212]">
        {/* Header spacer to prevent layout jump */}
        <div
          style={{ height: headerHeight }}
          className="transition-[height] duration-300 ease-out"
          aria-hidden="true"
        />

        <header
          ref={headerRef}
          className={cx(
            "fixed inset-x-0 top-0 z-[80] will-change-transform transition-transform duration-300 ease-out",
            headerVisible ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <AnnouncementBar
            open={announcementOpen}
            onClose={() => {
              setAnnouncementOpen(false);
              try {
                sessionStorage.setItem("fulcrum_announcement_dismissed", "1");
              } catch {}
            }}
          />
          <Navbar />
        </header>

        {/* BBB badge (site-wide) */}
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

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/core" element={<ServicesCore />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/industries/government" element={<IndustriesGovernment />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/action" element={<Action />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogPost />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/track/sales" element={<AcademyTrackSales />} />
          <Route path="/academy/track/operations" element={<AcademyTrackOperations />} />
          <Route path="/consultation" element={<Consultation />} />
        </Routes>

        <SiteFooter />
      </div>
    </Router>
  );
}

// Brand logos (place these files in /public with these names)
const brands = [
  { src: "/brands/winrock.png", alt: "Winrock International" },
  { src: "/brands/brand-unnamed.png", alt: "Client brand" },
  { src: "/brands/viemed.png", alt: "VieMed" },
  { src: "/brands/hello-world.png", alt: "Hello World" },
  { src: "/brands/brand-fdnnsafa.png", alt: "Client brand" },
  { src: "/brands/abre.png", alt: "Abre" },
  { src: "/brands/scoutly.png", alt: "Scoutly" },
  { src: "/brands/schoolmint.png", alt: "SchoolMint" },
  { src: "/brands/southern-miss.png", alt: "The University of Southern Mississippi" },
  { src: "/brands/skillmasters.png", alt: "Skillmasters" },
];

// Homepage "Culture" section data (swap with real links/posts anytime)
const cultureLinkedInPosts = [
  {
    date: "Recent post",
    title: "Momentum in the first 30 days",
    excerpt:
      "How we create early wins without sacrificing quality — and what we measure weekly to keep it compounding.",
    url: "https://www.linkedin.com/company/fulcrum-sales-marketing/",
    image: "", // optional: paste an image path (e.g. "/culture/post-1.jpg")
  },
  {
    date: "Recent post",
    title: "Scorecards that drive behavior",
    excerpt:
      "The simplest scorecard we’ve seen work across roles — and how to run it without turning it into bureaucracy.",
    url: "https://www.linkedin.com/company/fulcrum-sales-marketing/",
    image: "",
  },
  {
    date: "Recent post",
    title: "Adaptive execution (no chaos)",
    excerpt:
      "What changes when your business changes — and what should stay constant so execution doesn’t drift.",
    url: "https://www.linkedin.com/company/fulcrum-sales-marketing/",
    image: "",
  },
];

const linkedInCompanyUrl = "https://www.linkedin.com/company/33227086";
const linkedInCompanyId = "33227086";

const testimonialsData = [
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
];

// Blogs (starter content — swap with real posts anytime)
const blogPosts = [
  conversionRateMistakes,
  navigatingNewMarkets,
  healthcareServiceLaunch,
  salesPipelineFailing,
  healthcareSpecializedFirm,
  telehealthMarketing2025,
];

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

  const customersServed = useCountUp(210);
  const oppsCreated = useCountUp(5750);
  const pipelineGenerated = useCountUp(1_000_000_000);
  const revenueGenerated = useCountUp(186_000_000);

  const featuredBlog = useMemo(() => {
    return blogPosts.find((p) => p?.featured) || blogPosts[0];
  }, []);

  const featuredVideoUrl =
    "https://www.linkedin.com/feed/update/urn:li:activity:7424826332301312000/?originTrackingId=4nxMDEg%2FCJjxelJZn%2BTo5w%3D%3D";
  const featuredVideoEmbedUrl = featuredVideoUrl
    ? featuredVideoUrl.split("?")[0].replace("https://www.linkedin.com/feed/update/", "https://www.linkedin.com/embed/feed/update/")
    : "";
  const linkedInPreviewUrl = linkedInCompanyUrl;

  return (
    <>
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

        {/* Bottom bleed into page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#F3EFE6]" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-24 lg:py-28">
          <div className="grid lg:grid-cols-3 gap-10 items-center">
            {/* Left luxury copy */}
            <div className="lg:col-span-2">
              {/* Brand wordmark */}
              <h1 className="mt-5 leading-[1.08] overflow-visible">
                <span className="inline-block pb-2 text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                  Creating growth opportunities should be easy
                </span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl mt-6 max-w-2xl">
                We grow B2B companies’ revenue opportunities through performance-driven sales, outreach, and growth services aligned to your ROI.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/consultation">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-8 sm:px-12 py-5 sm:py-6 text-lg shadow-[0_0_40px_rgba(214,162,30,0.35)]">
                    Limited-Time ROI Assessment <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/case-studies">
                  <Button className="bg-white/10 text-white hover:bg-white/20 rounded-full px-8 sm:px-12 py-5 sm:py-6 text-lg">
                    View our case studies <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* Right glass card */}
            <div className="relative rounded-3xl border border-white/15 bg-white/8 backdrop-blur-xl p-8 md:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 -right-28 w-[360px] h-[360px] bg-[#D6A21E]/16 rounded-[84px] blur-[80px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-70" />
              </div>

              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Outcomes that compound.
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  A snapshot of what disciplined execution can produce.
                </p>

                <div className="mt-6 h-px w-full bg-white/10" />

                <div className="mt-6 space-y-5">
                  <div className="flex items-end justify-between gap-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Customers served
                    </div>
                    <div className="text-3xl md:text-[34px] font-black tracking-tight text-white">
                      <span className="bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                        +{formatInt(customersServed)}
                      </span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  <div className="flex items-end justify-between gap-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Sales opportunities created
                    </div>
                    <div className="text-3xl md:text-[34px] font-black tracking-tight text-white">
                      <span className="bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                        +{formatInt(oppsCreated)}
                      </span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  <div className="flex items-end justify-between gap-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Pipeline generated
                    </div>
                    <div className="text-3xl md:text-[34px] font-black tracking-tight text-white">
                      <span className="bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                        {formatCurrencyCompact(pipelineGenerated)}
                      </span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  <div className="flex items-end justify-between gap-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Revenue generated
                    </div>
                    <div className="text-3xl md:text-[34px] font-black tracking-tight text-white">
                      <span className="bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                        {formatCurrencyCompact(revenueGenerated)}
                      </span>
                    </div>
                  </div>
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
                    Trusted by B2B organizations building real revenue opportunities
                  </h2>
                </div>
                <Link to="/case-studies">
                  <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-6">
                    See results <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-10 w-screen">
              <BrandsMarquee items={brands} showFades={false} />
            </div>
          </div>
        </div>

        {/* Buffer so next section can overlap without covering marquee */}
        <div className="h-20 md:h-24" aria-hidden="true" />
      </section>

      {/* SERVICES PREVIEW */}
      <section className="relative -mt-16 md:-mt-20 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-black/10 p-10 md:p-12 relative overflow-hidden shadow-[0_26px_70px_rgba(18,18,18,0.18)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#D6A21E]/12 rotate-12 rounded-[92px] blur-[90px]" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>

            <div className="relative">
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
                    Fulcrum develops AND executes revenue growth strategies customized around your business's stage, size, and customer markets. Leveraging our experience across dozens of markets, growth channels, technology, and tactics - we are consulting by doing.
                  </p>
                </div>
                <Link to="/services">
                  <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8">
                    Explore services <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid lg:grid-cols-3 gap-8">
                <PreviewCard
                  icon={<TrendingUp />}
                  title="Business development"
                  desc="We target, identify, qualify and engage with your prospects to generate real revenue pipeline for you."
                />
                <PreviewCard
                  icon={<Briefcase />}
                  title="Corporate development"
                  desc="We find you strategic partnership and acquisition opportunities for alternative growth."
                />
                <PreviewCard
                  icon={<Users />}
                  title="People development"
                  desc="Up-skill your systems, processes and people with our best practices and what is working in our partnership"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE OUR CULTURE (multi-section, content-ready) */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-white via-[#FFF7E6] to-[#F3EFE6] text-[#121212] shadow-[0_30px_90px_rgba(214,162,30,0.14)]">
            {/* ambient accents */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-44 -right-40 w-[640px] h-[640px] bg-[#D6A21E]/16 rotate-12 rounded-[110px] blur-[70px]" />
              <div className="absolute -bottom-52 -left-52 w-[720px] h-[720px] bg-black/5 -rotate-12 rounded-[120px] blur-[90px]" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6A21E]/45 to-transparent opacity-70" />
              <div className="absolute left-1/2 top-12 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(rgba(214,162,30,0.30)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="absolute inset-0 opacity-[0.22] [background:radial-gradient(circle_at_18%_18%,rgba(214,162,30,0.22),transparent_56%)]" />
              <div className="absolute inset-y-0 -left-1/3 w-[120%] rotate-[-8deg] bg-[linear-gradient(115deg,transparent,rgba(214,162,30,0.10),transparent)] opacity-70" />
            </div>

            <div className="relative p-10 md:p-12">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.35)]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                      Explore our culture
                    </p>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4">
                    We are <span className="text-[#D6A21E]">Co-Creators of Value</span>.
                  </h2>
                  <p className="text-black/70 mt-5 text-lg">
                    Get to know our team and culture
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/about">
                    <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-8 shadow-[0_14px_34px_rgba(18,18,18,0.18)]">
                      Meet Leadership <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                  <Link to="/academy">
                    <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-8 shadow-[0_0_0_1px_rgba(214,162,30,0.28),0_18px_44px_rgba(214,162,30,0.22)]">
                      Fulcrum Academy <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-10 grid md:grid-cols-3 gap-6">
                <div className="group rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur hover:bg-white/80 hover:shadow-[0_20px_60px_rgba(214,162,30,0.14)] transition">
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                    Accountability
                  </div>
                  <div className="font-black text-xl mt-3">Pursuing what matters</div>
                  <p className="text-black/70 mt-3">
                    We measure what matters weekly and execute what moves the needle.
                  </p>
                </div>
                <div className="group rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur hover:bg-white/80 hover:shadow-[0_20px_60px_rgba(214,162,30,0.14)] transition">
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                    Alignment
                  </div>
                  <div className="font-black text-xl mt-3">Repetitive feedback loops</div>
                  <p className="text-black/70 mt-3">
                    Continuous learning built into execution — not “training once.”
                  </p>
                </div>
                <div className="group rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur hover:bg-white/80 hover:shadow-[0_20px_60px_rgba(214,162,30,0.14)] transition">
                  <div className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                    Action
                  </div>
                  <div className="font-black text-xl mt-3">Activities that build assets</div>
                  <p className="text-black/70 mt-3">
                    Processes that scale outcomes without relying on heroics.
                  </p>
                </div>
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

              {/* Client words (testimonials marquee) */}
              <div className="mt-12 pt-10 border-t border-white/10">
                <div className="flex items-end justify-between gap-8 flex-wrap">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#D6A21E]" />
                      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                        Client Testimonials
                      </p>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black mt-4">
                      What people say after we are engaged.
                    </h3>
                  </div>
                  <Link to="/case-studies" className="shrink-0">
                    <Button className="rounded-full bg-white/10 text-white hover:bg-white/15 px-8">
                      View case studies <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#121212] to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#121212] to-transparent" />
                  <TestimonialMarquee items={testimonialsData} baseSpeed={26} hoverSpeed={8} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ON LINKEDIN */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-white via-[#FFF7E6] to-[#F3EFE6] text-[#121212] shadow-[0_30px_90px_rgba(214,162,30,0.14)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-44 -right-40 w-[640px] h-[640px] bg-[#D6A21E]/16 rotate-12 rounded-[110px] blur-[75px]" />
              <div className="absolute -bottom-52 -left-52 w-[720px] h-[720px] bg-black/5 -rotate-12 rounded-[120px] blur-[95px]" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6A21E]/45 to-transparent opacity-70" />
              <div className="absolute left-1/2 top-12 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(rgba(214,162,30,0.30)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="absolute inset-0 opacity-[0.18] [background:radial-gradient(circle_at_18%_18%,rgba(214,162,30,0.22),transparent_56%)]" />
              <div className="absolute inset-y-0 -left-1/3 w-[120%] rotate-[-8deg] bg-[linear-gradient(115deg,transparent,rgba(214,162,30,0.10),transparent)] opacity-70" />
            </div>

            <div className="relative p-10 md:p-12">
              <div className="flex items-end justify-between gap-8 flex-wrap">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_24px_rgba(214,162,30,0.35)]" />
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                      Explore our culture • Latest on LinkedIn
                    </p>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mt-4">
                    Posts, wins, and what we’re learning.
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <a href={linkedInCompanyUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-8">
                      Follow on LinkedIn <ArrowRight className="ml-2" />
                    </Button>
                  </a>
                  {li.needsAuth ? (
                    <a
                      href={li.authUrl || "/api/linkedin/auth"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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

              <div className="mt-10 grid lg:grid-cols-[minmax(0,1fr)_520px] gap-8 items-stretch">
                {/* LEFT: LinkedIn preview + Featured blog */}
                <div className="space-y-6">
                  {/* LinkedIn company preview (URL) */}
                  <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur overflow-hidden shadow-sm hover:shadow-[0_24px_70px_rgba(214,162,30,0.14)] transition-shadow">
                    <div className="p-6 border-b border-black/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
                          LinkedIn
                        </div>
                        <div className="mt-2 font-black text-lg">Preview our company page</div>
                      </div>
                      <a href={linkedInPreviewUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-6 py-3 text-sm">
                          Open LinkedIn <ArrowRight className="ml-1" size={18} />
                        </Button>
                      </a>
                    </div>

                    <a
                      href={linkedInPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      aria-label="Open Fulcrum LinkedIn page"
                    >
                      <div className="aspect-video bg-[#121212] relative overflow-hidden">
                        <img
                          src="/culture/fulcrum-building.png"
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                        <div className="pointer-events-none absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute inset-0 opacity-[0.18] [background:radial-gradient(circle_at_20%_20%,rgba(214,162,30,0.30),transparent_55%)]" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
                            <Linkedin size={14} className="text-white/85" />
                            Preview our company page
                          </div>
                          <div className="mt-2 text-xs text-white/70">
                            Click to open the feed, updates, and company profile on LinkedIn.
                          </div>
                        </div>
                      </div>
                    </a>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="text-sm font-semibold text-black/70">Follow for updates</div>
                        <div className="hidden sm:block">
                          <LinkedInFollowCompany companyId={linkedInCompanyId} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured blog UNDER the URL part */}
                  {featuredBlog ? (
                    <Link
                      to={`/blogs/${featuredBlog.slug}`}
                      className="group rounded-3xl border border-black/10 bg-white/70 backdrop-blur overflow-hidden hover:bg-white/80 transition-colors shadow-sm hover:shadow-[0_24px_70px_rgba(214,162,30,0.14)]"
                    >
                      <div className="p-6 border-b border-black/10 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
                            Featured blog
                          </div>
                          <div className="mt-2 font-black text-lg">From the blog</div>
                        </div>
                        <span className="text-[11px] font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
                          {featuredBlog.readTime || "Read"}
                        </span>
                      </div>

                      <div className="relative h-44 bg-black/10 border-b border-black/10 overflow-hidden">
                        {featuredBlog.coverImage ? (
                          <>
                            <img
                              src={featuredBlog.coverImage}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                              loading="lazy"
                              draggable={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                            <div className="absolute inset-0 opacity-[0.22] [background:radial-gradient(circle_at_20%_20%,rgba(214,162,30,0.35),transparent_55%)]" />
                          </>
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-black/50 text-sm font-semibold">
                            Blog cover
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                          {featuredBlog.category || "Blog"}
                        </div>
                        <div className="mt-3 font-black text-xl leading-snug group-hover:text-[#D6A21E] transition text-black">
                          {featuredBlog.title}
                        </div>
                        <p className="mt-3 text-black/70 leading-relaxed line-clamp-3">
                          {featuredBlog.excerpt}
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D6A21E] group-hover:text-[#F2D27A]">
                          Read article <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  ) : null}
                </div>

                {/* RIGHT: Video takes the entire side */}
                <aside className="h-full self-stretch">
                  <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur overflow-hidden h-full flex flex-col shadow-sm hover:shadow-[0_24px_70px_rgba(214,162,30,0.14)] transition-shadow">
                    <div className="p-6 border-b border-black/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
                          Featured video
                        </div>
                        <div className="mt-2 font-black text-lg text-black">
                          Focus (80/20) — how we think about impact
                        </div>
                      </div>
                      <a href={featuredVideoUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-6 py-3 text-sm">
                          Watch on LinkedIn <ArrowRight className="ml-1" size={18} />
                        </Button>
                      </a>
                    </div>

                    <div className="flex-1 min-h-[320px] bg-black/30 relative overflow-hidden">
                      {featuredVideoEmbedUrl ? (
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src={featuredVideoEmbedUrl}
                          title="Featured video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <a
                          href={featuredVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 grid place-items-center text-center px-6"
                        >
                          <div>
                            <div className="mx-auto h-14 w-14 rounded-full bg-white/10 border border-white/15 grid place-items-center">
                              <div className="h-0 w-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[#D6A21E] ml-1" />
                            </div>
                            <div className="mt-4 text-sm font-semibold text-white/80">Preview on LinkedIn</div>
                            <div className="mt-1 text-xs text-white/55">Open the post to watch the video.</div>
                          </div>
                        </a>
                      )}
                    </div>

                    <div className="p-6 border-t border-black/10 bg-[#F3EFE6]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">
                        Key takeaway
                      </div>
                      <p className="mt-3 text-black/70 leading-relaxed">
                        We use the 80/20 rule to narrow down to the inputs that create the highest impact — for
                        Fulcrum and for our customers.
                      </p>
                      <div className="mt-5 flex items-center gap-3 flex-wrap">
                        <a
                          href={linkedInPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#D6A21E] hover:text-[#F2D27A]"
                        >
                          See more on LinkedIn <ArrowRight size={16} />
                        </a>
                        <span className="text-xs text-black/30">•</span>
                        <Link
                          to="/blogs"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black"
                        >
                          Browse blogs <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </aside>
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
    <Card className="group relative h-full rounded-3xl border border-black/10 bg-gradient-to-br from-white to-[#F3EFE6] shadow-md overflow-hidden">
      {/* gold accent */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[220px] h-[220px] bg-[#D6A21E]/20 rotate-12 rounded-[40px] blur-[20px] transition-opacity duration-300 group-hover:opacity-80" />

      <CardContent className="relative p-10 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center shadow">
            {icon}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-black/50">Core</span>
        </div>

        <h4 className="text-2xl lg:text-[22px] xl:text-2xl lg:whitespace-nowrap font-black mt-6 group-hover:text-[#D6A21E] transition">
          {title}
        </h4>
        <p className="text-black/70 mt-3 leading-relaxed flex-1">{desc}</p>

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
              Built for <span className="text-[#D6A21E]">performance</span>. Tuned for alignment
            </h2>
            <p className="text-black/70 text-lg md:text-xl mt-6">
              We build sales + marketing systems, train people to run them, and keep execution tight with accountability.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/consultation">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg">
                  Customize your campaign <ArrowRight className="ml-2" />
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

      <section className="relative -mt-16 md:-mt-20 pt-0 pb-24 px-6 max-w-7xl mx-auto space-y-20">
        {/* About Intro */}
        <div className="relative overflow-hidden rounded-[2.75rem] border border-black/10 bg-[#121212] text-white shadow-[0_22px_60px_rgba(18,18,18,0.22)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/18 rotate-12 rounded-[96px] blur-[90px]" />
            <div className="absolute -bottom-32 -left-32 w-[560px] h-[560px] bg-white/8 -rotate-12 rounded-[110px] blur-[110px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
            <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:26px_26px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(214,162,30,0.18),transparent_60%),radial-gradient(circle_at_85%_35%,rgba(255,255,255,0.10),transparent_62%),radial-gradient(circle_at_50%_95%,rgba(0,0,0,0.75),transparent_55%)]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(214,162,30,0.20),transparent_60%)]" />
          </div>

          <div className="relative p-10 md:p-14">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_22px_rgba(214,162,30,0.55)]" />
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                Who we are
              </p>
            </div>

            <h3 className="mt-5 text-4xl md:text-5xl font-black tracking-tight">
              A business development firm built for{" "}
              <span className="bg-gradient-to-r from-[#D6A21E] via-[#F2D27A] to-[#D6A21E] text-transparent bg-clip-text">
                execution
              </span>
              .
            </h3>

            <p className="mt-5 text-white/70 text-lg leading-relaxed max-w-4xl">
              Founded nearly a decade ago, Fulcrum helps organizations grow through disciplined sales and marketing execution —
              both <strong className="text-white">organically</strong> (winning customers) and{" "}
              <strong className="text-white">inorganically</strong> (acquisitions).
            </p>
            <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-4xl">
              Whether you’re a startup, diversifying revenue, launching new products/services, or pushing for market share,
              we build the system and the cadence that keeps results compounding.
            </p>

            <div className="mt-10 grid md:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Organic growth</div>
                <div className="mt-3 font-black text-xl">Customer acquisition</div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Offers, messaging, outbound, and pipeline systems that create qualified conversations.
                </p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Inorganic growth</div>
                <div className="mt-3 font-black text-xl">M&amp;A deal flow</div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Structured sourcing, outreach, and follow-through so acquisitions don’t distract the business.
                </p>
              </div>
              <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Execution</div>
                <div className="mt-3 font-black text-xl">Cadence + scorecards</div>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Weekly rhythms, reporting, and accountability that keep the team aligned to revenue outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values + Mission */}
        <div className="grid md:grid-cols-2 gap-10">
          <Card className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#D6A21E]/10 rotate-12 rounded-[80px] blur-[80px]" />
              <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>
            <CardContent className="relative p-10">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#D6A21E]" />
                <h4 className="text-2xl font-black">Our Mission</h4>
              </div>
              <p className="text-black/70 mt-5 leading-relaxed">
                Fulcrum helps organizations proactively uncover and activate untapped revenue opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute -bottom-28 -left-28 w-[360px] h-[360px] bg-black/5 -rotate-12 rounded-[90px] blur-[90px]" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>
            <CardContent className="relative p-10">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#D6A21E]" />
                <h4 className="text-2xl font-black">What We Value</h4>
              </div>
              <ul className="mt-6 space-y-3 text-black/70">
                {[
                  "Love First, Eat Last",
                  "Think Big, Act Small",
                  "Plan for Tomorrow, Execute Today",
                  "Always Care, Always Compete",
                  "Beauty Is in the Eye of the Beholder",
                ].map((v) => (
                  <li key={v} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#D6A21E] shadow-[0_0_14px_rgba(214,162,30,0.35)]" />
                    <span className="leading-relaxed">{v}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="relative">
          <div className="relative z-10 flex items-end justify-between gap-8 flex-wrap mb-10 pt-24 md:pt-28">
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
                Meet the <span className="text-[#D6A21E]">Leadership Team</span>
              </h3>
              <div className="mt-4 h-px w-48 bg-gradient-to-r from-[#D6A21E] via-black/20 to-transparent" />
              
            </div>
            <div className="hidden md:flex items-center gap-3 text-sm font-semibold text-black/60">
              <span className="h-2 w-2 rounded-full bg-[#D6A21E] shadow-[0_0_18px_rgba(214,162,30,0.45)]" />
              Built on accountability
            </div>
          </div>

          <div className="relative z-10 mt-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member) => (
                <a
                  key={member.name + member.role}
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
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
                <div className="flex items-center gap-3"><span className="text-[#D6A21E]"><Phone size={18} /></span><span>337-335-0046</span></div>
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
                rel="noopener noreferrer"
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
    name: "Tristin Tauzin",
    role: "Chief Operating Officer",
    description:
      "Leads recruiting, onboarding, and talent development while supporting client growth initiatives.",
    linkedin: "https://www.linkedin.com/in/tristin-tauzin-6225b8164/",
    img: "/team/tristin.png",
  },
  {
    name: "Patrick Hundley",
    role: "Head of Systems and Integration",
    description:
      "Designs and manages internal systems and client operations to ensure consistency, performance, and accountability across accounts.",
    linkedin: "https://www.linkedin.com/in/patrick-hundley-78a38313b/",
    img: "/team/patrick.png",
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

function BlogCard({ post, compact = false }) {
  return (
    <Link to={`/blogs/${post.slug}`} className="group block h-full">
      <Card
        className={cx(
          "group relative h-full rounded-3xl border border-black/10 bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow",
          compact ? "min-h-[280px]" : "min-h-[320px]"
        )}
      >
        {/* premium accents */}
        <div className="pointer-events-none absolute inset-0">
          {post?.coverImage ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.30] saturate-[1.05] contrast-110"
                style={{ backgroundImage: `url(${post.coverImage})` }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(214,162,30,0.26),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.64),rgba(255,255,255,0.48)_45%,rgba(255,255,255,0.62))]" />
            </>
          ) : null}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
          <div className="absolute -top-24 -right-24 w-[260px] h-[260px] bg-[#D6A21E]/10 rotate-12 rounded-[60px] blur-[60px]" />
          <div className="absolute -bottom-24 -left-24 w-[260px] h-[260px] bg-black/5 -rotate-12 rounded-[60px] blur-[70px]" />
        </div>

        <CardContent className={cx("relative h-full flex flex-col", compact ? "p-8" : "p-10")}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold bg-white/70 text-black/70 px-3 py-1 rounded-full border border-black/10">
              {post.category}
            </span>
            <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
              {post.readTime}
            </span>
          </div>

          <h3
            className={cx(
              "font-black mt-5 leading-tight group-hover:text-[#D6A21E] transition",
              compact ? "text-xl" : "text-2xl md:text-3xl"
            )}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: compact ? 2 : 3,
              overflow: "hidden",
            }}
          >
            {post.title}
          </h3>

          <p
            className={cx(
              "text-black/70 mt-4 leading-relaxed",
              compact ? "text-sm" : "text-base"
            )}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: compact ? 3 : 4,
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>

          <div className="mt-auto pt-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
              {post.date} • {post.author}
            </p>
            <div className="inline-flex items-center text-sm font-semibold text-black/70 group-hover:text-black transition">
              Read post <ArrowRight className="ml-2" size={18} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Blogs() {
  const sorted = useMemo(() => {
    return [...blogPosts].sort((a, b) => {
      const ad = a?.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bd = b?.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bd - ad;
    });
  }, []);

  const featured = sorted.find((p) => p.featured) || sorted[0];
  const rest = sorted.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F3EFE6]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 w-[620px] h-[620px] bg-[#121212]/6 rotate-12 rounded-[96px]" />
          <div className="absolute -bottom-32 -left-32 w-[620px] h-[620px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px]" />
          <div className="absolute left-1/2 top-8 h-px w-[68%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/12 to-transparent" />
          <div className="absolute left-1/2 top-[4.25rem] h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D6A21E]/35 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.70),transparent_52%),radial-gradient(circle_at_70%_65%,rgba(0,0,0,0.06),transparent_55%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="hero-dots-blogs" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.1" fill="rgba(0,0,0,0.12)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-blogs)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
              Blogs
            </p>
            <h2 className="text-6xl md:text-7xl font-black mt-7 tracking-tight leading-[0.95]">
              Ideas you can <span className="text-[#D6A21E]">execute</span>.
            </h2>
            <p className="text-black/70 text-lg md:text-2xl mt-6 leading-relaxed">
              Systems, scorecards, and strategy—written for leaders who want repeatable growth.
            </p>
            <div className="mt-9 flex items-center justify-center gap-3">
              <Link to="/consultation">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg shadow-sm hover:shadow transition">
                  Book a consultation <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <a href={linkedInCompanyUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-white/80 text-black hover:bg-white border border-black/10 rounded-full px-10 py-6 text-lg shadow-sm hover:shadow transition">
                  Follow on LinkedIn
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-16 md:-mt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-black/10 p-10 md:p-12 shadow-[0_26px_70px_rgba(18,18,18,0.12)] relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#D6A21E]/10 rotate-12 rounded-[92px] blur-[90px]" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>
            <div className="relative">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Featured</p>
                  <h3 className="text-3xl md:text-4xl font-black mt-3">The latest from the team.</h3>
                </div>
                <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
                  Updated regularly
                </span>
              </div>

              <div className="mt-10">
                <BlogCard post={featured} />
              </div>

              <div className="mt-10 grid md:grid-cols-2 gap-8">
                {rest.map((p) => (
                  <BlogCard key={p.slug} post={p} compact />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-[#121212] text-white p-10 md:p-12 border border-white/10 overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#D6A21E]/20 rotate-12 rounded-[56px]" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <h3 className="text-3xl md:text-4xl font-black">Want a plan, not a post?</h3>
                <p className="text-white/70 mt-3 max-w-2xl">
                  Book the free consultation and we’ll map out the system for your next 30 days.
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

function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  const blocks = Array.isArray(post?.content) ? post.content : null;
  const heroHasImage = Boolean(post?.coverImage);
  const suggestions = useMemo(() => {
    const sorted = [...blogPosts].sort((a, b) => {
      const ad = a?.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bd = b?.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bd - ad;
    });
    return sorted.filter((p) => p.slug !== slug).slice(0, 4);
  }, [slug]);

  if (!post) {
    return (
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black">Post not found</h2>
          <p className="text-black/70 mt-4">This post doesn’t exist (yet). Head back to the blog index.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/blogs">
              <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6">
                Back to blogs <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className={cx(
          "relative overflow-hidden border-b border-black/10",
          heroHasImage ? "bg-[#121212]" : "bg-[#F3EFE6]"
        )}
      >
        <div className="absolute inset-0 pointer-events-none">
          {heroHasImage ? (
            <>
              <img
                src={post.coverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                loading="eager"
                draggable={false}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(214,162,30,0.22),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.70),rgba(18,18,18,0.50)_35%,rgba(18,18,18,0.25)_60%,rgba(18,18,18,0.10)_78%,rgba(243,239,230,0.92))]" />
            </>
          ) : (
            <>
              <div className="absolute -top-28 -right-28 w-[620px] h-[620px] bg-[#121212]/6 rotate-12 rounded-[96px]" />
              <div className="absolute -bottom-32 -left-32 w-[620px] h-[620px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.70),transparent_52%),radial-gradient(circle_at_70%_65%,rgba(0,0,0,0.06),transparent_55%)]" />
            </>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">
          <Link
            to="/blogs"
            className={cx(
              "inline-flex items-center text-sm font-semibold",
              heroHasImage ? "text-white/80 hover:text-white" : "text-black/70 hover:text-black"
            )}
          >
            <ArrowRight className="mr-2 rotate-180" size={18} /> Back to blogs
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cx(
                  "text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm",
                  heroHasImage
                    ? "bg-white/15 text-white/90 border-white/20"
                    : "bg-white/70 text-black/70 border-black/10"
                )}
              >
                {post.category}
              </span>
              <span
                className={cx(
                  "text-xs font-semibold px-3 py-1 rounded-full shadow-sm",
                  heroHasImage ? "bg-[#121212]/55 text-[#D6A21E] border border-white/10" : "bg-[#121212] text-[#D6A21E]"
                )}
              >
                {post.readTime}
              </span>
            </div>

            <h1
              className={cx(
                "text-4xl md:text-6xl font-black mt-6 tracking-tight leading-tight",
                heroHasImage ? "text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]" : "text-[#121212]"
              )}
            >
              {post.title}
            </h1>
            <p
              className={cx(
                "mt-4 text-sm font-semibold uppercase tracking-wide",
                heroHasImage ? "text-white/70" : "text-black/60"
              )}
            >
              {post.date} • {post.author}
            </p>
          </div>
        </div>
      </section>

      <section className="relative -mt-16 md:-mt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
            <Card className="rounded-3xl border border-black/10 bg-white">
              <CardContent className="p-10 md:p-12">
              <p className="text-lg text-black/80 leading-relaxed">{post.excerpt}</p>
              {blocks ? (
                <div className="mt-10 space-y-6">
                  {blocks.map((b, idx) => {
                    if (!b || typeof b !== "object") return null;

                    if (b.type === "h2") {
                      return (
                        <h2
                          key={idx}
                          className="text-2xl md:text-3xl font-black tracking-tight text-[#121212] pt-4"
                        >
                          {b.text}
                        </h2>
                      );
                    }
                    if (b.type === "h3") {
                      return (
                        <h3 key={idx} className="text-xl md:text-2xl font-black text-[#121212] pt-2">
                          {b.text}
                        </h3>
                      );
                    }
                    if (b.type === "p") {
                      return (
                        <p key={idx} className="text-black/70 leading-relaxed">
                          {b.text}
                        </p>
                      );
                    }
                    if (b.type === "ul") {
                      return (
                        <ul key={idx} className="list-disc pl-6 space-y-2 text-black/70 leading-relaxed">
                          {(b.items || []).map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (b.type === "ol") {
                      const badge = typeof b.badge === "string" ? b.badge : null;
                      return (
                        <div key={idx} className="space-y-5">
                          {(b.items || []).map((it, i) => (
                            <div key={i} className="rounded-3xl border border-black/10 bg-[#F3EFE6] p-7">
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="text-lg font-black text-[#121212]">
                                  {i + 1}. {it.title}
                                </h4>
                                {badge ? (
                                  <span className="text-xs font-semibold bg-white/70 text-black/70 px-3 py-1 rounded-full border border-black/10">
                                    {badge}
                                  </span>
                                ) : null}
                              </div>
                              {Array.isArray(it.bullets) ? (
                                <ul className="mt-4 list-disc pl-6 space-y-2 text-black/70 leading-relaxed">
                                  {it.bullets.map((x, j) => (
                                    <li key={j}>{x}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    if (b.type === "callout") {
                      return (
                        <div
                          key={idx}
                          className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 md:p-9"
                        >
                          <div className="pointer-events-none absolute inset-0">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                            <div className="absolute -top-24 -right-24 w-[360px] h-[360px] bg-[#D6A21E]/12 rotate-12 rounded-[84px] blur-[80px]" />
                            <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] bg-black/5 -rotate-12 rounded-[84px] blur-[85px]" />
                          </div>
                          <div className="relative">
                            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                              {b.title || "Note"}
                            </p>
                            <p className="mt-4 text-black/75 leading-relaxed">{b.text}</p>
                            <div className="mt-7">
                              <Link to="/consultation">
                                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6">
                                  Book a consultation <ArrowRight className="ml-2" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (b.type === "cta") {
                      return (
                        <div key={idx} className="pt-2">
                          <Link to={b.href || "/consultation"}>
                            <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6">
                              {b.text || "Book a consultation"} <ArrowRight className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              ) : (
                <div className="mt-8 space-y-5 text-black/70 leading-relaxed">
                  <p>
                    This is a starter blog template. When you’re ready, we can hook this page up to a CMS
                    (Sanity, Contentful, Notion, etc.) or load markdown files from the repo.
                  </p>
                  <p>
                    For now, update the <span className="font-semibold">blogPosts</span> array in{" "}
                    <span className="font-semibold">src/App.jsx</span> and we’ll generate posts from real content.
                  </p>
                </div>
              )}
              </CardContent>
            </Card>

            <aside className="mt-10 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
              <Card className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-7">
                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Next reads</p>
                  <h3 className="text-2xl font-black mt-3 leading-tight">Keep the momentum.</h3>
                  <p className="text-sm text-black/60 mt-2">A few posts we recommend right after this one.</p>

                  <div className="mt-6 space-y-4">
                    {suggestions.map((p) => (
                      <Link
                        key={p.slug}
                        to={`/blogs/${p.slug}`}
                        className="group block rounded-2xl border border-black/10 bg-white/70 px-4 py-4 hover:bg-white transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
                            {p.readTime}
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-black/50">
                            {p.date}
                          </span>
                        </div>
                        <p className="mt-3 font-black text-black/90 leading-snug group-hover:text-[#D6A21E] transition">
                          {p.title}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-black/60">{p.category}</p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

const servicesCoreServiceLines = [
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

const servicesUseCases = [
  {
    company: "Abre",
    industry: "Startups",
    category: "Sales",
    description:
      "Venture-backed EdTech startup secures product-market fit and grows sales organization 3x — leading to its largest fundraising round.",
    image: "/case-study-images/abre.webp",
    imagePos: "50% 50%",
  },
  {
    company: "FlyGuys",
    industry: "Startups",
    category: "Marketing",
    description:
      "Venture-backed drone startup builds proactive lead generation strategy and raises its largest round of funding.",
    image: "/case-study-images/flyguys.png",
    imagePos: "50% 60%",
  },
  {
    company: "SCPDC",
    industry: "Government",
    category: "Partnerships",
    description:
      "Identified and recruited participants in governmental programs through structured outreach and follow-through.",
    image: "/case-study-images/scpdc.png",
    imagePos: "50% 45%",
  },
  {
    company: "Automated Productions",
    industry: "Small Businesses",
    category: "Marketing",
    description:
      "Local fabrication shop launches new website and drives over $200k in revenue with 150%+ ROI.",
    image: "/case-study-images/automated-productions.png",
    imagePos: "50% 45%",
  },
  {
    company: "Nightware",
    industry: "Startups",
    category: "Sales",
    description: "Secured 50+ net new orders across 12+ new VA locations.",
    image: "/case-study-images/nightware.png",
    imagePos: "50% 50%",
  },
  {
    company: "JJ’s Pharmacy",
    industry: "Small Businesses",
    category: "Marketing",
    description: "New product launched and increased walk-in traffic obtained.",
    image: "/industries/jjs-vertical.png",
    imagePos: "50% 55%",
  },
];

function Services() {
  const action = [
    {
      letter: "A",
      title: "Audit",
      desc: "Audit your current situation so that we can align on objectives and goals.",
    },
    {
      letter: "C",
      title: "Create the Plan",
      desc: "Construct a simple, clear plan with well-defined metrics and accountability.",
    },
    {
      letter: "T",
      title: "Tailor the Plan",
      desc: "Tailor the plan around your desired targets, team, resources, and approach.",
    },
    {
      letter: "I",
      title: "Initiate the Plan",
      desc: "Initiate activities to begin gathering intelligence.",
    },
    {
      letter: "O",
      title: "Optimize the Plan",
      desc: "Observe qualitative and quantitative results to optimize execution.",
    },
    {
      letter: "N",
      title: "Normalize what Works",
      desc: "Turn what works into repeatable systems, playbooks, and habits that can scale.",
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
        {/* Abstract premium background (no photo) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* base */}
          <div className="absolute inset-0 bg-[radial-gradient(1000px_640px_at_20%_12%,rgba(214,162,30,0.22),transparent_60%),radial-gradient(820px_620px_at_82%_24%,rgba(255,255,255,0.08),transparent_62%),radial-gradient(900px_700px_at_50%_110%,rgba(0,0,0,0.65),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-[#F3EFE6]" />

          {/* luxe beams */}
          <div className="absolute inset-y-[-40%] -left-1/3 w-[120%] rotate-[-10deg] bg-[linear-gradient(115deg,transparent,rgba(214,162,30,0.10),transparent)] opacity-70" />
          <div className="absolute inset-y-[-35%] -right-1/3 w-[120%] rotate-[12deg] bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.06),transparent)] opacity-60" />

          {/* texture */}
          <div className="absolute inset-0 opacity-[0.16] [background:radial-gradient(rgba(214,162,30,0.20)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/45 to-transparent opacity-80" />
          <div className="absolute left-1/2 top-10 h-px w-[68%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/14 to-transparent" />

          {/* bottom bleed */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#F3EFE6]" />
        </div>

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
              Our action becomes your company's <span className="text-[#D6A21E]">potential</span>
            </h2>
            <p className="text-white/70 text-lg md:text-xl mt-6">
              Strategy without execution is dead. We customize and deploy the system, manage the people, and optimize for your benefit.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Get in Touch <ArrowRight className="ml-2" />
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

      {/* Process */}
      <section className="relative -mt-16 md:-mt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-black/10 p-10 md:p-12 relative overflow-hidden shadow-[0_26px_70px_rgba(18,18,18,0.18)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#D6A21E]/12 rotate-12 rounded-[92px] blur-[90px]" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Our customer experience framework</p>
                <h3 className="text-3xl md:text-4xl font-black mt-3">A.C.T.I.O.N.</h3>
              </div>
              <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full">
                Fulcrum Method
              </span>
            </div>

            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {action.map((p) => (
                <div key={p.letter} className="rounded-3xl border border-black/10 bg-[#F3EFE6] p-8">
                  <div className="text-[#D6A21E] font-black text-3xl">{p.letter}</div>
                  <div className="font-black text-xl mt-3">{p.title}</div>
                  <p className="text-black/70 mt-3 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link to="/action">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg">
                  Complete our ROI data sheet <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement options */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-3xl md:text-4xl font-black">Engagement options</h3>
              <p className="text-black/70 mt-3 max-w-2xl">
                Choose a lane, then we’ll tailor execution to match your goals and operating reality.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-8">
            {/* 01 */}
            <div className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-white shadow-sm">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/60 to-transparent" />
                <div className="absolute -top-28 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/10 rotate-12 rounded-[96px] blur-[90px]" />
                <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              </div>
              <div className="relative p-8 md:p-10">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F3EFE6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D6A21E]" />
                      01
                    </div>
                    <h4 className="mt-4 text-2xl md:text-3xl font-black">Need new customer opportunities?</h4>
                  </div>
                  <span className="mt-1 inline-flex items-center rounded-full bg-[#121212] text-[#D6A21E] px-3 py-1 text-xs font-semibold shadow-sm">
                    Customization available
                  </span>
                </div>

                <div className="mt-6 sm:hidden flex items-center justify-between text-xs font-semibold text-black/45">
                  <span>Swipe to see full pricing</span>
                  <span>→</span>
                </div>

                <div
                  className="mt-3 sm:mt-8 -mx-5 sm:mx-0 px-5 sm:px-0 overflow-x-auto pb-4"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <div className="min-w-[820px] rounded-3xl border border-black/10 overflow-hidden bg-white/70">
                    <div className="grid grid-cols-[1.15fr_1.85fr]">
                      <div className="p-5 bg-[#F3EFE6]" />
                      <div className="p-5 bg-[linear-gradient(180deg,#fff_0%,#FFF6DD_55%,#F3EFE6_100%)] border-l border-[#D6A21E]/35 relative">
                        <div className="pointer-events-none absolute inset-0">
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/70 to-transparent" />
                          <div className="absolute -top-16 -right-16 w-[240px] h-[240px] bg-[#D6A21E]/14 rotate-12 rounded-[64px] blur-[70px]" />
                          <div className="absolute inset-0 ring-1 ring-inset ring-[#D6A21E]/20 rounded-none" />
                        </div>
                        <div className="relative flex items-center justify-between gap-3">
                          <div className="text-lg font-black text-[#D6A21E]">Typical ranges</div>
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-black/10 bg-[#121212] text-[#D6A21E] shadow-sm">
                            ROI-aligned
                          </span>
                        </div>
                      </div>

                      {[
                        {
                          label: "Onboarding (one-time)",
                          value: "$750 – $2,000",
                          note: "Depends on scope + systems needed",
                        },
                        {
                          label: "Marketing budget (monthly)",
                          value: "$1,500 – $15,000",
                          note: "We tailor channels + spend to targets",
                        },
                        {
                          label: "Alignment incentives",
                          value: "Based on your ROI",
                          note: "Incentives tied to performance and outcomes",
                          emphasis: true,
                        },
                      ].map((row) => (
                        <React.Fragment key={row.label}>
                          <div className="p-5 bg-white border-t border-black/10">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">
                              {row.label}
                            </div>
                            {row.note ? <div className="mt-2 text-xs font-semibold text-black/55">{row.note}</div> : null}
                          </div>
                          <div className="p-5 bg-[linear-gradient(180deg,#fff_0%,#FFF6DD_55%,#F3EFE6_100%)] border-t border-black/10 border-l border-[#D6A21E]/35 relative">
                            <div className="pointer-events-none absolute inset-0">
                              <div className="absolute inset-0 ring-1 ring-inset ring-[#D6A21E]/15" />
                            </div>
                            <div className={cx("relative text-2xl font-black tracking-tight", row.emphasis ? "text-[#121212]" : "text-black")}>
                              {row.value}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}

                      {/* Customize row */}
                      <div className="p-5 bg-white border-t border-black/10">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">Customize</div>
                      </div>
                      <div className="p-5 bg-[linear-gradient(180deg,#fff_0%,#FFF6DD_55%,#F3EFE6_100%)] border-t border-black/10 border-l border-[#D6A21E]/35 relative">
                        <div className="pointer-events-none absolute inset-0">
                          <div className="absolute inset-0 ring-1 ring-inset ring-[#D6A21E]/15" />
                        </div>
                        <Link to="/consultation" className="relative inline-flex">
                          <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-6 py-3 text-sm shadow-[0_0_26px_rgba(214,162,30,0.25)]">
                            Customize
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 */}
              <div className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-white shadow-sm">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/60 to-transparent" />
                  <div className="absolute -top-24 -right-24 w-[380px] h-[380px] bg-[#D6A21E]/10 rotate-12 rounded-[90px] blur-[90px]" />
                </div>
                <div className="relative p-8 md:p-10">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F3EFE6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D6A21E]" />
                        02
                      </div>
                      <h4 className="mt-4 text-2xl md:text-3xl font-black">Need to expand your current customer base?</h4>
                      <p className="mt-3 text-black/70">
                        Activate existing customers for upsells, referrals, reviews, and re-engagement revenue.
                      </p>
                    </div>
                    <span className="mt-1 inline-flex items-center rounded-full bg-[#121212] text-[#D6A21E] px-3 py-1 text-xs font-semibold shadow-sm">
                      Customization available
                    </span>
                  </div>

                  <div className="mt-7 rounded-3xl border border-black/10 bg-white/70 overflow-hidden">
                    <div className="grid">
                      {[
                        { k: "Onboarding", v: "$1,500" },
                        { k: "Per month", v: "$3,000", note: "6 month minimum • 90-day recalibration" },
                        { k: "Per customer re-engaged", v: "$150", emphasis: true },
                      ].map((r, idx) => (
                        <div
                          key={r.k}
                          className={cx(
                            "flex items-start justify-between gap-6 px-6 py-5",
                            idx === 0 ? "" : "border-t border-black/10",
                            r.emphasis ? "bg-[#F3EFE6]" : "bg-white"
                          )}
                        >
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">{r.k}</div>
                            {r.note ? <div className="mt-2 text-xs font-semibold text-black/55">{r.note}</div> : null}
                          </div>
                          <div
                            className={cx(
                              "text-2xl font-black tracking-tight",
                              r.emphasis ? "text-[#121212]" : "text-black"
                            )}
                          >
                            {r.v}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-5 border-t border-black/10 bg-white">
                      <Link to="/consultation" className="inline-flex">
                        <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-6">
                          Customize this engagement <ArrowRight className="ml-2" size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            {/* 03 */}
              <div className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-white shadow-sm">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/60 to-transparent" />
                  <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] bg-black/5 -rotate-12 rounded-[98px] blur-[95px]" />
                </div>
                <div className="relative p-8 md:p-10">
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F3EFE6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D6A21E]" />
                        03
                      </div>
                      <h4 className="mt-4 text-2xl md:text-3xl font-black">Need strategic partners?</h4>
                      <p className="mt-3 text-black/70">
                        We source and qualify proprietary acquisition and partnership opportunities through targeted deal outreach.
                      </p>
                    </div>
                    <span className="mt-1 inline-flex items-center rounded-full bg-[#121212] text-[#D6A21E] px-3 py-1 text-xs font-semibold shadow-sm">
                      Customization available
                    </span>
                  </div>

                  <div className="mt-7 rounded-3xl border border-black/10 bg-white/70 overflow-hidden">
                    <div className="grid sm:grid-cols-2">
                      {[
                        { k: "Onboarding", v: "$1,500" },
                        { k: "Exclusive", v: "$1,500" },
                      ].map((r, idx) => (
                        <div
                          key={r.k}
                          className={cx(
                            "px-6 py-5 bg-white",
                            idx === 0 ? "" : "border-t sm:border-t-0 sm:border-l border-black/10",
                            idx === 0 ? "" : ""
                          )}
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">{r.k}</div>
                          <div className="mt-2 text-3xl font-black tracking-tight text-black">{r.v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-black/10 bg-[#F3EFE6] px-6 py-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">Success fee</div>
                      <div className="mt-4 grid gap-3">
                        {[
                          { left: "2.5% flat", right: "Enterprise Value" },
                          { left: "7.5% flat", right: "EBITDA" },
                        ].map((r) => (
                          <div key={r.right} className="flex items-start justify-between gap-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-4">
                            <span className="text-sm font-black text-[#121212]">{r.left}</span>
                            <span className="text-sm font-semibold text-black/55">{r.right}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-5 border-t border-black/10 bg-white">
                      <Link to="/consultation" className="inline-flex">
                        <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-6">
                          Customize this engagement <ArrowRight className="ml-2" size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            {/* Scoutly (M&A) — original premium panel design */}
            <div className="w-full">
              <div className="w-full max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/65 backdrop-blur-sm shadow-sm px-8 py-10 md:px-12 md:py-12 text-center">
                  {/* premium panel accents */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                    <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-[#121212]/8 rotate-12 rounded-[96px] blur-[70px]" />
                    <div className="absolute -bottom-28 -right-28 w-[520px] h-[520px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px] blur-[80px]" />
                    <div
                      className="absolute inset-0 opacity-[0.10]"
                      style={{
                        backgroundImage: "radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)",
                        backgroundSize: "26px 26px",
                      }}
                    />
                    {/* Scoutly watermark */}
                    <img
                      src="/industries/scoutly-logo.png"
                      alt=""
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 w-[720px] max-w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center shadow-sm">
                        <Briefcase />
                      </div>
                      <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                        Scoutly
                      </span>
                    </div>

                    <a
                      href="https://scoutly.agency/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#121212] px-5 py-3 shadow-sm hover:bg-black transition"
                    >
                      <img
                        src="/industries/scoutly-logo.png"
                        alt="Scoutly"
                        className="h-7 md:h-8 w-auto"
                        loading="lazy"
                        draggable={false}
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
                      Having worked with over 1000 businesses over the years, we launched a concierge network of companies interested in buying, partnering, and selling.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      {["Confidential by default", "No-cost discovery call", "Vetted buyer network"].map((pill) => (
                        <span
                          key={pill}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/70 border border-black/10 text-black/70"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>

                    <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        href="https://scoutly.agency/"
                        target="_blank"
                        rel="noopener noreferrer"
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
            </div>

          </div>

          <div className="mt-10 text-center">
            <Link to="/consultation">
              <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                Get recommended engagement <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Use cases (case studies preview) */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Use cases</p>
              <h3 className="text-3xl md:text-4xl font-black mt-3">Proof in real businesses.</h3>
              <p className="text-black/70 mt-3">
                A few examples of how Fulcrum’s systems, coaching, and execution cadence have helped teams create measurable momentum.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/services/core">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8">
                  Explore core services <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/case-studies">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-8">
                  View all case studies <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesUseCases.map((cs) => (
              <Link key={cs.company} to="/case-studies" className="group">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                    <div className="absolute -top-24 -right-24 w-[360px] h-[360px] bg-[#D6A21E]/10 rotate-12 rounded-[84px] blur-[80px]" />
                    <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] bg-black/5 -rotate-12 rounded-[92px] blur-[90px]" />
                  </div>

                  <div className="relative">
                    <div className="relative h-40 bg-[#F3EFE6] overflow-hidden">
                      {cs.image ? (
                        <>
                          <img
                            src={cs.image}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            style={{ objectPosition: cs.imagePos || "50% 50%" }}
                            loading="lazy"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                        </>
                      ) : null}
                    </div>

                    <div className="p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                          {cs.industry}
                        </span>
                        <span className="text-xs font-semibold bg-white/70 backdrop-blur-sm text-black/70 px-3 py-1 rounded-full border border-black/10">
                          {cs.category}
                        </span>
                      </div>

                      <div className="mt-4 font-black text-xl leading-snug group-hover:text-[#D6A21E] transition">
                        {cs.company}
                      </div>
                      <p className="mt-3 text-black/70 leading-relaxed line-clamp-3">{cs.description}</p>

                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D6A21E]">
                        See the case studies <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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

function ServicesCore() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F3EFE6]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-[#D6A21E]/12 rotate-12 rounded-[72px]" />
          <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-[#121212]/6 -rotate-12 rounded-[72px]" />
          <div className="absolute left-1/2 top-6 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/15 to-transparent" />
          <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full">
              Services
            </p>
            <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
              Core service <span className="text-[#D6A21E]">lines</span>
            </h2>
            <p className="text-black/70 text-lg md:text-xl mt-6">
              Pick one lane or combine them — we’ll build the most efficient path to growth.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/services">
                <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg">
                  Back to services <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/consultation">
                <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                  Talk to us <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-16 md:-mt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-black/10 p-10 md:p-12 relative overflow-hidden shadow-[0_26px_70px_rgba(18,18,18,0.16)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#D6A21E]/12 rotate-12 rounded-[92px] blur-[90px]" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>
            <div className="relative grid lg:grid-cols-3 gap-8">
              {servicesCoreServiceLines.map((s) => (
                <ServiceBlock key={s.title} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const whoWeServeIndustries = [
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
    gsa: {
      label: "GSA research rates",
      sin: "SIN 541910 – Marketing Research & Analysis",
      rates: [
        { role: "Community Research & Engagement Specialist", rate: "$120.63/hr" },
        { role: "Community Research & Outreach Specialist", rate: "$98.66/hr" },
        { role: "Stakeholder Research & Development Specialist", rate: "$89.68/hr" },
        { role: "Member Research & Recruitment Specialist", rate: "$138.59/hr" },
      ],
    },
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
    icon: <Laptop />,
    title: "Technology Companies",
    desc: "Turn product value into pipeline with clear messaging, consistent outbound systems, and accountable follow-through.",
    bullets: ["ICP + messaging", "Outbound systems + sequences", "Pipeline scorecards"],
    caseCategory: "Sales",
    exampleImage: "/case-study-images/brainscientific.png",
    exampleAlt: "BrainScientific",
  },
  {
    icon: <Briefcase />,
    title: "Professional Services",
    desc: "Package expertise into a clean offer and build predictable growth beyond referrals.",
    bullets: ["Offer + positioning", "Outbound + partnerships", "Follow-up + conversion systems"],
    caseCategory: "Marketing",
    exampleImage: "/case-study-images/coursemojo.png",
    exampleAlt: "CourseMojo",
  },
  {
    icon: <Factory />,
    title: "Oil and Gas",
    desc: "Strengthen commercial execution with targeted outreach, partner development, and visibility into what’s working.",
    bullets: ["Account-based outreach", "Partner/channel development", "Reporting + scorecards"],
    caseCategory: "Partnerships",
    exampleImage: "/industries/oil-gas-vertical.png",
    exampleAlt: "Practical Engineering Solutions",
  },
];

function Industries() {
  const location = useLocation();
  const industries = whoWeServeIndustries;

  const focus = useMemo(() => {
    try {
      return new URLSearchParams(location.search).get("focus");
    } catch {
      return null;
    }
  }, [location.search]);

  useEffect(() => {
    if (!focus) return;
    const id = `who-we-serve-${slugify(focus)}`;
    const el = document.getElementById(id);
    if (!el) return;
    // Let the layout paint before scrolling
    window.requestAnimationFrame(() => {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        el.scrollIntoView();
      }
    });
  }, [focus]);

  return (
    <>
      {/* Industries Hero */}
      <section className="relative bg-[#121212] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* Abstract premium background (no photo) */}
          <div className="absolute inset-0 bg-[radial-gradient(980px_620px_at_22%_12%,rgba(214,162,30,0.20),transparent_60%),radial-gradient(760px_560px_at_80%_30%,rgba(255,255,255,0.08),transparent_62%),radial-gradient(900px_700px_at_50%_110%,rgba(0,0,0,0.70),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/72" />

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

          {/* bottom bleed into page background (keep this LAST so it stays visible) */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#F3EFE6]/75 to-[#F3EFE6]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-white/75 bg-white/10 px-4 py-2 rounded-full">
              Who We Serve
            </p>
            <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
              Who we serve — and how we drive <span className="text-[#D6A21E]">momentum</span>.
            </h2>
            <p className="text-white/70 text-lg md:text-xl mt-6">
              Our best customers are those organizations that want to invest in their growth and want us to invest into their growth with them.
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
      <section className="relative -mt-16 md:-mt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {industries.map((i, idx) => (
              <div
                key={i.title}
                id={`who-we-serve-${slugify(i.title)}`}
                className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen scroll-mt-28 md:scroll-mt-32"
              >
                <div
                  className={cx(
                    "relative overflow-hidden border-y border-black/10",
                    idx % 2 === 0 ? "bg-white" : "bg-[#F3EFE6]"
                  )}
                >
                  {/* Example image rail (edge-to-edge, top-to-bottom) */}
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

                  <div className="relative z-[2] max-w-7xl mx-auto px-6 py-10 md:py-12 lg:pr-[340px] xl:pr-[420px]">
                    <div className="flex flex-col gap-10 lg:flex-row items-start">
                      <div className="max-w-2xl lg:flex-1">
                            <div className="flex items-start justify-between gap-6">
                              <div className="h-12 w-12 rounded-2xl bg-[#121212] text-[#D6A21E] grid place-items-center shadow-sm">
                                {i.icon}
                              </div>
                            </div>

                            <h4 className="text-3xl md:text-4xl font-black mt-6 tracking-tight">{i.title}</h4>
                            <p className="text-black/70 mt-4 text-lg leading-relaxed">{i.desc}</p>
                          </div>

                      <div
                        className={cx(
                          "w-full lg:shrink-0 rounded-3xl border border-black/10 bg-white/75 backdrop-blur-sm p-8 shadow-sm",
                          i.gsa ? "lg:w-[440px] xl:w-[480px]" : "lg:w-[340px] xl:w-[360px]"
                        )}
                      >
                            <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
                              Typical focus
                            </p>
                            <div className="mt-4">
                              <ul className="space-y-3 text-sm text-black/75">
                                {i.bullets.map((b) => (
                                  <li key={b} className="flex items-start gap-2">
                                    <span className="text-[#D6A21E]">•</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                              {i.gsa ? (
                                <div className="mt-6 pt-6 border-t border-black/10">
                                  <div className="flex flex-col gap-3">
                                    <Link to="/industries/government">
                                      <Button className="w-full rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-6">
                                        Capabilities statement <ArrowRight className="ml-2" size={18} />
                                      </Button>
                                    </Link>

                                    <div className="relative group">
                                      <button
                                        type="button"
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#F3EFE6] text-[#121212] hover:bg-[#EFE6D6] border border-black/10 px-6 py-3 text-sm font-semibold transition"
                                        aria-label="View GSA research rates"
                                      >
                                        {i.gsa.label} <ArrowRight size={16} />
                                      </button>

                                      {/* hover / focus popover */}
                                      <div className="absolute left-1/2 -translate-x-1/2 top-full z-[30] w-[320px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition duration-200">
                                        <div className="rounded-2xl border border-black/10 bg-white shadow-[0_24px_70px_rgba(18,18,18,0.12)] overflow-hidden">
                                          <div className="p-4 border-b border-black/10 bg-[#F3EFE6]">
                                            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/60">
                                              {i.gsa.sin}
                                            </div>
                                          </div>
                                          <div className="p-4 space-y-3">
                                            {i.gsa.rates.map((r) => (
                                              <div key={r.role} className="flex items-start justify-between gap-4">
                                                <div className="text-xs font-semibold text-black/70 leading-snug">
                                                  {r.role}
                                                </div>
                                                <div className="text-xs font-black text-[#121212] whitespace-nowrap">
                                                  <span className="text-[#D6A21E]">{r.rate.split("/")[0]}</span>/
                                                  {r.rate.split("/")[1]}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
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

function IndustriesGovernment() {
  const capabilitiesPdfUrl = "/downloads/Fulcrum-Capabilities-Statement.pdf";
  const typicalFocus = [
    "Stakeholder mapping + outreach",
    "Program rollout planning",
    "Visibility + reporting",
  ];
  const gsa = {
    label: "GSA research rates",
    sin: "SIN 541910 – Marketing Research & Analysis",
    rates: [
      { role: "Community Research & Engagement Specialist", rate: "$120.63/hr" },
      { role: "Community Research & Outreach Specialist", rate: "$98.66/hr" },
      { role: "Stakeholder Research & Development Specialist", rate: "$89.68/hr" },
      { role: "Member Research & Recruitment Specialist", rate: "$138.59/hr" },
    ],
  };

  return (
    <>
      <section className="relative bg-[#121212] text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(980px_620px_at_22%_12%,rgba(214,162,30,0.20),transparent_60%),radial-gradient(760px_560px_at_80%_30%,rgba(255,255,255,0.08),transparent_62%),radial-gradient(900px_700px_at_50%_110%,rgba(0,0,0,0.70),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/72" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#F3EFE6]/75 to-[#F3EFE6]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-white/75 bg-white/10 px-4 py-2 rounded-full">
            Industries / Government
          </p>
          <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
            Government <span className="text-[#D6A21E]">Capabilities</span>
          </h2>
          <p className="text-white/70 text-lg md:text-xl mt-6 max-w-3xl">
            Below is the capabilities statement with the government information included.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/industries">
              <Button className="bg-white/10 text-white hover:bg-white/15 rounded-full px-10 py-6 text-lg">
                Back to industries
              </Button>
            </Link>
            <a href={capabilitiesPdfUrl} download className="inline-flex">
              <Button className="bg-[#D6A21E] text-black hover:bg-[#B88A16] rounded-full px-10 py-6 text-lg">
                Download PDF <ArrowRight className="ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="relative -mt-16 md:-mt-20 pb-28 px-6 bg-[#F3EFE6]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Document (smaller at-a-glance) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white rounded-3xl border border-black/10 p-4 sm:p-6 shadow-[0_26px_70px_rgba(18,18,18,0.12)]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">
                      Capabilities statement (preview)
                    </div>
                    <div className="mt-2 text-sm text-black/60">
                      Scaled for readability at first glance. Download for full resolution.
                    </div>
                  </div>
                  <a href={capabilitiesPdfUrl} download className="inline-flex">
                    <Button className="rounded-full bg-[#121212] text-[#D6A21E] hover:bg-black px-5 py-2.5 text-sm">
                      Download PDF <ArrowRight className="ml-1" size={18} />
                    </Button>
                  </a>
                </div>

                <div className="mt-6 max-w-[560px] mx-auto">
                  <PdfDocumentImages url={capabilitiesPdfUrl} renderScale={1.25} />
                </div>
              </div>
            </div>

            {/* Government info */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-sm p-7 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">
                    Typical focus
                  </div>
                  <div className="mt-4">
                    <ul className="space-y-3 text-sm text-black/75">
                      {typicalFocus.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className="text-[#D6A21E]">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-sm p-7 shadow-sm overflow-hidden">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/55">
                    {gsa.label}
                  </div>
                  <div className="mt-3 text-[12px] font-semibold text-black/60">
                    {gsa.sin}
                  </div>
                  <div className="mt-5 space-y-3">
                    {gsa.rates.map((r) => (
                      <div
                        key={r.role}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4"
                      >
                        <div className="text-xs font-semibold text-black/70 leading-snug">
                          {r.role}
                        </div>
                        <div className="text-xs font-black text-[#121212] whitespace-nowrap">
                          <span className="text-[#D6A21E]">{r.rate.split("/")[0]}</span>/
                          {r.rate.split("/")[1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-[#121212] text-white p-7 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    Next step
                  </div>
                  <div className="mt-2 text-xl font-black">
                    Want a government-ready growth plan?
                  </div>
                  <div className="mt-3 text-sm text-white/70 leading-relaxed">
                    We’ll help you map stakeholders, build outreach, and execute with reporting.
                  </div>
                  <div className="mt-6">
                    <Link to="/consultation" className="inline-flex">
                      <Button className="rounded-full bg-[#D6A21E] text-black hover:bg-[#B88A16] px-6">
                        Book a consultation <ArrowRight className="ml-2" size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
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

function Action() {
  return (
    <>
      <section className="bg-[#eef3fb] py-10 md:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page title (same background as flyer) */}
          <div className="relative mb-6 md:mb-8 rounded-[2rem] border border-black/10 bg-white/55 backdrop-blur-sm shadow-[0_26px_70px_rgba(18,18,18,0.12)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-[#D6A21E]/12 rotate-12 rounded-[92px] blur-[90px]" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>

            <div className="relative p-8 md:p-10 text-center action-title-animate">
              <h1 className="text-4xl md:text-5xl font-black mt-4 leading-[1.05] tracking-tight">
                What’s <span className="text-[#D6A21E]">next</span> when working with us?
              </h1>
              <p className="text-2xl md:text-3xl font-black text-black/90 mt-4 tracking-tight">
                You’re in the right place.
              </p>
              <p className="text-black/70 mt-4 max-w-3xl mx-auto leading-relaxed">
                Nearly a decade helping 300+ B2B organizations unlock revenue through repeatable systems.
              </p>

              <div className="mt-7 flex justify-center">
                <a
                  href="#roi"
                  className="text-base md:text-lg font-black text-[#121212] hover:text-black underline decoration-[#D6A21E]/60 underline-offset-4"
                >
                  Fill out our data sheet below
                </a>
              </div>
            </div>
          </div>

          <div className="action-landscape-wrap">
            <div className="sheet" role="document" aria-label="ACTION landscape flyer">
              <div className="spine" aria-hidden="true" />
              <div className="foil" aria-hidden="true" />

              <div className="content">
                <div className="sheetTop">
                  <div className="sheetRule" aria-hidden="true" />
                  <div className="sheetLabel">
                    <span className="sheetDot" aria-hidden="true" />
                    ROI Data Sheet
                  </div>
                  <div className="logo">
                    <img src="/brand/fulcrum-wordmark.png" alt="Fulcrum" />
                  </div>
                  <div className="sheetMeta">
                    <span className="sheetPill">ACTION</span>
                  </div>
                </div>

                <div className="ds-main">
                  <div className="ds-left">
                    <div className="ds-hero">
                      <div className="ds-h">What you’re buying</div>
                      <div className="ds-bullets">
                        {[
                          "A system for generating qualified opportunities",
                          "Direct access to real market feedback",
                          "A structured path to scalable revenue growth",
                        ].map((t) => (
                          <div key={t} className="ds-b">
                            <span className="ds-bdot" aria-hidden="true" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                      <div className="ds-note">
                        Not leads. Not activity. A repeatable system you own.
                      </div>
                    </div>

                    <div className="ds-cards">
                      <section className="ds-card">
                        <div className="ds-ctop">
                          <div className="ds-ck">Before we begin</div>
                          <div className="ds-tag">The math has to work</div>
                        </div>
                        <div className="ds-metrics">
                          {["Initial Contract Value", "Lifetime Value (LTV)", "Gross Margin", "Close Rate"].map((t) => (
                            <div key={t} className="ds-m">
                              <span className="ds-bdot" aria-hidden="true" />
                              <span className="ds-mt">{t}</span>
                            </div>
                          ))}
                        </div>
                        <div className="ds-mini">
                          We model ROI from projected activity + investment. If the math doesn’t work, we’ll tell you — and we won’t recommend
                          moving forward.
                        </div>
                      </section>

                      <section className="ds-card">
                        <div className="ds-ctop">
                          <div className="ds-ck">A.C.T.I.O.N. snapshot</div>
                          <div className="ds-tag">6-step loop</div>
                        </div>
                        <div className="ds-action">
                          {[
                            ["A", "Assess"],
                            ["C", "Create"],
                            ["T", "Tailor"],
                            ["I", "Initiate"],
                            ["O", "Optimize"],
                            ["N", "Normalize"],
                          ].map(([l, t]) => (
                            <div key={l} className="ds-a">
                              <span className="ds-aL">{l}</span>
                              <span className="ds-aT">{t}</span>
                            </div>
                          ))}
                        </div>
                        <div className="ds-mini">
                          If you want quick leads without building a system, we’re probably not the right fit.
                        </div>
                      </section>
                    </div>
                  </div>

                  <aside className="ds-right" id="roi">
                    <div className="ds-formCard">
                      <div className="ds-formTop">
                        <div>
                          <div className="ds-formK">Fill out this data sheet</div>
                          <div className="ds-formT">ROI inputs</div>
                        </div>
                        <div className="ds-chip">Priority</div>
                      </div>
                      <div className="ds-formHelp">
                        We’ll review your economics and follow up with ROI modeling + proposal next steps.
                      </div>
                      <ActionRoiForm variant="flyer" />
                    </div>
                  </aside>
                </div>

                <div className="ds-footer">
                  <span>info@workwithfulcrum.com</span>
                  <span className="ds-sep" aria-hidden="true" />
                  <span>337-335-0046</span>
                  <span className="ds-sep" aria-hidden="true" />
                  <span>workwithfulcrum.com</span>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            .action-title-animate{
              animation: actionTitleIn 560ms cubic-bezier(.2,.9,.2,1) both;
            }
            @keyframes actionTitleIn{
              from{ opacity: 0; transform: translateY(10px); filter: blur(2px); }
              to{ opacity: 1; transform: translateY(0); filter: blur(0); }
            }
            @media (prefers-reduced-motion: reduce){
              .action-title-animate{ animation: none; }
            }

            .action-landscape-wrap{
              display:flex;
              justify-content:center;
              padding: 18px 0;
            }
            .action-landscape-wrap .sheet{
              --ink:#0b0f14;
              --muted:#516074;
              --paper:#ffffff;
              --gold:#f2b705;
              --gold2:#d6a21e;
              --line:#e6edf6;
              --shadow: 0 26px 80px rgba(11,15,20,.14);
              --shadow2: 0 12px 28px rgba(11,15,20,.10);
              width: min(1200px, 100%);
              border-radius: 26px;
              box-shadow: var(--shadow);
              overflow: hidden;
              position: relative;
              background: var(--paper);
              border: 1px solid rgba(11,15,20,.06);
              transform-origin: 50% 40%;
              animation: fulcrumFlyerIn 540ms cubic-bezier(.2,.9,.2,1) both;
            }
            @keyframes fulcrumFlyerIn{
              from{ opacity: 0; transform: translateY(12px) scale(.985); filter: blur(2px); }
              to{ opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
            }
            @media (prefers-reduced-motion: reduce){
              .action-landscape-wrap .sheet{ animation: none; }
            }
            .action-landscape-wrap .spine{
              position:absolute; left:0; top:0; bottom:0; width: 16px; z-index:0;
              background: linear-gradient(180deg, var(--gold) 0%, #f7c22d 28%, #1a2432 78%, #0b0f14 100%);
            }
            .action-landscape-wrap .foil{
              position:absolute; inset:0; z-index:0; pointer-events:none;
              background:
                radial-gradient(900px 520px at 18% 8%, rgba(242,183,5,.16), transparent 60%),
                radial-gradient(760px 520px at 82% 22%, rgba(255,255,255,.18), transparent 64%),
                radial-gradient(1000px 760px at 50% 120%, rgba(11,15,20,.06), transparent 58%),
                linear-gradient(180deg, rgba(238,243,251,.75), rgba(255,255,255,1) 46%);
              opacity: .9;
            }
            .action-landscape-wrap .content{
              position:relative; z-index:1;
              padding: 14px 18px 12px 28px;
              display:flex;
              flex-direction:column;
              gap: 8px;
            }

            /* Top bar */
            .action-landscape-wrap .sheetTop{
              display:grid;
              grid-template-columns: 1fr auto 1fr;
              align-items:center;
              gap: 10px;
              padding: 10px 12px;
              border: 1px solid rgba(230,237,246,.95);
              background: rgba(255,255,255,.86);
              border-radius: 18px;
              box-shadow: var(--shadow2);
              position: relative;
              overflow: hidden;
            }
            .action-landscape-wrap .sheetRule{
              position:absolute;
              left:0; right:0; top:0;
              height: 1px;
              pointer-events:none;
              background: linear-gradient(to right, transparent, rgba(242,183,5,.24), transparent);
              opacity: .95;
            }
            .action-landscape-wrap .sheetLabel{
              display:inline-flex;
              align-items:center;
              gap: 10px;
              font-size: 11px;
              letter-spacing: .22em;
              text-transform: uppercase;
              color: rgba(81,96,116,.95);
              font-weight: 950;
              white-space: nowrap;
              justify-self: start;
            }
            .action-landscape-wrap .sheetDot{
              width: 9px;
              height: 9px;
              border-radius: 3px;
              background: linear-gradient(180deg, var(--gold), var(--gold2));
              box-shadow: 0 0 0 4px rgba(242,183,5,.12);
              flex: 0 0 9px;
            }
            .action-landscape-wrap .logo{
              width: 210px;
              justify-self: center;
              border: 1px solid rgba(230,237,246,.95);
              border-radius: 14px;
              padding: 9px 12px;
              background: rgba(255,255,255,.95);
              box-shadow: var(--shadow2);
            }
            .action-landscape-wrap .logo img{ display:block; width:100%; height:auto; filter: contrast(1.25) brightness(0.9); }
            .action-landscape-wrap .sheetMeta{ justify-self: end; }
            .action-landscape-wrap .sheetPill{
              padding: 7px 10px;
              border-radius: 999px;
              border: 1px solid rgba(242,183,5,.35);
              background: rgba(242,183,5,.10);
              color: rgba(11,15,20,.80);
              font-size: 11.5px;
              font-weight: 900;
              white-space: nowrap;
            }

            /* Main layout */
            .action-landscape-wrap .ds-main{
              display:grid;
              grid-template-columns: 1.05fr .95fr;
              gap: 12px;
              align-items:start;
              min-height: 0;
            }
            .action-landscape-wrap .ds-left{
              display:flex;
              flex-direction:column;
              gap: 10px;
              min-height: 0;
            }
            .action-landscape-wrap .ds-right{ min-height: 0; }

            .action-landscape-wrap .ds-hero{
              border: 1px solid rgba(230,237,246,.95);
              background: rgba(255,255,255,.88);
              border-radius: 20px;
              box-shadow: var(--shadow2);
              padding: 12px 14px;
            }
            .action-landscape-wrap .ds-h{
              font-size: 11px;
              letter-spacing: .22em;
              text-transform: uppercase;
              color: rgba(81,96,116,.95);
              font-weight: 950;
            }
            .action-landscape-wrap .ds-bullets{
              margin-top: 10px;
              display:grid;
              gap: 8px;
              color: rgba(11,15,20,.86);
              font-size: 13px;
              font-weight: 850;
              line-height: 1.25;
            }
            .action-landscape-wrap .ds-b{
              display:flex;
              gap: 10px;
              align-items:flex-start;
            }
            .action-landscape-wrap .ds-bdot{
              width: 10px;
              height: 10px;
              border-radius: 4px;
              margin-top: 3px;
              background: linear-gradient(180deg, var(--gold), var(--gold2));
              box-shadow: 0 0 0 4px rgba(242,183,5,.12);
              flex: 0 0 10px;
            }
            .action-landscape-wrap .ds-note{
              margin-top: 10px;
              border-radius: 16px;
              padding: 10px 12px;
              background: linear-gradient(90deg, rgba(242,183,5,.16), rgba(242,183,5,.05));
              border: 1px solid rgba(242,183,5,.30);
              color: rgba(11,15,20,.86);
              font-weight: 850;
              font-size: 12.5px;
              line-height: 1.35;
            }

            .action-landscape-wrap .ds-cards{
              display:grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              min-height: 0;
            }
            .action-landscape-wrap .ds-card{
              border: 1px solid rgba(230,237,246,.95);
              background: rgba(255,255,255,.86);
              border-radius: 20px;
              box-shadow: var(--shadow2);
              padding: 12px 12px;
              display:flex;
              flex-direction:column;
              gap: 10px;
              min-height: 0;
            }
            .action-landscape-wrap .ds-ctop{
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap: 10px;
            }
            .action-landscape-wrap .ds-ck{
              font-size: 11px;
              letter-spacing: .22em;
              text-transform: uppercase;
              color: rgba(81,96,116,.95);
              font-weight: 950;
            }
            .action-landscape-wrap .ds-tag{
              padding: 6px 10px;
              border-radius: 999px;
              border: 1px solid rgba(242,183,5,.35);
              background: rgba(242,183,5,.10);
              color: rgba(11,15,20,.82);
              font-size: 11px;
              font-weight: 900;
              white-space: nowrap;
            }
            .action-landscape-wrap .ds-metrics{
              display:grid;
              grid-template-columns: 1fr;
              gap: 8px;
            }
            .action-landscape-wrap .ds-m{
              display:flex;
              gap: 10px;
              align-items:flex-start;
              padding: 8px 10px;
              border: 1px solid rgba(230,237,246,.95);
              background: rgba(251,252,255,.92);
              border-radius: 14px;
            }
            .action-landscape-wrap .ds-mt{
              font-size: 12.5px;
              font-weight: 900;
              color: rgba(11,15,20,.84);
              line-height: 1.2;
            }
            .action-landscape-wrap .ds-mini{
              color: rgba(81,96,116,.92);
              font-size: 12px;
              line-height: 1.35;
              font-weight: 750;
            }
            .action-landscape-wrap .ds-action{
              display:grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .action-landscape-wrap .ds-a{
              display:flex;
              align-items:center;
              gap: 10px;
              padding: 8px 10px;
              border: 1px solid rgba(230,237,246,.95);
              background: rgba(251,252,255,.92);
              border-radius: 14px;
            }
            .action-landscape-wrap .ds-aL{
              width: 28px;
              height: 28px;
              border-radius: 12px;
              display:grid;
              place-items:center;
              font-weight: 950;
              color: rgba(11,15,20,.92);
              background: linear-gradient(180deg, rgba(242,183,5,.55), rgba(242,183,5,.12));
              border: 1px solid rgba(242,183,5,.40);
              flex: 0 0 28px;
            }
            .action-landscape-wrap .ds-aT{
              font-size: 12.5px;
              font-weight: 950;
              color: rgba(11,15,20,.86);
            }

            .action-landscape-wrap .ds-formCard{
              border-radius: 22px;
              border: 1px solid rgba(242,183,5,.50);
              background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(242,183,5,.06));
              box-shadow: 0 20px 54px rgba(242,183,5,.16), var(--shadow2);
              padding: 12px 14px;
              overflow:auto;
            }
            .action-landscape-wrap .ds-formTop{
              display:flex;
              align-items:flex-start;
              justify-content:space-between;
              gap: 10px;
            }
            .action-landscape-wrap .ds-formK{
              font-size: 10.5px;
              letter-spacing: .22em;
              text-transform: uppercase;
              color: rgba(81,96,116,.95);
              font-weight: 950;
            }
            .action-landscape-wrap .ds-formT{
              margin-top: 4px;
              font-size: 20px;
              font-weight: 950;
              letter-spacing: -0.4px;
              color: rgba(11,15,20,.92);
            }
            .action-landscape-wrap .ds-chip{
              border-radius: 999px;
              padding: 6px 10px;
              background: rgba(11,15,20,.92);
              color: rgba(242,183,5,1);
              font-size: 11px;
              font-weight: 950;
              white-space: nowrap;
            }
            .action-landscape-wrap .ds-formHelp{
              margin-top: 8px;
              color: rgba(11,15,20,.70);
              font-size: 12px;
              line-height: 1.35;
              font-weight: 750;
            }

            /* Flyer-form styling (used by ActionRoiForm variant="flyer") */
            .action-landscape-wrap .roi-grid{
              display:grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 10px;
            }
            .action-landscape-wrap .roi-field{ display:flex; flex-direction:column; gap: 6px; }
            .action-landscape-wrap .roi-label{
              font-size: 10px;
              letter-spacing: .18em;
              text-transform: uppercase;
              color: rgba(81,96,116,.95);
              font-weight: 950;
            }
            .action-landscape-wrap .roi-input{
              width:100%;
              border: 1px solid rgba(230,237,246,.95);
              border-radius: 14px;
              padding: 10px 12px;
              font-size: 12.5px;
              outline: none;
              background: #fff;
              color: rgba(11,15,20,.92);
            }
            .action-landscape-wrap .roi-input:focus{
              border-color: rgba(242,183,5,.60);
              box-shadow: 0 0 0 3px rgba(242,183,5,.14);
            }
            .action-landscape-wrap .roi-error{
              margin-top: 8px;
              font-size: 11px;
              color: #b42318;
              font-weight: 850;
            }
            .action-landscape-wrap .roi-submit{
              margin-top: 10px;
              border-radius: 999px;
              padding: 12px 14px;
              font-size: 12.5px;
              font-weight: 950;
            }
            .action-landscape-wrap .roi-submit--ok{
              background: linear-gradient(180deg, rgba(242,183,5,1), rgba(214,162,30,1));
              color: rgba(11,15,20,.96);
            }
            .action-landscape-wrap .roi-submit--no{
              background: rgba(11,15,20,.08);
              color: rgba(11,15,20,.35);
              cursor:not-allowed;
            }

            .action-landscape-wrap .ds-footer{
              margin-top: 6px;
              display:flex;
              flex-wrap:wrap;
              gap: 10px 14px;
              justify-content:center;
              color: rgba(81,96,116,.95);
              font-size: 11.5px;
              font-weight: 850;
              letter-spacing: .02em;
            }
            .action-landscape-wrap .ds-sep{
              width: 1px;
              height: 14px;
              background: rgba(11,15,20,.10);
              align-self:center;
            }

            @page { size: landscape; margin: 0.45in; }
            @media print{
              .action-landscape-wrap{ padding: 0; }
              .action-landscape-wrap .sheet{
                aspect-ratio: 11 / 8.5;
                box-shadow:none;
                border-radius: 0;
                border: none;
              }
            }
            @media (max-width: 980px){
              .action-landscape-wrap .ds-main{ grid-template-columns: 1fr; }
              .action-landscape-wrap .ds-cards{ grid-template-columns: 1fr; }
              .action-landscape-wrap .ds-action{ grid-template-columns: 1fr; }
              .action-landscape-wrap .roi-grid{ grid-template-columns: 1fr; }
              .action-landscape-wrap .sheetTop{ grid-template-columns: 1fr; justify-items: start; }
              .action-landscape-wrap .logo{ justify-self: start; }
              .action-landscape-wrap .sheetMeta{ justify-self: start; }
            }
          `}</style>
        </div>
      </section>

      {/* Transition spacer (restored) */}
      <section className="bg-[#eef3fb]">
        <div className="h-12 md:h-16" />
        <div className="h-10 md:h-14 bg-gradient-to-b from-[#eef3fb] to-[#F3EFE6]" />
      </section>

      {/* Detailed ACTION plan (below flyer) */}
      <section className="px-6 pb-20 bg-[#F3EFE6]">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0" />
            <div className="p-8 md:p-10">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Detailed version</p>
              <h2 className="text-3xl md:text-4xl font-black mt-3">
                Our A.C.T.I.O.N. Framework — <span className="text-[#D6A21E]">full breakdown</span>
              </h2>
              <p className="text-black/70 mt-4 max-w-4xl leading-relaxed">
                A proven system built from thousands of campaigns to turn market activity into revenue and repeatable growth.
              </p>

              <div className="mt-8 grid lg:grid-cols-2 gap-5">
                {[
                  {
                    n: "1",
                    t: "Assess the Opportunity",
                    d: "We evaluate your current state, goals, and constraints—anchored in real economics, not assumptions.",
                    o: "A clear understanding of what’s possible and what it will take.",
                  },
                  {
                    n: "2",
                    t: "Create the Plan",
                    d: "We align on scope of work, objectives and targets, and economic structure. Then we conduct a structured onboarding to extract what’s needed to execute.",
                    o: "A defined plan and onboarding asset you own.",
                  },
                  {
                    n: "3",
                    t: "Tailor the Plan",
                    d: "Over 2–3 weeks, we build your campaign infrastructure: target audiences, messaging & positioning, offers, outreach systems, and reporting. This is the asset you are investing in.",
                    o: "A fully built, ready-to-launch revenue engine (owned by you).",
                  },
                  {
                    n: "4",
                    t: "Initiate the Plan",
                    d: "We execute daily outreach with one primary objective: Create Notable Connections—verified interactions with qualified decision-makers that create meaningful business conversations. Conversations → insights. Insights → opportunities. Opportunities → revenue.",
                    o: "Consistent pipeline generation and real-time market intelligence.",
                  },
                  {
                    n: "5",
                    t: "Optimize the Plan",
                    d: "We continuously refine based on market feedback, conversion data, and your internal changes.",
                    o: "Increasing efficiency and improving ROI over time.",
                  },
                  {
                    n: "6",
                    t: "Normalize What Works",
                    d: "Every engagement reveals one of three truths: No Interest (problem/solution misalignment), Interest No Purchase (product/market gap), Customers Buy (scale opportunity). We operationalize what works into playbooks, training, and internal systems.",
                    o: "A repeatable, scalable revenue engine inside your business.",
                  },
                ].map((s) => (
                  <div key={s.n} className="relative overflow-hidden rounded-3xl border border-black/10 bg-[#F3EFE6] p-6">
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                      <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-[#D6A21E]/10 rotate-12 rounded-[76px] blur-[80px]" />
                      <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] bg-black/5 -rotate-12 rounded-[88px] blur-[90px]" />
                    </div>
                    <div className="relative">
                      <div className="text-[#D6A21E] font-black text-2xl">{s.n}</div>
                      <div className="font-black text-xl mt-2">{s.t}</div>
                      <p className="text-black/70 mt-2 leading-relaxed">{s.d}</p>
                      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                      <div className="mt-3 text-sm font-semibold text-black/75">Outcome</div>
                      <div className="text-black/70 mt-2 leading-relaxed">{s.o}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid lg:grid-cols-2 gap-5">
                <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">What you’re actually buying</p>
                  <div className="mt-4 text-2xl md:text-3xl font-black">Not leads. Not activity.</div>
                  <p className="text-black/70 mt-4 leading-relaxed">You’re investing in:</p>
                  <div className="mt-5 space-y-3 text-black/75">
                    {[
                      "A system for generating qualified opportunities",
                      "Direct access to real market feedback",
                      "A structured path to scalable revenue growth",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-3">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#D6A21E]" />
                        <span className="leading-relaxed">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-[#121212] text-white p-8 shadow-sm relative overflow-hidden">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -left-28 w-[420px] h-[420px] bg-[#D6A21E]/16 -rotate-12 rounded-[88px] blur-[70px]" />
                    <div className="absolute -bottom-28 -right-28 w-[520px] h-[520px] bg-white/10 rotate-12 rounded-[96px] blur-[85px]" />
                  </div>
                  <div className="relative">
                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">Fit matters</p>
                    <div className="text-xl md:text-2xl font-black mt-4">
                      If you’re looking for quick leads without building a system…
                    </div>
                    <p className="text-white/70 mt-4 leading-relaxed">
                      We’re probably not the right fit. If you want a partner to help you build a repeatable, scalable growth engine—this is
                      exactly what we do.
                    </p>

                    <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                    <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70 mt-8">Timeline & expectations</p>
                    <div className="mt-4 space-y-2 text-white/80">
                      {[
                        ["Proposal process (2–4 weeks)", "Assess → ROI → Plan alignment"],
                        ["Onboarding (2–3 weeks)", "Kickoff → Build foundation"],
                        ["Execution (ongoing)", "Initiate → Optimize → Normalize (6 months to multi-year engagements)"],
                        ["Reporting", "Weekly updates + ongoing communication"],
                      ].map(([a, b]) => (
                        <div key={a} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="font-semibold">{a}</div>
                          <div className="text-sm text-white/70 mt-1">{b}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-3xl border border-black/10 bg-[#F3EFE6] p-8">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Your next step</p>
                <div className="mt-4 grid md:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-sm p-8">
                    <div className="font-black text-xl">If we’ve completed discovery</div>
                    <p className="text-black/70 mt-3 leading-relaxed">
                      We move into ROI modeling and proposal development.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-black/10 bg-white/75 backdrop-blur-sm p-8">
                    <div className="font-black text-xl">If not</div>
                    <p className="text-black/70 mt-3 leading-relaxed">
                      We begin with a focused assessment to determine if we can create value.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/consultation" className="inline-flex">
                  <Button className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-10 py-6 text-lg">
                    Book a follow-up <ArrowRight className="ml-2" />
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

function ActionRoiForm({ variant = "card" }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    icv: "",
    ltv: "",
    grossMargin: "",
    closeRate: "",
    notes: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.icv.trim() &&
      form.ltv.trim() &&
      form.grossMargin.trim() &&
      form.closeRate.trim()
    );
  }, [form]);

  function update(key) {
    return (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    (async () => {
      try {
        await submitNetlifyUrlEncoded(NETLIFY_FORM_ACTION_ROI, {
          "bot-field": "",
          name: form.name,
          email: form.email,
          company: form.company,
          icv: form.icv,
          ltv: form.ltv,
          grossMargin: form.grossMargin,
          closeRate: form.closeRate,
          notes: form.notes,
          service: "ACTION",
          sourceUrl: typeof window !== "undefined" ? window.location.href : "",
        });
        setSubmitted(true);
      } catch (err) {
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    })();
  }

  const formBody = submitted ? (
    <div className={variant === "flyer" ? "bar" : "mt-8 rounded-2xl border border-black/10 bg-[#F3EFE6] p-6"}>
      <div className="font-black">Submitted</div>
      <p className={variant === "flyer" ? "mini-sub" : "text-black/70 mt-2"}>
        We’ll review the inputs and follow up with ROI modeling + proposal next steps.
      </p>
      <Button
        className={variant === "flyer"
          ? "mt-3 bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-6 py-3 text-sm"
          : "mt-5 bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8"}
        onClick={() => setSubmitted(false)}
      >
        Submit another
      </Button>
    </div>
  ) : (
    <form
      name="action-roi"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={onSubmit}
      className={variant === "flyer" ? "action-roi-form" : "mt-8 space-y-6"}
    >
      <input type="hidden" name="form-name" value="action-roi" />
      <p className="hidden">
        <label>
          Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className={variant === "flyer" ? "roi-grid" : "grid md:grid-cols-2 gap-5"}>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Full name *</span>
          <input
            name="name"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.name}
            onChange={update("name")}
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Email *</span>
          <input
            name="email"
            type="email"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.email}
            onChange={update("email")}
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Company</span>
          <input
            name="company"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.company}
            onChange={update("company")}
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Initial Contract Value *</span>
          <input
            name="icv"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.icv}
            onChange={update("icv")}
            placeholder="e.g. 25000"
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Lifetime Value (LTV) *</span>
          <input
            name="ltv"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.ltv}
            onChange={update("ltv")}
            placeholder="e.g. 120000"
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Gross Margin (%) *</span>
          <input
            name="grossMargin"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.grossMargin}
            onChange={update("grossMargin")}
            placeholder="e.g. 65"
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Close Rate (%) *</span>
          <input
            name="closeRate"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.closeRate}
            onChange={update("closeRate")}
            placeholder="e.g. 20"
          />
        </label>
        <label className={variant === "flyer" ? "roi-field" : undefined}>
          <span className={variant === "flyer" ? "roi-label" : undefined}>Notes</span>
          <input
            name="notes"
            className={variant === "flyer" ? "roi-input" : "w-full border border-black/10 rounded-xl p-4"}
            value={form.notes}
            onChange={update("notes")}
            placeholder="Optional context"
          />
        </label>
      </div>

      {error ? <p className={variant === "flyer" ? "roi-error" : "text-xs text-red-700"}>{error}</p> : null}

      <Button
        type="submit"
        className={cx(
          variant === "flyer" ? "roi-submit" : "rounded-full px-10 py-6 text-lg",
          canSubmit && !loading
            ? variant === "flyer"
              ? "roi-submit--ok"
              : "bg-[#D6A21E] text-black hover:bg-[#B88A16]"
            : variant === "flyer"
              ? "roi-submit--no"
              : "bg-black/10 text-black/40 cursor-not-allowed hover:bg-black/10"
        )}
        disabled={!canSubmit || loading}
      >
        {loading ? "Submitting…" : "Submit ROI inputs"}
      </Button>
    </form>
  );

  if (variant === "flyer") return formBody;

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden">
      <CardContent className="p-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Submit your data</p>
            <h3 className="text-2xl font-black mt-3">ROI inputs</h3>
          </div>
          <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full">Discovery follow-up</span>
        </div>

        <p className="text-black/70 mt-4 leading-relaxed">
          Share your basic economics so we can model ROI and recommend the right next step.
        </p>

        {formBody}
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
        whoWeServe: "Technology Companies",
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
        whoWeServe: "Professional Services",
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
        whoWeServe: "Oil and Gas",
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
      "Technology Companies",
      "Professional Services",
      "Oil and Gas",
    ];
    const set = new Set(caseStudies.map((c) => c.industry).filter(Boolean));
    // Always show Nonprofits (even if not populated yet)
    set.add("Nonprofits");
    set.add("Technology Companies");
    set.add("Professional Services");
    set.add("Oil and Gas");
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
    const whoWeServeTabs = new Set(["Technology Companies", "Professional Services", "Oil and Gas"]);
    if (active === "Featured") return caseStudies.filter((c) => c.featured);
    if (active === "All") return caseStudies;
    if (whoWeServeTabs.has(active)) return caseStudies.filter((c) => c.whoWeServe === active);
    return caseStudies.filter((c) => c.industry === active);
  }, [active, caseStudies]);

  const testimonials = testimonialsData;

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
            </div>
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
    <div className="group relative w-[320px] sm:w-[460px] md:w-[560px] lg:w-[720px] max-w-[90vw] rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#D6A21E]/[0.12] backdrop-blur-sm p-5 sm:p-8 md:p-10 shadow-[0_12px_34px_rgba(0,0,0,0.30)] overflow-hidden transition-shadow hover:shadow-[0_18px_52px_rgba(0,0,0,0.38)]">
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
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full border border-white/15 bg-gradient-to-br from-white/12 via-white/6 to-transparent overflow-hidden shrink-0">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.avatarAlt || t.who || "Testimonial photo"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: t.avatarPos || "50% 35%" }}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-[#D6A21E] font-black text-base sm:text-lg">
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

          <span className="shrink-0 text-[11px] sm:text-xs font-semibold bg-[#D6A21E]/15 text-[#F6E4A6] px-3 py-1 rounded-full border border-[#D6A21E]/25">
            {t.tag}
          </span>
        </div>

        <div className="mt-7 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <h4 className="mt-5 sm:mt-6 text-base sm:text-lg md:text-2xl font-black text-white leading-snug">
          {t.title}
        </h4>

        <blockquote className="mt-3 sm:mt-4 text-white/85 text-base sm:text-lg md:text-xl leading-relaxed">
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
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              Academy
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 flex justify-center"
            >
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
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-7xl font-black mt-7 tracking-tight leading-[0.95]"
            >
              Fulcrum <span className="text-[#D6A21E]">Academy</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 h-px w-[220px] md:w-[280px] mx-auto bg-gradient-to-r from-transparent via-black/15 to-transparent origin-center"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-black/70 text-lg md:text-2xl mt-6 max-w-3xl mx-auto leading-relaxed"
            >
              Our unfair advantage is our people. Everyone starts in the Fulcrum Academy - the most elite and practice business development training ground.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
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
            </motion.div>

            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-5 py-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Graduates</div>
                <div className="font-black mt-1 text-lg">Over 50 Graduates</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-5 py-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Sales activities</div>
                <div className="font-black mt-1 text-lg">Over 75,000 sales activities produced</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/65 backdrop-blur-sm px-5 py-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Clients served</div>
                <div className="font-black mt-1 text-lg">Over 250 clients served</div>
              </div>
            </div>
          </div>

          <div className="mt-14 max-w-6xl mx-auto">
            <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-sm p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                <div className="absolute -top-28 -left-24 w-[420px] h-[420px] bg-[#121212]/6 rotate-12 rounded-[84px] blur-[80px]" />
                <div className="absolute -bottom-28 -right-24 w-[520px] h-[520px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px] blur-[90px]" />
              </div>

              <div className="relative">
                <div className="rounded-2xl border border-black/10 bg-[#121212] text-white p-7 md:p-8 shadow-sm overflow-hidden relative">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-[#D6A21E]/18 rotate-12 rounded-[96px] blur-[90px]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                  </div>
                  <div className="relative">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Differentiator
                    </div>
                    <p className="mt-3 font-black text-2xl leading-snug">
                      Most firms hire and churn. Fulcrum builds.
                    </p>
                    <p className="mt-4 text-white/75 leading-relaxed">
                      We don’t hire random talent — we train and develop them within our system.
                    </p>
                    <p className="mt-3 text-white/75 leading-relaxed">
                      The Academy is our internal apprenticeship program that develops entry-level talent into disciplined revenue producers
                      through real-world business development missions.
                    </p>
                    <div className="mt-6 space-y-3 text-white/80">
                      {[
                        "Our internal engine is selectively available for hire.",
                        "Hundreds are vetted each year; dozens are allowed in; a handful will become Fulcrum Academy graduates.",
                      ].map((t) => (
                        <div key={t} className="flex items-start gap-3">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#D6A21E] shadow-[0_0_18px_rgba(214,162,30,0.45)]" />
                          <span className="leading-relaxed">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notable apprentices (auto-moving) */}
      <section className="relative -mt-16 md:-mt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-black/10 p-10 md:p-12 shadow-[0_26px_70px_rgba(18,18,18,0.12)] relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-[#D6A21E]/10 rotate-12 rounded-[92px] blur-[90px]" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-black/5 -rotate-12 rounded-[96px] blur-[95px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
              <div className="absolute inset-0 opacity-[0.08] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:26px_26px]" />
            </div>

            <div className="relative">
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

              <div className="mt-10">
                <ApprenticeMarquee />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto space-y-20">
        {/* Onboarding Path */}
        <div className="bg-white rounded-3xl border border-black/10 p-10">
          <h3 className="text-3xl font-black text-center mb-10">The Academy Path</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Step number="1" title="Apply" desc="Tell us who you are." />
            <Step number="2" title="Interview" desc="Quick call to assess fit." />
            <Step number="3" title="Onboard" desc="Training + shadowing + reps." />
            <Step number="4" title="Advance" desc="Earn more, lead more." />
          </div>

          {/* Discover your track */}
          <div className="mt-12 pt-10 border-t border-black/10">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">
                Discover your track
              </p>
              <h4 className="text-2xl md:text-3xl font-black mt-3">
                Pick the lane you want to <span className="text-[#D6A21E]">master</span>.
              </h4>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6 items-stretch">
              <Link to="/academy/track/sales" className="group block h-full">
                <Card className="relative h-full min-h-[280px] rounded-3xl border border-black/10 bg-[#F3EFE6] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                    <div className="absolute -top-20 -right-20 w-[240px] h-[240px] bg-[#D6A21E]/14 rotate-12 rounded-[64px] blur-[60px]" />
                  </div>
                  <CardContent className="relative p-8 h-full flex flex-col">
                    <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
                      Track 01
                    </span>
                    <h5 className="text-2xl font-black mt-5 leading-tight group-hover:text-[#D6A21E] transition">
                      M&amp;A Tract (Scoutly)
                    </h5>
                    <p className="text-black/70 mt-3 leading-relaxed">
                      Real deal-flow exposure: sourcing, buyer/seller research, outreach, and matchmaking.
                    </p>
                    <div className="mt-auto pt-6 inline-flex items-center text-sm font-semibold text-black/70 group-hover:text-black transition">
                      Explore track <ArrowRight className="ml-2" size={18} />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/academy/track/operations" className="group block h-full">
                <Card className="relative h-full min-h-[280px] rounded-3xl border border-black/10 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                    <div className="absolute -top-24 -right-24 w-[280px] h-[280px] bg-[#D6A21E]/12 rotate-12 rounded-[72px] blur-[80px]" />
                    <div className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-black/5 -rotate-12 rounded-[76px] blur-[85px]" />
                  </div>
                  <CardContent className="relative p-8 h-full flex flex-col">
                    <span className="text-xs font-semibold bg-[#121212] text-[#D6A21E] px-3 py-1 rounded-full shadow-sm">
                      Track 02
                    </span>
                    <h5 className="text-2xl font-black mt-5 leading-tight group-hover:text-[#D6A21E] transition">
                      Apprenticeship Tracts
                    </h5>
                    <p className="text-black/70 mt-3 leading-relaxed">
                      Overview flyer: pathways, outcomes, and what it takes to advance.
                    </p>
                    <div className="mt-auto pt-6 inline-flex items-center text-sm font-semibold text-black/70 group-hover:text-black transition">
                      Explore track <ArrowRight className="ml-2" size={18} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        {/* Application */}
        <div id="apply" className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-black text-center mb-8">Apply to Fulcrum Academy</h3>
          <AcademyApplication />
        </div>
      </section>
    </>
  );
}

function AcademyTrackShell({ kicker = "Academy track", title, subtitle, bullets = [] }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#F3EFE6]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 w-[620px] h-[620px] bg-[#121212]/6 rotate-12 rounded-[96px]" />
          <div className="absolute -bottom-32 -left-32 w-[620px] h-[620px] bg-[#D6A21E]/12 -rotate-12 rounded-[96px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.70),transparent_52%),radial-gradient(circle_at_70%_65%,rgba(0,0,0,0.06),transparent_55%)]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24">
          <Link to="/academy" className="inline-flex items-center text-sm font-semibold text-black/70 hover:text-black">
            <ArrowRight className="mr-2 rotate-180" size={18} /> Back to Academy
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-black/70 bg-white/70 border border-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
              {kicker}
            </p>
            <h1 className="text-4xl md:text-6xl font-black mt-6 tracking-tight leading-tight">{title}</h1>
            <p className="text-black/70 text-lg md:text-xl mt-5 leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
          <Card className="rounded-3xl border border-black/10 bg-white">
            <CardContent className="p-10 md:p-12">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Coming next</p>
              <h2 className="text-2xl md:text-3xl font-black mt-3">Discover your track</h2>
              <p className="text-black/70 mt-4 leading-relaxed">
                You said you’ll paste the code for each track page next. When you do, I’ll replace this placeholder
                with the full page design.
              </p>

              {bullets?.length ? (
                <div className="mt-8">
                  <p className="text-sm font-semibold text-black/70">This track typically covers:</p>
                  <ul className="mt-4 list-disc pl-6 space-y-2 text-black/70 leading-relaxed">
                    {bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-7">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Next step</p>
                <h3 className="text-2xl font-black mt-3 leading-tight">Apply to the Academy.</h3>
                <p className="text-sm text-black/60 mt-2">You can choose a track now and refine it during onboarding.</p>
                <div className="mt-6">
                  <a href="/academy#apply">
                    <Button className="w-full bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8 py-6">
                      Go to application <ArrowRight className="ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}

function AcademyTrackSales() {
  return (
    <section className="px-6 py-12 md:py-16 bg-[#e9eef6]">
      <div className="max-w-7xl mx-auto">
        <Link to="/academy" className="inline-flex items-center text-sm font-semibold text-black/70 hover:text-black">
          <ArrowRight className="mr-2 rotate-180" size={18} /> Back to Academy
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Track 01</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2 leading-tight">
              M&amp;A Tract <span className="text-[#D6A21E]">(Scoutly)</span>
            </h1>
            <p className="text-black/70 mt-2 max-w-2xl">
              Print-friendly 2-page flyer. Use “Print” to save as PDF.
            </p>
          </div>
          <Button
            type="button"
            className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8 py-5"
            onClick={() => window.print()}
          >
            Print / Save as PDF <ArrowRight className="ml-2" />
          </Button>
        </div>

        <div className="mt-10 academy-flyer space-y-10">
          <div className="overflow-x-auto pb-4">
            <main className="sheet" role="document" aria-label="Fulcrum Academy Flyer Page 1">
              <div className="topbar" />

              <section className="content">
                <header className="brand">
                  <div className="title-wrap">
                    <div className="badge">
                      <span className="dot" /> Fulcrum Academy • Tract Spotlight
                    </div>
                    <h1>
                      Fulcrum Academy —{" "}
                      <span className="gold-chip">
                        M&amp;A Tract
                      </span>{" "}
                      (Scoutly)
                    </h1>
                    <p className="sub">
                      A hands-on tract built for aspiring deal professionals who want real exposure to M&amp;A business
                      development, how buyers think, how sellers decide, and how deals start long before bankers and
                      lawyers step in.
                    </p>
                  </div>

                  <div className="logo-wrap" aria-label="Fulcrum logo">
                    <div className="logo-chip">
                      <img className="logo-img" src="/brand/fulcrum-wordmark.png" alt="Fulcrum" />
                    </div>
                    <div className="pill">Focus: Deal Flow • Sourcing</div>
                  </div>
                </header>

                <div className="divider" />

                <section className="section">
                  <h2>Who This Tract Is For</h2>
                  <div className="card">
                    <p>
                      If you are interested in <strong>Private Equity</strong>, <strong>mergers and acquisitions</strong>,{" "}
                      <strong>business finance</strong>, and <strong>buying or selling businesses</strong>, the Fulcrum
                      Academy M&amp;A Tract is designed for you.
                    </p>
                    <p>
                      This tract provides hands-on exposure to the real mechanics of <strong>M&amp;A business development</strong>,{" "}
                      how buyers think, how sellers decide, and how deals are initiated long before bankers and lawyers step in.
                    </p>
                    <p>
                      You will learn how to speak the language of the industry, understand incentives on both sides of a transaction,
                      and develop business development skills that are highly attractive to <strong>corporate development teams</strong>,{" "}
                      <strong>private equity firms</strong>, and <strong>M&amp;A platforms</strong>.
                    </p>
                  </div>
                </section>

                <div className="divider" />

                <section className="section">
                  <h2>What You’ll Be Doing</h2>
                  <div className="card">
                    <p>
                      As an <strong>M&amp;A Tract apprentice</strong>, you will support Fulcrum’s buy-side and sell-side sourcing efforts
                      through <strong>Scoutly</strong>, our M&amp;A division. Your work includes:
                    </p>

                    <ul>
                      <li><span className="check" /><span className="li-text">Researching active buyers and sellers to assess strategic and financial alignment</span></li>
                      <li><span className="check" /><span className="li-text">Reaching out to potential buyers and sellers to gauge interest</span></li>
                      <li><span className="check" /><span className="li-text">Supporting buyers in identifying seller opportunities of interest</span></li>
                      <li><span className="check" /><span className="li-text">Supporting sellers in identifying potential buyers</span></li>
                      <li><span className="check" /><span className="li-text">Participating in seller meetings to understand goals, motivations, and constraints</span></li>
                      <li><span className="check" /><span className="li-text">Creating confidential profiles on buyers and sellers</span></li>
                      <li><span className="check" /><span className="li-text">Facilitating and coordinating introductory meetings between aligned parties</span></li>
                    </ul>

                    <div className="highlight">This is real deal-flow work—not simulated exercises.</div>
                  </div>
                </section>

                <footer className="contact" aria-label="Contact information">
                  <div className="contact-right">
                    <a className="citem" href="mailto:info@workwithfulcrum.com">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4z" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                      info@workwithfulcrum.com
                    </a>

                    <a className="citem" href="tel:+13373350046">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                      337-335-0046
                    </a>

                    <a className="citem" href="https://www.workwithfulcrum.com" target="_blank" rel="noopener noreferrer">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                        <path d="M2 12h20" />
                        <path d="M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22" />
                        <path d="M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
                      </svg>
                      workwithfulcrum.com
                    </a>

                    <span className="citem" style={{ cursor: "default" }}>
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                        <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                      108 Kol Dr, Broussard, LA
                    </span>
                  </div>
                </footer>
              </section>
            </main>
          </div>

          <div className="overflow-x-auto pb-4">
            <main className="sheet page-break" role="document" aria-label="Fulcrum Academy Flyer Page 2">
              <div className="topbar" />

              <section className="content">
                <header className="brand" style={{ marginBottom: 8 }}>
                  <div className="title-wrap" style={{ maxWidth: "86ch" }}>
                    <div className="badge">
                      <span className="dot" /> Fulcrum Academy • M&amp;A Tract (Scoutly)
                    </div>
                    <h1 style={{ fontSize: 25, marginTop: 7, marginBottom: 6 }}>
                      Expectations, Structure &amp; Outcomes
                    </h1>
                    <p className="sub" style={{ maxWidth: "80ch" }}>
                      Clear expectations, a structured path to advancement, and outcomes that translate into credible deal experience.
                    </p>
                  </div>

                  <div className="meta">
                    <div className="pill">Page 2 of 2</div>
                    <div style={{ height: 6 }} />
                    <div className="pill">Commitment: 5–10 hrs/week</div>
                  </div>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "1.12fr .88fr", gap: 12, alignItems: "start" }}>
                  <div>
                    <section className="section" style={{ marginBottom: 10 }}>
                      <h2>Expectations &amp; Commitments</h2>
                      <div className="card">
                        <p style={{ marginBottom: 8 }}>To succeed in the M&amp;A Tract, apprentices are expected to:</p>

                        <ul style={{ gap: 7 }}>
                          <li><span className="check" /><span className="li-text">Complete initial training and educational sessions</span></li>
                          <li><span className="check" /><span className="li-text">Participate in company meetings to quickly learn industry terminology and best practices</span></li>
                          <li><span className="check" /><span className="li-text">Commit <strong>5–10 hours per week</strong> to business development activities</span></li>
                          <li><span className="check" /><span className="li-text">Identify <strong>5–10 potential buyer–seller matches per week</strong> and communicate with both sides to gauge interest</span></li>
                          <li><span className="check" /><span className="li-text">Proactively reach out to new buyers and sellers on a weekly basis</span></li>
                        </ul>

                        <div className="highlight" style={{ marginTop: 9 }}>
                          Progress is measured by <strong>quality of matches</strong>, <strong>consistency of effort</strong>, and{" "}
                          <strong>professional communication</strong>.
                        </div>
                      </div>
                    </section>

                    <section className="section" style={{ marginBottom: 10 }}>
                      <h2>Why This Tract Matters</h2>
                      <div className="card">
                        <p>
                          <strong>Most people interested in M&amp;A never see how deals actually start.</strong>
                        </p>
                        <p style={{ marginTop: 8 }}>
                          This tract gives you direct exposure, real responsibility, and credible experience—the hardest combination to find in this industry.
                        </p>
                        <div className="highlight" style={{ marginTop: 9 }}>
                          This is a proving ground for future deal professionals.
                        </div>
                      </div>
                    </section>

                    <div className="scoutly-under-section" aria-hidden="true" />
                  </div>

                  <div>
                    <section className="section" style={{ marginBottom: 10 }}>
                      <h2>Program Structure</h2>
                      <div className="card">
                        <ul style={{ gap: 7, marginTop: 0 }}>
                          <li><span className="check" /><span className="li-text"><strong>Duration:</strong> 3–6 months</span></li>
                          <li><span className="check" /><span className="li-text"><strong>Levels:</strong> 3 (training, execution, performance)</span></li>
                          <li><span className="check" /><span className="li-text"><strong>Focus:</strong> M&amp;A sourcing, relationship development, and early deal formation</span></li>
                          <li><span className="check" /><span className="li-text"><strong>Support:</strong> Training, feedback, and direct exposure to live opportunities</span></li>
                        </ul>

                        <div className="highlight" style={{ marginTop: 9 }}>
                          Advancement is earned through <strong>execution</strong>, <strong>accuracy</strong>, and <strong>reliability</strong>.
                        </div>
                      </div>
                    </section>

                    <section className="section" style={{ marginBottom: 10 }}>
                      <h2>By the End of the Program</h2>
                      <div className="card">
                        <p style={{ marginBottom: 8 }}>Upon successful completion of the M&amp;A Tract:</p>
                        <ul style={{ gap: 7 }}>
                          <li><span className="check" /><span className="li-text">Fair compensation for value created and work completed</span></li>
                          <li><span className="check" /><span className="li-text">You will receive a Fulcrum Academy Certificate of Completion</span></li>
                          <li><span className="check" /><span className="li-text">Your completion will be announced on social channels</span></li>
                          <li><span className="check" /><span className="li-text">You may be offered an opportunity to join Fulcrum’s buy-side scouting team</span></li>
                        </ul>
                      </div>
                    </section>

                    <div className="card" style={{ borderStyle: "dashed", marginTop: 6, padding: "10px 12px" }}>
                      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
                        Built for candidates who want <strong style={{ color: "var(--ink)" }}>real deal-flow exposure</strong> and a repeatable
                        business development skill set.
                      </p>
                    </div>
                  </div>
                </div>

                <footer className="contact" aria-label="Contact information">
                  <div className="contact-right">
                    <a className="citem" href="mailto:info@workwithfulcrum.com">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4z" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                      info@workwithfulcrum.com
                    </a>

                    <a className="citem" href="tel:+13373350046">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                      337-335-0046
                    </a>

                    <a className="citem" href="https://www.workwithfulcrum.com" target="_blank" rel="noopener noreferrer">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                        <path d="M2 12h20" />
                        <path d="M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22" />
                        <path d="M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
                      </svg>
                      workwithfulcrum.com
                    </a>

                    <span className="citem" style={{ cursor: "default" }}>
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                        <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                      108 Kol Dr, Broussard, LA
                    </span>
                  </div>
                </footer>
              </section>
            </main>
          </div>
        </div>

        <style>{`
          .academy-flyer{
            --ink:#0b0f14;
            --muted:#5b6676;
            --paper:#ffffff;
            --gold:#f2b705;
            --goldSoft: rgba(242,183,5,.16);
            --line:#e7edf5;
            --chip:#f6f8fc;
            --shadow: 0 18px 40px rgba(11,15,20,.14);
          }

          @page { size: 8.5in 11in; margin: 0.5in; }

          .academy-flyer, .academy-flyer *{ box-sizing:border-box; }

          .sheet{
            width: 8.5in;
            height: 11in;
            margin: 0 auto;
            border-radius: 18px;
            box-shadow: var(--shadow);
            overflow: hidden;
            position: relative;
            background:
              radial-gradient(900px 520px at 82% 10%, var(--goldSoft), transparent 58%),
              radial-gradient(820px 520px at 10% 18%, rgba(11,15,20,.06), transparent 60%),
              linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
          }

          .sheet::before{
            content:"";
            position:absolute;
            inset:0;
            pointer-events:none;
            opacity:.50;
            background-image: radial-gradient(rgba(11,15,20,.06) 1px, transparent 1px);
            background-size: 22px 22px;
            mask-image: linear-gradient(180deg, rgba(0,0,0,.85), rgba(0,0,0,.35) 55%, rgba(0,0,0,.15));
          }

          .topbar{
            height: 0.22in;
            background: linear-gradient(90deg, var(--ink), #1a2432 55%, var(--gold));
            position: relative;
            z-index: 1;
          }

          .content{
            padding: 0.34in 0.46in 0.30in;
            position: relative;
            z-index: 1;
            display:flex;
            flex-direction:column;
            height: calc(100% - 0.22in);
          }

          .brand{
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap: 16px;
            margin-bottom: 12px;
          }

          .title-wrap{ max-width: 80ch; }

          .logo-wrap{
            display:flex;
            flex-direction:column;
            align-items:flex-end;
            gap: 8px;
            min-width: 220px;
          }
          .logo-chip{
            border: 1px solid var(--line);
            background: rgba(255,255,255,.86);
            backdrop-filter: blur(4px);
            border-radius: 16px;
            padding: 10px 12px;
            box-shadow: 0 10px 22px rgba(11,15,20,.08);
          }
          .logo-img{
            display:block;
            max-width: 250px;
            width: 100%;
            height: auto;
            opacity: .98;
            filter: contrast(1.25) brightness(0.9);
          }

          .badge{
            display:inline-flex;
            align-items:center;
            gap:10px;
            padding: 8px 10px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(242,183,5,.18), rgba(242,183,5,.06));
            border: 1px solid rgba(242,183,5,.35);
            color: var(--ink);
            font-weight: 650;
            font-size: 12.5px;
            letter-spacing: .2px;
            white-space: nowrap;
            width: fit-content;
          }
          .badge .dot{
            width: 9px;
            height: 9px;
            border-radius: 999px;
            background: var(--gold);
            box-shadow: 0 0 0 3px rgba(242,183,5,.18);
          }

          .gold-chip{
            background:linear-gradient(180deg, rgba(242,183,5,.65), rgba(242,183,5,.15));
            padding:0 6px;
            border-radius:10px;
          }

          .academy-flyer h1{
            margin: 8px 0 6px;
            font-size: 28.5px;
            line-height: 1.12;
            letter-spacing: -0.4px;
          }

          .sub{
            margin: 0;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.45;
            max-width: 72ch;
          }

          .meta{
            text-align:right;
            min-width: 210px;
          }

          .pill{
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding: 7px 9px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: rgba(255,255,255,.86);
            backdrop-filter: blur(4px);
            color: var(--muted);
            white-space: nowrap;
            font-size: 12px;
          }

          .divider{
            margin: 12px 0 12px;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--line), transparent);
          }

          .section{
            display:grid;
            grid-template-columns: 1fr;
            gap: 7px;
            margin-bottom: 10px;
          }
          .section h2{
            margin: 0;
            font-size: 15px;
            letter-spacing: .2px;
            text-transform: uppercase;
            color: var(--ink);
            display:flex;
            align-items:center;
            gap:10px;
          }
          .section h2::before{
            content:"";
            width: 10px;
            height: 10px;
            border-radius: 3px;
            background: var(--gold);
          }

          .card{
            border: 1px solid var(--line);
            background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(251,252,255,.92));
            border-radius: 16px;
            padding: 13px 14px;
            backdrop-filter: blur(6px);
          }
          .card p{
            margin: 0;
            color: var(--ink);
            font-size: 14px;
            line-height: 1.5;
          }
          .card p + p{ margin-top: 8px; }

          .highlight{
            background: linear-gradient(180deg, rgba(255,215,106,.55), rgba(255,215,106,.18));
            border: 1px solid rgba(242,183,5,.35);
            padding: 9px 11px;
            border-radius: 14px;
            margin-top: 9px;
            font-weight: 650;
            font-size: 13.5px;
          }

          .academy-flyer ul{
            margin: 9px 0 0;
            padding: 0;
            list-style: none;
            display:grid;
            gap: 8px;
          }

          .academy-flyer li{
            display:flex;
            gap: 10px;
            align-items:flex-start;
            padding: 8px 10px;
            border-radius: 14px;
            background: rgba(246,248,252,.92);
            border: 1px solid #e9eef7;
            backdrop-filter: blur(4px);
          }

          .check{
            width: 17px;
            height: 17px;
            border-radius: 6px;
            background: rgba(242,183,5,.22);
            border: 1px solid rgba(242,183,5,.55);
            flex: 0 0 17px;
            margin-top: 2px;
            position: relative;
          }
          .check::after{
            content:"";
            position:absolute;
            left: 5px;
            top: 3px;
            width: 6px;
            height: 9px;
            border: solid var(--ink);
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: .9;
          }

          .li-text{
            font-size: 14px;
            line-height: 1.42;
            color: var(--ink);
          }

          .contact{
            margin-top: auto;
            padding-top: 8px;
            border-top: 1px dashed var(--line);
            display:flex;
            align-items:flex-start;
            justify-content:flex-end;
            color: var(--muted);
          }

          .contact-right{
            width: 100%;
            display:flex;
            justify-content: space-between;
            align-items:center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .citem{
            display:flex;
            align-items:center;
            gap: 6px;
            padding: 5px 7px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: rgba(255,255,255,.86);
            backdrop-filter: blur(4px);
            font-size: 11px;
            color: var(--muted);
            text-decoration: none;
            white-space: nowrap;
            flex: 1 1 160px;
            justify-content: center;
            text-align:center;
          }

          .cicon{
            width: 14px;
            height: 14px;
            flex: 0 0 14px;
            fill: none;
            stroke: var(--ink);
            stroke-width: 1.8;
            opacity: .9;
          }

          .page-break{
            page-break-before: always;
            break-before: page;
          }

          .scoutly-under-section{
            position: relative;
            height: 95px;
            margin-top: 6px;
            margin-bottom: 4px;
            border-radius: 16px;
            overflow: hidden;
            z-index: 1;
            border: 1px solid var(--line);
            background: rgba(255,255,255,.72);
            backdrop-filter: blur(4px);
          }
          .scoutly-under-section::after{
            content:"";
            position:absolute;
            inset:0;
            background-image: url("/brand/scoutly-grey.png");
            background-repeat: no-repeat;
            background-position: center;
            background-size: min(92%, 600px);
            opacity: 0.78;
            pointer-events:none;
            filter: grayscale(100%);
          }

          @media print{
            .sheet{
              margin:0;
              border-radius:0;
              box-shadow:none;
            }
            .sheet::before{ opacity:.45; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* Track 02 removed
function AcademyTrackMarketing() {
  return (
    <section className="px-6 py-12 md:py-16 bg-[#eef3fb]">
      <div className="max-w-7xl mx-auto">
        <Link to="/academy" className="inline-flex items-center text-sm font-semibold text-black/70 hover:text-black">
          <ArrowRight className="mr-2 rotate-180" size={18} /> Back to Academy
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Track 02</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2 leading-tight">
              Sponsored Client <span className="text-[#D6A21E]">Apprenticeship</span> Tract
            </h1>
            <p className="text-black/70 mt-2 max-w-2xl">
              Print-friendly flyer. Use “Print” to save as PDF.
            </p>
          </div>
          <Button
            type="button"
            className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8 py-5"
            onClick={() => window.print()}
          >
            Print / Save as PDF <ArrowRight className="ml-2" />
          </Button>
        </div>

        <div className="mt-10 academy-flyer2 space-y-10">
          <div className="overflow-x-auto pb-4">
            <main className="sheet" role="document" aria-label="Fulcrum Academy Flyer Page 1">
              <div className="spine" aria-hidden="true" />

              <section className="content">
                <header className="top">
                  <div className="title-wrap">
                    <div className="kicker">
                      <span className="kdot" /> Fulcrum Academy • Sponsored Client Tract
                    </div>
                    <h1>Sponsored Client Apprenticeship Tract</h1>
                    <p className="sub">
                      <strong>A Smarter Way to Build Sales Talent.</strong> The Fulcrum Academy Sponsored Client Tract enables
                      companies to train, evaluate, and hire sales talent inside real operating conditions—before making a
                      full-time commitment.
                    </p>
                  </div>

                  <div className="meta">
                    <div className="logo-chip" aria-label="Fulcrum logo">
                      <img className="logo-img" src="/brand/fulcrum-wordmark.png" alt="Fulcrum" />
                    </div>
                    <div className="pill">Lower Risk • Higher Signal</div>
                  </div>
                </header>

                <section className="card">
                  <p>
                    Instead of relying on resumes and interviews alone, sponsors gain access to apprentices who are trained, vetted,
                    and actively proving themselves within the sponsor’s actual sales environment.
                  </p>

                  <div className="bar">
                    Sponsors see execution, coachability, communication, and results <strong>before hiring</strong>.
                  </div>

                  <div className="stats" aria-label="Outcome stats">
                    <div className="stat">
                      <div className="k">Time</div>
                      <div className="v">Faster time-to-productivity</div>
                    </div>
                    <div className="stat">
                      <div className="k">Risk</div>
                      <div className="v">Less payroll + hiring risk</div>
                    </div>
                    <div className="stat">
                      <div className="k">Pipeline</div>
                      <div className="v">Durable talent funnel</div>
                    </div>
                  </div>
                </section>

                <div className="grid-2">
                  <section className="card">
                    <div className="h2">
                      <h2>What Is the Fulcrum Academy?</h2>
                      <span className="tag">Built for real execution</span>
                    </div>
                    <p>
                      The Fulcrum Academy is a best-in-class professional apprenticeship program created by{" "}
                      <strong>Reece Theriot, MBA</strong>, former sales, marketing, and entrepreneurship professor at the University
                      of Louisiana at Lafayette’s <strong>B.I. Moody III College of Business</strong>.
                    </p>
                    <p>
                      Reece helped design UL’s Entrepreneurship Minor curriculum and served as Head Coach of the UL Ragin’ Sales Team,
                      which consistently competed and placed at national sales competitions. Universities still license and leverage
                      Fulcrum’s methods to help advance research through traditional sales applications.
                    </p>
                    <p>
                      The Academy exists to develop job-ready sales and growth professionals through <strong>real execution</strong>,{" "}
                      <strong>accountability</strong>, and <strong>mentorship</strong>—not classroom theory.
                    </p>
                  </section>

                  <section className="card">
                    <div className="h2">
                      <h2>What Is a Sponsored Client Tract?</h2>
                      <span className="tag">Sponsor-specific</span>
                    </div>
                    <p>
                      A Sponsored Client Tract is a customized apprenticeship track built around a sponsor’s sales motion, market, ICP,
                      and hiring needs.
                    </p>
                    <p>
                      Fulcrum recruits, trains, and manages apprentices who work directly on the sponsor’s live sales initiatives—allowing
                      leaders to observe performance, coach selectively, and hire with confidence.
                    </p>
                    <div className="bar">
                      In short: a <strong>lower-risk, higher-signal</strong> alternative to traditional sales hiring.
                    </div>
                  </section>
                </div>

                <footer className="contact" aria-label="Contact information">
                  <div className="contact-right">
                    <a className="citem" href="mailto:info@workwithfulcrum.com">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4z" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                      info@workwithfulcrum.com
                    </a>

                    <a className="citem" href="tel:+13373350046">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                      337-335-0046
                    </a>

                    <a className="citem" href="https://www.workwithfulcrum.com" target="_blank" rel="noopener noreferrer">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                        <path d="M2 12h20" />
                        <path d="M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22" />
                        <path d="M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
                      </svg>
                      workwithfulcrum.com
                    </a>

                    <span className="citem" style={{ cursor: "default" }}>
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                        <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                      108 Kol Dr, Broussard, LA
                    </span>
                  </div>
                </footer>
              </section>
            </main>
          </div>

          <div className="overflow-x-auto pb-4">
            <main className="sheet page-break" role="document" aria-label="Fulcrum Academy Flyer Page 2">
              <div className="spine" aria-hidden="true" />
              <section className="content tight">
                <header className="top">
                  <div className="title-wrap">
                    <div className="kicker">
                      <span className="kdot" /> Sponsors • What You Receive
                    </div>
                    <h1>What Sponsors Receive, Structure &amp; Commercial Model</h1>
                    <p className="sub">
                      Fulcrum handles recruiting, training, management, and reporting—so sponsors can focus on observing performance and
                      hiring with confidence.
                    </p>
                  </div>
                  <div className="meta">
                    <div className="pill">Page 2 of 2</div>
                    <div className="pill">3–6 Months • Performance-Based</div>
                  </div>
                </header>

                <div className="page2-body">
                  <div className="grid-2">
                    <section className="card">
                      <div className="h2">
                        <h2>What Sponsors Receive</h2>
                        <span className="tag">Talent + proof</span>
                      </div>

                      <div className="stack">
                        <div className="mini">
                          <span className="icon" />
                          <div className="mini-body">
                            <div className="mini-head">
                              <svg className="ticon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              <p className="mini-title">Immediate Access to Talent</p>
                            </div>
                            <div className="mini-points">
                              <div className="pt">Motivated apprentices eager to learn and prove themselves</div>
                              <div className="pt">Early-career and career-pivot candidates screened by Fulcrum</div>
                            </div>
                          </div>
                        </div>

                        <div className="mini">
                          <span className="icon" />
                          <div className="mini-body">
                            <div className="mini-head">
                              <svg className="ticon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                <path d="M8 6h8" />
                                <path d="M8 10h8" />
                              </svg>
                              <p className="mini-title">Customized Baseline Training</p>
                            </div>
                            <div className="mini-points">
                              <div className="pt">Sales fundamentals tailored to the sponsor’s:</div>
                              <div className="pt">Market</div>
                              <div className="pt">Product or service</div>
                              <div className="pt">Sales process</div>
                              <div className="pt">Tools and CRM</div>
                            </div>
                          </div>
                        </div>

                        <div className="mini">
                          <span className="icon" />
                          <div className="mini-body">
                            <div className="mini-head">
                              <svg className="ticon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                              </svg>
                              <p className="mini-title">Recruiting &amp; Vetting</p>
                            </div>
                            <div className="mini-points">
                              <div className="pt">Fulcrum manages sourcing, screening, onboarding, and performance tracking</div>
                              <div className="pt">Candidates matched to sponsor-defined criteria and constraints</div>
                            </div>
                          </div>
                        </div>

                        <div className="mini">
                          <span className="icon" />
                          <div className="mini-body">
                            <div className="mini-head">
                              <svg className="ticon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 3v18h18" />
                                <path d="M7 14l3-3 4 4 6-6" />
                                <path d="M17 9h3v3" />
                              </svg>
                              <p className="mini-title">Real Performance Data</p>
                            </div>
                            <div className="mini-points">
                              <div className="pt">Apprentices work on prospecting, outreach, and pipeline development</div>
                              <div className="pt">Sponsors see execution, coachability, communication, and results before hiring</div>
                            </div>
                          </div>
                        </div>

                        <div className="mini">
                          <span className="icon" />
                          <div className="mini-body">
                            <div className="mini-head">
                              <svg className="ticon" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 11v2a2 2 0 0 0 2 2h2l6 4V7L7 11H5a2 2 0 0 0-2 2z" />
                                <path d="M13 7l8-3v16l-8-3" />
                                <path d="M7 15l1.5 4.5a2 2 0 0 0 1.9 1.5H12" />
                              </svg>
                              <p className="mini-title">Co-Marketing &amp; Talent Pipeline</p>
                            </div>
                            <div className="mini-points">
                              <div className="pt">Co-branded tract promoted to university partners and applicant networks</div>
                              <div className="pt">Creates a repeatable hiring funnel—not a one-off placement</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div style={{ display: "grid", gap: 9 }}>
                      <section className="card">
                        <div className="h2">
                          <h2>Program Structure</h2>
                          <span className="tag">Execution first</span>
                        </div>

                        <ul style={{ marginTop: 0 }}>
                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Duration:</strong> 3–6 months (based on scope and demand)
                            </span>
                          </li>
                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Levels:</strong> 1–3 (performance-based progression)
                            </span>
                          </li>
                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Focus:</strong> Prospecting, outreach, and early pipeline generation
                            </span>
                          </li>
                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Oversight:</strong> Fulcrum provides training, management, and reporting
                            </span>
                          </li>
                        </ul>

                        <div className="bar">Top performers advance. Underperformers are filtered out before payroll risk.</div>
                      </section>

                      <section className="card">
                        <div className="h2">
                          <h2>Commercial Model</h2>
                          <span className="tag">Aligned incentives</span>
                        </div>

                        <ul style={{ marginTop: 0 }}>
                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Up-Front Customization Fee</strong>
                              <div className="subpoints">
                                <div>Covers tract design, training alignment, and recruiting setup</div>
                              </div>
                            </span>
                          </li>

                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Ongoing Management</strong>
                              <div className="subpoints">
                                <div>Monthly subscription or hourly rate for active program management</div>
                              </div>
                            </span>
                          </li>

                          <li>
                            <span className="icon" />
                            <span className="li-text">
                              <strong>Placement Fee</strong>
                              <div className="subpoints">
                                <div>Paid only upon successful hire, aligning incentives with outcomes</div>
                              </div>
                            </span>
                          </li>
                        </ul>

                        <div className="bar">
                          The result: faster time-to-productivity, lower hiring risk, and a durable sales talent pipeline built for your business.
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                <footer className="contact" aria-label="Contact information">
                  <div className="contact-right">
                    <a className="citem" href="mailto:info@workwithfulcrum.com">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4z" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                      info@workwithfulcrum.com
                    </a>
                    <a className="citem" href="tel:+13373350046">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                      337-335-0046
                    </a>
                    <a className="citem" href="https://www.workwithfulcrum.com" target="_blank" rel="noopener noreferrer">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                        <path d="M2 12h20" />
                        <path d="M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22" />
                        <path d="M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
                      </svg>
                      workwithfulcrum.com
                    </a>
                    <span className="citem" style={{ cursor: "default" }}>
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                        <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                      108 Kol Dr, Broussard, LA
                    </span>
                  </div>
                </footer>
              </section>
            </main>
          </div>
        </div>

        <style>{`
          .academy-flyer2{
            --ink:#0b0f14;
            --muted:#5b6676;
            --paper:#ffffff;
            --gold:#f2b705;
            --line:#e6edf6;
            --bg:#eef3fb;
            --shadow: 0 16px 38px rgba(11,15,20,.12);
            --shadow2: 0 10px 22px rgba(11,15,20,.08);
          }

          @page { size: 8.5in 11in; margin: 0.5in; }

          .academy-flyer2, .academy-flyer2 *{
            box-sizing:border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .academy-flyer2 .sheet{
            width: 8.5in;
            height: 11in;
            margin: 0 auto;
            border-radius: 18px;
            box-shadow: var(--shadow);
            overflow: hidden;
            position: relative;
            background: #fff;
          }

          .academy-flyer2 .spine{
            position:absolute;
            left:0;
            top:0;
            bottom:0;
            width: 0.38in;
            background: linear-gradient(180deg, var(--gold) 0%, #f7c22d 30%, #1a2432 85%, #0b0f14 100%);
            z-index: 0;
          }
          .academy-flyer2 .spine::after{
            content:"";
            position:absolute;
            inset: 0;
            opacity: .18;
            background-image: radial-gradient(rgba(255,255,255,.40) 1px, transparent 1px);
            background-size: 18px 18px;
            mask-image: linear-gradient(180deg, rgba(0,0,0,.9), rgba(0,0,0,.15));
            pointer-events:none;
          }

          .academy-flyer2 .content{
            position:relative;
            z-index: 1;
            height: 100%;
            padding: 0.40in 0.50in 0.32in 0.82in;
            display:flex;
            flex-direction:column;
            gap: 12px;
          }

          .academy-flyer2 .top{
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--line);
          }

          .academy-flyer2 .kicker{
            display:inline-flex;
            align-items:center;
            gap: 10px;
            font-size: 12px;
            letter-spacing: .20em;
            text-transform: uppercase;
            color: var(--muted);
          }
          .academy-flyer2 .kdot{
            width: 10px;
            height: 10px;
            border-radius: 3px;
            background: var(--gold);
            box-shadow: 0 0 0 3px rgba(242,183,5,.16);
            flex: 0 0 10px;
          }

          .academy-flyer2 h1{
            margin: 8px 0 6px;
            font-size: 30px;
            line-height: 1.08;
            letter-spacing: -0.4px;
          }
          .academy-flyer2 .sub{
            margin:0;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.48;
            max-width: 86ch;
          }

          .academy-flyer2 .meta{
            display:flex;
            flex-direction:column;
            align-items:flex-end;
            gap: 8px;
            min-width: 250px;
          }

          .academy-flyer2 .pill{
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding: 7px 10px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: #fff;
            color: var(--muted);
            font-size: 12px;
            white-space: nowrap;
            box-shadow: var(--shadow2);
          }

          .academy-flyer2 .logo-chip{
            width: 250px;
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 10px 12px;
            background: #fff;
            box-shadow: var(--shadow2);
          }
          .academy-flyer2 .logo-img{
            display:block;
            width:100%;
            height:auto;
            opacity:.98;
            filter: contrast(1.25) brightness(0.9);
          }

          .academy-flyer2 .card{
            border: 1px solid var(--line);
            background: #fff;
            border-radius: 18px;
            padding: 14px 14px;
            box-shadow: var(--shadow2);
          }
          .academy-flyer2 .card p{
            margin:0;
            font-size: 14px;
            line-height: 1.52;
            color: var(--ink);
          }
          .academy-flyer2 .card p + p{ margin-top: 8px; }

          .academy-flyer2 .bar{
            margin-top: 10px;
            border-radius: 14px;
            padding: 10px 12px;
            background: linear-gradient(90deg, rgba(242,183,5,.22), rgba(242,183,5,.06));
            border: 1px solid rgba(242,183,5,.35);
            font-weight: 650;
            font-size: 13.5px;
          }

          .academy-flyer2 .stats{
            display:grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
          }
          .academy-flyer2 .stat{
            border: 1px solid var(--line);
            background: #fbfcff;
            border-radius: 16px;
            padding: 10px 10px;
          }
          .academy-flyer2 .stat .k{
            font-size: 11px;
            letter-spacing: .18em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 6px;
          }
          .academy-flyer2 .stat .v{
            font-size: 13.5px;
            font-weight: 750;
            line-height: 1.25;
            color: var(--ink);
          }

          .academy-flyer2 .h2{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 12px;
            margin: 2px 0 10px;
          }
          .academy-flyer2 .h2 h2{
            margin:0;
            font-size: 14px;
            letter-spacing: .18em;
            text-transform: uppercase;
            color: var(--ink);
          }
          .academy-flyer2 .tag{
            font-size: 11.5px;
            color: var(--muted);
            border: 1px solid var(--line);
            background: #fff;
            padding: 6px 10px;
            border-radius: 999px;
            box-shadow: var(--shadow2);
            white-space: nowrap;
          }

          .academy-flyer2 .grid-2{
            display:grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            align-items:start;
          }

          .academy-flyer2 ul{
            margin: 10px 0 0;
            padding: 0;
            list-style: none;
            display:grid;
            gap: 8px;
          }

          .academy-flyer2 li{
            display:flex;
            gap: 10px;
            align-items:flex-start;
            padding: 9px 10px;
            border-radius: 16px;
            background: #f7f9fe;
            border: 1px solid #e9effa;
          }

          .academy-flyer2 .icon{
            width: 18px;
            height: 18px;
            flex: 0 0 18px;
            margin-top: 2px;
            border-radius: 6px;
            background: rgba(242,183,5,.22);
            border: 1px solid rgba(242,183,5,.55);
            position: relative;
          }
          .academy-flyer2 .icon::after{
            content:"";
            position:absolute;
            left: 6px;
            top: 3px;
            width: 6px;
            height: 10px;
            border: solid var(--ink);
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: .9;
          }

          .academy-flyer2 .li-text{
            font-size: 13.8px;
            line-height: 1.42;
            color: var(--ink);
          }
          .academy-flyer2 .li-text strong{
            display:block;
            margin-bottom: 3px;
            color: var(--ink);
          }

          .academy-flyer2 .subpoints{
            margin-top: 6px;
            display:grid;
            gap: 4px;
            color: var(--muted);
            font-size: 12.8px;
            line-height: 1.35;
          }
          .academy-flyer2 .subpoints div{
            display:flex;
            gap: 8px;
            align-items:flex-start;
          }
          .academy-flyer2 .subpoints div::before{
            content:"";
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: rgba(11,15,20,.25);
            margin-top: 6px;
            flex: 0 0 6px;
          }

          .academy-flyer2 .stack{
            display:grid;
            gap: 8px;
            margin-top: 8px;
          }

          .academy-flyer2 .mini{
            border: 1px solid #e9effa;
            background: #f7f9fe;
            border-radius: 16px;
            padding: 9px 10px;
            display:flex;
            gap: 10px;
            align-items:flex-start;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .academy-flyer2 .mini .mini-body{
            min-width: 0;
            flex: 1;
          }

          .academy-flyer2 .mini-head{
            display:flex;
            align-items:center;
            gap: 8px;
          }

          .academy-flyer2 .ticon{
            width: 16px;
            height: 16px;
            flex: 0 0 16px;
            stroke: var(--ink);
            fill: none;
            stroke-width: 1.9;
            opacity: .92;
          }

          .academy-flyer2 .mini-title{
            margin: 0;
            font-weight: 760;
            font-size: 13.1px;
            line-height: 1.25;
            color: var(--ink);
          }

          .academy-flyer2 .mini-points{
            margin-top: 5px;
            display:grid;
            gap: 3px;
            color: var(--muted);
            font-size: 12.2px;
            line-height: 1.28;
          }

          .academy-flyer2 .mini-points .pt{
            display:flex;
            gap: 8px;
            align-items:flex-start;
          }
          .academy-flyer2 .mini-points .pt::before{
            content:"";
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: rgba(11,15,20,.25);
            margin-top: 5px;
            flex: 0 0 6px;
          }

          .academy-flyer2 .contact{
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px dashed var(--line);
            display:flex;
            align-items:flex-start;
            justify-content:flex-end;
            color: var(--muted);
          }
          .academy-flyer2 .contact-right{
            width: 100%;
            display:flex;
            justify-content: space-between;
            align-items:center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .academy-flyer2 .citem{
            display:flex;
            align-items:center;
            gap: 6px;
            padding: 5px 7px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: #fff;
            box-shadow: var(--shadow2);
            font-size: 11px;
            color: var(--muted);
            text-decoration: none;
            white-space: nowrap;
            flex: 1 1 160px;
            justify-content: center;
            text-align:center;
          }
          .academy-flyer2 .cicon{
            width: 14px;
            height: 14px;
            flex: 0 0 14px;
            fill: none;
            stroke: var(--ink);
            stroke-width: 1.8;
            opacity: .9;
          }

          .academy-flyer2 .page-break{
            page-break-before: always;
            break-before: page;
          }

          .academy-flyer2 .content.tight{
            padding: 0.28in 0.40in 0.18in 0.74in;
            gap: 8px;
          }

          .academy-flyer2 .content.tight .top{
            padding-bottom: 6px;
            gap: 14px;
          }
          .academy-flyer2 .content.tight .kicker{
            font-size: 13.5px;
            letter-spacing: .20em;
            margin-bottom: 2px;
          }
          .academy-flyer2 .content.tight h1{
            font-size: 30px !important;
            line-height: 1.04;
            margin: 6px 0 4px !important;
          }
          .academy-flyer2 .content.tight .sub{
            font-size: 14.2px;
            line-height: 1.32;
            max-width: 78ch;
            margin-top: 0;
          }
          .academy-flyer2 .content.tight .card{ padding: 10px 10px; }
          .academy-flyer2 .content.tight ul{ gap: 6px; margin-top: 6px; }
          .academy-flyer2 .content.tight li{ padding: 7px 8px; border-radius: 14px; }
          .academy-flyer2 .content.tight .li-text{ font-size: 12.7px; line-height: 1.34; }
          .academy-flyer2 .content.tight .subpoints{
            font-size: 11.6px;
            line-height: 1.28;
            gap: 2px;
            margin-top: 4px;
          }
          .academy-flyer2 .content.tight .subpoints div::before{ margin-top: 5px; }
          .academy-flyer2 .content.tight .bar{
            font-size: 12.3px;
            padding: 7px 9px;
            margin-top: 7px;
            border-radius: 12px;
          }
          .academy-flyer2 .content.tight .pill{
            font-size: 11.6px;
            padding: 6px 10px;
          }
          .academy-flyer2 .content.tight .stack{ gap: 6px; margin-top: 6px; }
          .academy-flyer2 .content.tight .mini{ padding: 7px 8px; }
          .academy-flyer2 .content.tight .mini-title{ font-size: 12.8px; }
          .academy-flyer2 .content.tight .mini-points{ font-size: 11.7px; line-height: 1.25; }
          .academy-flyer2 .content.tight .contact{ padding-top: 7px; }
          .academy-flyer2 .content.tight .contact-right{ gap: 8px; }
          .academy-flyer2 .content.tight .citem{ font-size: 10.6px; padding: 4px 6px; }
          .academy-flyer2 .content.tight .cicon{ width: 13px; height: 13px; flex: 0 0 13px; }
          .academy-flyer2 .content.tight .page2-body{ margin-top: 18px; }

          @media print{
            .academy-flyer2 .sheet{
              margin:0;
              border-radius:0;
              box-shadow:none;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
*/

function AcademyTrackOperations() {
  return (
    <section className="px-6 py-12 md:py-16 bg-[#eef3fb]">
      <div className="max-w-7xl mx-auto">
        <Link to="/academy" className="inline-flex items-center text-sm font-semibold text-black/70 hover:text-black">
          <ArrowRight className="mr-2 rotate-180" size={18} /> Back to Academy
        </Link>

        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-black/60">Track 02</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2 leading-tight">
              Apprenticeship <span className="text-[#D6A21E]">Tracts</span>
            </h1>
            <p className="text-black/70 mt-2 max-w-2xl">
              Print-friendly 2-page flyer. Use “Print” to save as PDF.
            </p>
          </div>
          <Button
            type="button"
            className="bg-[#121212] text-[#D6A21E] hover:bg-black rounded-full px-8 py-5"
            onClick={() => window.print()}
          >
            Print / Save as PDF <ArrowRight className="ml-2" />
          </Button>
        </div>

        <div className="mt-10 academy-flyer3 space-y-10">
          <div className="overflow-x-auto pb-4">
            <main className="sheet" role="document" aria-label="Fulcrum Academy Apprenticeship Tracts Flyer Page 1">
              <section className="content">
                <header className="top">
                  <div>
                    <div className="kicker">
                      <span className="kdot" /> Fulcrum Academy • Overview
                    </div>
                    <h1>Apprenticeship Tracts</h1>
                    <p className="sub">
                      The Fulcrum Academy is a best-in-class professional apprenticeship designed to prepare{" "}
                      <strong>entrepreneurs</strong>, <strong>intrapreneurs</strong>, and{" "}
                      <strong>sales &amp; marketing professionals</strong> for high-impact, high-earning careers.
                    </p>
                  </div>

                  <div className="meta">
                    <div className="logo-chip" aria-label="Fulcrum logo">
                      <img className="logo-img" src="/brand/fulcrum-wordmark.png" alt="Fulcrum" />
                    </div>
                    <div className="pill">Applied • Performance-Based • Mentored</div>
                  </div>
                </header>

                <div className="stack-1">
                  <section className="card">
                    <div className="h2">
                      <h2>What Is the Fulcrum Academy?</h2>
                      <span className="tag">Not theory</span>
                    </div>

                    <p>
                      Founded by <strong>Reece Theriot, MBA</strong>, former sales, marketing, and entrepreneurship professor at
                      the University of Louisiana at Lafayette’s <strong>B.I. Moody III College of Business</strong>, the Academy
                      blends real-world execution, mentorship, and applied business development.
                    </p>
                    <p>
                      Reece helped create UL’s Entrepreneurship Minor curriculum and served as Head Coach of the UL Ragin’ Sales Team,
                      which consistently competed and placed at national sales competitions.
                    </p>

                    <div className="bar">This is not theory. It is applied, performance-based learning.</div>
                  </section>

                  <section className="card">
                    <div className="h2">
                      <h2>What You Will Learn</h2>
                      <span className="tag">Job-ready skills</span>
                    </div>

                    <ul>
                      <li><span className="icon" /><span className="li-text">Understand why sales and marketing drive organizational growth</span></li>
                      <li><span className="icon" /><span className="li-text">Speak the language of sales, marketing, and entrepreneurship</span></li>
                      <li><span className="icon" /><span className="li-text">Build and execute proactive outreach campaigns</span></li>
                      <li><span className="icon" /><span className="li-text">Research markets and create prospecting lists</span></li>
                      <li><span className="icon" /><span className="li-text">Conduct professional outbound outreach</span></li>
                      <li><span className="icon" /><span className="li-text">Use a CRM to manage relationships and opportunities</span></li>
                      <li><span className="icon" /><span className="li-text">Identify sales and marketing opportunities locally and nationally</span></li>
                    </ul>
                  </section>
                </div>

                <div className="page1-mark" aria-hidden="true">
                  <img src="/brand/fulcrum-mark.png" alt="" />
                </div>

                <footer className="contact" aria-label="Contact information">
                  <div className="contact-right">
                    <a className="citem" href="mailto:info@workwithfulcrum.com">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4z" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                      info@workwithfulcrum.com
                    </a>

                    <a className="citem" href="tel:+13373350046">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                      337-335-0046
                    </a>

                    <a className="citem" href="https://www.workwithfulcrum.com" target="_blank" rel="noopener noreferrer">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                        <path d="M2 12h20" />
                        <path d="M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22" />
                        <path d="M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
                      </svg>
                      workwithfulcrum.com
                    </a>

                    <span className="citem" style={{ cursor: "default" }}>
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                        <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                      108 Kol Dr, Broussard, LA
                    </span>
                  </div>
                </footer>
              </section>
            </main>
          </div>

          <div className="overflow-x-auto pb-4">
            <main className="sheet page-break" role="document" aria-label="Fulcrum Academy Apprenticeship Tracts Flyer Page 2">
              <section className="content tight">
                <header className="top">
                  <div>
                    <div className="kicker">
                      <span className="kdot" /> Fulcrum Academy • Tracts
                    </div>
                    <h1>Apprenticeship Tracts</h1>
                    <p className="sub">Each tract aligns to a specific career outcome. Choose your path — then earn advancement through results.</p>
                  </div>

                  <div className="meta">
                    <div className="pill">Page 2 of 2</div>
                    <div className="pill">Career Outcomes • Level Progression</div>
                  </div>
                </header>

                <div className="page2-stack">
                  <section className="card" aria-label="Tracts" style={{ padding: "10px 10px" }}>
                    <div className="h2" style={{ marginBottom: 7 }}>
                      <h2>Apprenticeship Tracts</h2>
                      <span className="tag">3 pathways</span>
                    </div>

                    <div className="tracts">
                      <article className="tract">
                        <div className="tract-head">
                          <div>
                            <p className="tract-title">Fulcrum Tract</p>
                            <div className="tract-path">Path to a full-time role at Fulcrum</div>
                          </div>
                          <div className="chiprow" aria-hidden="true">
                            <span className="chip">6–12 mo</span>
                            <span className="chip">Levels: 3</span>
                          </div>
                        </div>
                        <div className="kvs">
                          <div className="kv"><div className="k">Length</div><div className="v">6–12 mo</div></div>
                          <div className="kv"><div className="k">Levels</div><div className="v">3</div></div>
                          <div className="kv"><div className="k">Focus</div><div className="v">Outreach + marketing</div></div>
                        </div>
                        <div className="bestfor">
                          <div className="bfk">Best For</div>
                          <div className="bfv">Marketing-minded professionals, creatives, brand builders, and those who want agency experience and to stay local.</div>
                        </div>
                      </article>

                      <article className="tract">
                        <div className="tract-head">
                          <div>
                            <p className="tract-title">Client Tract</p>
                            <div className="tract-path">Path to a full-time role at a company</div>
                          </div>
                          <div className="chiprow" aria-hidden="true">
                            <span className="chip">3–6 mo</span>
                            <span className="chip">Levels: 1–3</span>
                          </div>
                        </div>
                        <div className="kvs">
                          <div className="kv"><div className="k">Length</div><div className="v">3–6 mo</div></div>
                          <div className="kv"><div className="k">Levels</div><div className="v">1–3</div></div>
                          <div className="kv"><div className="k">Focus</div><div className="v">Pipeline dev</div></div>
                        </div>
                        <div className="bestfor">
                          <div className="bfk">Best For</div>
                          <div className="bfv">Those seeking stable, enterprise-level careers with one company, including relocation opportunities.</div>
                        </div>
                      </article>

                      <article className="tract">
                        <div className="tract-head">
                          <div>
                            <p className="tract-title">M&amp;A Tract (Scoutly)</p>
                            <div className="tract-path">Path to a role in Fulcrum’s M&amp;A division</div>
                          </div>
                          <div className="chiprow" aria-hidden="true">
                            <span className="chip">3–6 mo</span>
                            <span className="chip">Levels: 2</span>
                          </div>
                        </div>
                        <div className="kvs">
                          <div className="kv"><div className="k">Length</div><div className="v">3–6 mo</div></div>
                          <div className="kv"><div className="k">Levels</div><div className="v">2</div></div>
                          <div className="kv"><div className="k">Focus</div><div className="v">Buyer–seller sourcing</div></div>
                        </div>
                        <div className="bestfor">
                          <div className="bfk">Best For</div>
                          <div className="bfv">Those pursuing high upside, autonomy, and entry into private equity and M&amp;A.</div>
                        </div>
                      </article>
                    </div>
                  </section>

                  <section className="card" aria-label="Expectations & Outcomes" style={{ padding: "10px 10px" }}>
                    <div className="h2" style={{ marginBottom: 7 }}>
                      <h2>Expectations &amp; Outcomes</h2>
                      <span className="tag">Proving ground</span>
                    </div>

                    <ul style={{ marginTop: 0 }}>
                      <li><span className="icon" /><span className="li-text">3–8 hours per week; 12–25 hours per month</span></li>
                      <li><span className="icon" /><span className="li-text">Weekly execution benchmarks</span></li>
                      <li><span className="icon" /><span className="li-text">Training, coaching, and performance reviews</span></li>
                      <li><span className="icon" /><span className="li-text">Level progression earned by results</span></li>
                      <li><span className="icon" /><span className="li-text">Placement opportunities for top performers</span></li>
                    </ul>

                    <div className="bar" style={{ marginTop: 7 }}>This is a proving ground—not a classroom.</div>
                  </section>
                </div>

                <footer className="contact" aria-label="Contact information">
                  <div className="contact-right">
                    <a className="citem" href="mailto:info@workwithfulcrum.com">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6h16v12H4z" />
                        <path d="M4 7l8 6 8-6" />
                      </svg>
                      info@workwithfulcrum.com
                    </a>

                    <a className="citem" href="tel:+13373350046">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.06a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                      337-335-0046
                    </a>

                    <a className="citem" href="https://www.workwithfulcrum.com" target="_blank" rel="noopener noreferrer">
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                        <path d="M2 12h20" />
                        <path d="M12 2c3 3.5 4.5 7 4.5 10S15 18.5 12 22" />
                        <path d="M12 2C9 5.5 7.5 9 7.5 12S9 18.5 12 22" />
                      </svg>
                      workwithfulcrum.com
                    </a>

                    <span className="citem" style={{ cursor: "default" }}>
                      <svg className="cicon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
                        <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                      </svg>
                      108 Kol Dr, Broussard, LA
                    </span>
                  </div>
                </footer>
              </section>
            </main>
          </div>
        </div>

        <style>{`
          .academy-flyer3{
            --ink:#0b0f14;
            --muted:#5b6676;
            --paper:#ffffff;
            --gold:#f2b705;
            --goldSoft: rgba(242,183,5,.12);
            --goldLine: rgba(242,183,5,.28);
            --line:#e6edf6;
            --shadow: 0 16px 38px rgba(11,15,20,.12);
            --shadow2: 0 10px 22px rgba(11,15,20,.08);
          }
          @page { size: 8.5in 11in; margin: 0.5in; }
          .academy-flyer3, .academy-flyer3 *{
            box-sizing:border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .academy-flyer3 .sheet{
            width: 8.5in;
            height: 11in;
            margin: 0 auto;
            border-radius: 18px;
            box-shadow: var(--shadow);
            overflow: hidden;
            position: relative;
            background:
              linear-gradient(120deg, rgba(242,183,5,.28) 0%, rgba(242,183,5,0) 46%) top left / 600px 600px no-repeat,
              radial-gradient(620px 440px at 100% 0%, rgba(11,15,20,.13), transparent 64%),
              radial-gradient(980px 620px at 70% 6%, rgba(242,183,5,.18), transparent 66%),
              linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
          }
          .academy-flyer3 .sheet::before{
            content:"";
            position:absolute;
            inset: 12px;
            border-radius: 16px;
            border: 2px solid rgba(11,15,20,.14);
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,.62),
              0 1px 0 rgba(255,255,255,.35);
            pointer-events:none;
            z-index:0;
          }

          .academy-flyer3 .content{
            position:relative;
            z-index: 1;
            height: 100%;
            padding: 0.40in 0.50in 0.32in;
            display:flex;
            flex-direction:column;
            gap: 12px;
          }

          .academy-flyer3 .top{
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--line);
            position: relative;
          }
          .academy-flyer3 .top::after{
            content:"";
            position:absolute;
            left:0;
            right:0;
            bottom:-1px;
            height: 2px;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(242,183,5,0), rgba(242,183,5,.35), rgba(242,183,5,0));
            opacity: .65;
            pointer-events:none;
          }

          .academy-flyer3 .kicker{
            display:inline-flex;
            align-items:center;
            gap: 10px;
            font-size: 12px;
            letter-spacing: .20em;
            text-transform: uppercase;
            color: var(--muted);
          }
          .academy-flyer3 .kdot{
            width: 10px;
            height: 10px;
            border-radius: 3px;
            background: var(--gold);
            box-shadow: 0 0 0 3px rgba(242,183,5,.16);
            flex: 0 0 10px;
          }

          .academy-flyer3 h1{
            margin: 8px 0 6px;
            font-size: 30px;
            line-height: 1.08;
            letter-spacing: -0.4px;
          }
          .academy-flyer3 .sub{
            margin:0;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.48;
            max-width: 92ch;
          }

          .academy-flyer3 .meta{
            display:flex;
            flex-direction:column;
            align-items:flex-end;
            gap: 8px;
            min-width: 250px;
          }
          .academy-flyer3 .pill{
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding: 7px 10px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: rgba(255,255,255,.92);
            color: var(--muted);
            font-size: 12px;
            white-space: nowrap;
            box-shadow: var(--shadow2);
            backdrop-filter: blur(4px);
          }

          .academy-flyer3 .logo-chip{
            width: 250px;
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 10px 12px;
            background: rgba(255,255,255,.92);
            box-shadow: var(--shadow2);
            backdrop-filter: blur(4px);
          }
          .academy-flyer3 .logo-img{
            display:block;
            width:100%;
            height:auto;
            opacity:.98;
            filter: contrast(1.25) brightness(0.9);
          }

          .academy-flyer3 .card{
            border: 1px solid var(--line);
            background: rgba(255,255,255,.92);
            border-radius: 18px;
            padding: 14px 14px;
            box-shadow: var(--shadow2);
            backdrop-filter: blur(6px);
            position: relative;
          }
          .academy-flyer3 .card::before{
            content:"";
            position:absolute;
            left: 14px;
            right: 14px;
            top: 12px;
            height: 3px;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(242,183,5,0), rgba(242,183,5,.28), rgba(242,183,5,0));
            opacity: .45;
            pointer-events:none;
          }
          .academy-flyer3 .card p{
            margin:0;
            font-size: 14px;
            line-height: 1.52;
            color: var(--ink);
          }
          .academy-flyer3 .card p + p{ margin-top: 8px; }

          .academy-flyer3 .h2{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 12px;
            margin: 0 0 10px;
          }
          .academy-flyer3 .h2 h2{
            margin:0;
            font-size: 14px;
            letter-spacing: .18em;
            text-transform: uppercase;
            color: var(--ink);
          }
          .academy-flyer3 .tag{
            font-size: 11.5px;
            color: var(--muted);
            border: 1px solid rgba(242,183,5,.22);
            background: rgba(242,183,5,.10);
            padding: 6px 10px;
            border-radius: 999px;
            box-shadow: var(--shadow2);
            white-space: nowrap;
            backdrop-filter: blur(4px);
          }

          .academy-flyer3 ul{
            margin: 10px 0 0;
            padding: 0;
            list-style: none;
            display:grid;
            gap: 8px;
          }
          .academy-flyer3 li{
            display:flex;
            gap: 10px;
            align-items:flex-start;
            padding: 9px 10px;
            border-radius: 16px;
            background: rgba(246,248,252,.94);
            border: 1px solid #e9effa;
            backdrop-filter: blur(4px);
          }
          .academy-flyer3 .icon{
            width: 18px;
            height: 18px;
            flex: 0 0 18px;
            margin-top: 2px;
            border-radius: 6px;
            background: rgba(242,183,5,.22);
            border: 1px solid rgba(242,183,5,.55);
            position: relative;
          }
          .academy-flyer3 .icon::after{
            content:"";
            position:absolute;
            left: 6px;
            top: 3px;
            width: 6px;
            height: 10px;
            border: solid var(--ink);
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: .9;
          }
          .academy-flyer3 .li-text{
            font-size: 13.8px;
            line-height: 1.42;
            color: var(--ink);
          }

          .academy-flyer3 .bar{
            margin-top: 10px;
            border-radius: 14px;
            padding: 10px 12px;
            background: linear-gradient(90deg, rgba(242,183,5,.22), rgba(242,183,5,.06));
            border: 1px solid rgba(242,183,5,.35);
            font-weight: 650;
            font-size: 13.5px;
          }

          .academy-flyer3 .stack-1{ display:grid; gap: 12px; }

          .academy-flyer3 .page1-mark{
            position:absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 96px;
            z-index: 0;
            pointer-events:none;
            width: 1.22in;
          }
          .academy-flyer3 .page1-mark img{
            display:block;
            width:100%;
            height:auto;
            opacity: .085;
            filter: saturate(1.05) brightness(.85) contrast(1.08);
            mix-blend-mode: normal;
          }

          .academy-flyer3 .top, .academy-flyer3 .stack-1, .academy-flyer3 .contact{
            position: relative;
            z-index: 1;
          }

          .academy-flyer3 .contact{
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px dashed var(--line);
            display:flex;
            align-items:flex-start;
            justify-content:flex-end;
            color: var(--muted);
          }
          .academy-flyer3 .contact-right{
            width: 100%;
            display:flex;
            justify-content: space-between;
            align-items:center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .academy-flyer3 .citem{
            display:flex;
            align-items:center;
            gap: 6px;
            padding: 5px 7px;
            border-radius: 999px;
            border: 1px solid var(--line);
            background: rgba(255,255,255,.92);
            box-shadow: var(--shadow2);
            font-size: 11px;
            color: var(--muted);
            text-decoration: none;
            white-space: nowrap;
            flex: 1 1 160px;
            justify-content: center;
            text-align:center;
            backdrop-filter: blur(4px);
          }
          .academy-flyer3 .cicon{
            width: 14px;
            height: 14px;
            flex: 0 0 14px;
            fill: none;
            stroke: var(--ink);
            stroke-width: 1.8;
            opacity: .9;
          }

          .academy-flyer3 .page-break{ page-break-before: always; break-before: page; }

          .academy-flyer3 .content.tight{
            padding: 0.30in 0.42in 0.20in;
            gap: 8px;
          }
          .academy-flyer3 .content.tight .top{ padding-bottom: 7px; }
          .academy-flyer3 .content.tight h1{
            font-size: 25px;
            margin: 6px 0 3px;
            line-height: 1.06;
          }
          .academy-flyer3 .content.tight .sub{
            font-size: 12.8px;
            line-height: 1.32;
          }
          .academy-flyer3 .content.tight .pill{
            font-size: 11px;
            padding: 6px 9px;
          }
          .academy-flyer3 .content.tight .card{
            padding: 10px 10px;
            border-radius: 16px;
          }
          .academy-flyer3 .content.tight .h2{ margin-bottom: 7px; }
          .academy-flyer3 .content.tight .h2 h2{ font-size: 12.4px; }
          .academy-flyer3 .content.tight .tag{
            font-size: 10.8px;
            padding: 5px 9px;
          }
          .academy-flyer3 .content.tight ul{
            gap: 6px;
            margin-top: 6px;
          }
          .academy-flyer3 .content.tight li{
            padding: 7px 8px;
            border-radius: 14px;
          }
          .academy-flyer3 .content.tight .li-text{
            font-size: 12.1px;
            line-height: 1.28;
          }
          .academy-flyer3 .content.tight .icon{
            width: 16px;
            height: 16px;
            flex: 0 0 16px;
            margin-top: 2px;
            border-radius: 5px;
          }
          .academy-flyer3 .content.tight .icon::after{
            left: 5px;
            top: 2px;
            width: 5px;
            height: 8px;
          }

          .academy-flyer3 .page2-stack{ display:grid; gap: 8px; }
          .academy-flyer3 .tracts{ display:grid; gap: 6px; }
          .academy-flyer3 .tract{
            border: 1px solid var(--line);
            background: rgba(255,255,255,.92);
            border-radius: 14px;
            padding: 8px 8px;
            box-shadow: var(--shadow2);
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .academy-flyer3 .tract-head{
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap: 10px;
            margin-bottom: 6px;
          }
          .academy-flyer3 .tract-title{
            margin:0;
            font-size: 13.2px;
            line-height: 1.14;
            font-weight: 860;
            letter-spacing: -0.15px;
          }
          .academy-flyer3 .tract-path{
            font-size: 10.9px;
            color: var(--muted);
            line-height: 1.22;
            margin-top: 3px;
          }
          .academy-flyer3 .chiprow{
            display:flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content:flex-end;
          }
          .academy-flyer3 .chip{
            font-size: 10.1px;
            color: var(--muted);
            border: 1px solid rgba(242,183,5,.22);
            background: rgba(242,183,5,.08);
            padding: 4px 7px;
            border-radius: 999px;
            white-space: nowrap;
          }
          .academy-flyer3 .kvs{
            display:grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            margin-top: 5px;
          }
          .academy-flyer3 .kv{
            border: 1px solid #e9effa;
            background: rgba(246,248,252,.95);
            border-radius: 11px;
            padding: 5px 6px;
          }
          .academy-flyer3 .kv .k{
            font-size: 9.6px;
            letter-spacing: .18em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 3px;
          }
          .academy-flyer3 .kv .v{
            font-size: 11.2px;
            font-weight: 760;
            line-height: 1.14;
            color: var(--ink);
          }
          .academy-flyer3 .bestfor{
            margin-top: 6px;
            border: 1px dashed #dfe7f4;
            background: rgba(255,255,255,.70);
            border-radius: 11px;
            padding: 6px 7px;
          }
          .academy-flyer3 .bestfor .bfk{
            font-size: 10px;
            letter-spacing: .18em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 4px;
          }
          .academy-flyer3 .bestfor .bfv{
            font-size: 11.6px;
            line-height: 1.24;
            color: var(--ink);
          }

          .academy-flyer3 .content.tight .bar{
            font-size: 11.8px;
            padding: 7px 9px;
            margin-top: 7px;
            border-radius: 12px;
          }
          .academy-flyer3 .content.tight .contact{ padding-top: 7px; }
          .academy-flyer3 .content.tight .contact-right{ gap: 8px; }
          .academy-flyer3 .content.tight .citem{
            font-size: 10.4px;
            padding: 4px 6px;
            flex: 1 1 150px;
          }
          .academy-flyer3 .content.tight .cicon{
            width: 13px;
            height: 13px;
            flex: 0 0 13px;
          }

          @media print{
            .academy-flyer3 .sheet{
              margin:0;
              border-radius:0;
              box-shadow:none;
            }
          }
        `}</style>
      </div>
    </section>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    (async () => {
      try {
        await submitNetlifyUrlEncoded(NETLIFY_FORM_CONSULTATION, {
          "bot-field": "",
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          website: form.website,
          service: form.service,
          budget: form.budget,
          timeline: form.timeline,
          goals: form.goals,
          consent: form.consent ? "yes" : "no",
          sourceUrl: typeof window !== "undefined" ? window.location.href : "",
        });
        setSubmitted(true);
      } catch (err) {
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    })();
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
        <form
          name="consultation-request"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="form-name" value="consultation-request" />
          <p className="hidden">
            <label>
              Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name" required>
              <input
                name="name"
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.name}
                onChange={update("name")}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" required>
              <input
                name="email"
                type="email"
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.email}
                onChange={update("email")}
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Phone">
              <input
                name="phone"
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.phone}
                onChange={update("phone")}
                placeholder="(555) 555-5555"
              />
            </Field>
            <Field label="Company">
              <input
                name="company"
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.company}
                onChange={update("company")}
                placeholder="Company name"
              />
            </Field>
            <Field label="Website">
              <input
                name="website"
                className="w-full border border-black/10 rounded-xl p-4"
                value={form.website}
                onChange={update("website")}
                placeholder="https://"
              />
            </Field>
            <Field label="Service interest">
              <select
                name="service"
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
                name="budget"
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
                name="timeline"
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
              name="goals"
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
              name="consent"
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
                canSubmit && !loading
                  ? "bg-[#D6A21E] text-black hover:bg-[#B88A16]"
                  : "bg-black/10 text-black/40 cursor-not-allowed hover:bg-black/10"
              )}
              disabled={!canSubmit || loading}
            >
              {loading ? "Submitting…" : "Request my free consultation"}
            </Button>
            <Link to="/about">
              <Button className="rounded-full px-10 py-6 text-lg bg-[#121212] text-[#D6A21E] hover:bg-black">
                Contact info
              </Button>
            </Link>
          </div>

          {error ? <p className="text-xs text-red-700">{error}</p> : null}

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
    img: "/apprentices/keijae.png",
  },
  {
    name: "Aaron Simon",
    role: "Project Manager",
    img: "/apprentices/aaron.png",
  },
  {
    name: "Jacob McCullars",
    role: "Brand Ambassador",
    img: "/apprentices/jacob.png",
  },
  {
    name: "Christian Merrick",
    role: "Project Manager",
    img: "/apprentices/christian.png",
  },
  {
    name: "Joshua Cooper",
    role: "Apprentice",
    img: "",
  },
  {
    name: "Kirstianna Bounds",
    role: "Apprentice",
    img: "",
  },
  {
    name: "Timyra Wilson",
    role: "Apprentice",
    img: "/apprentices/timyra-wilson-v2.png",
  },
  {
    name: "Tobin Thevenot",
    role: "Apprentice",
    img: "/apprentices/tobin-thevenot.png",
  },
  {
    name: "Emanuel Thomas",
    role: "Project Manager",
    img: "",
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
              <Card className="rounded-3xl border border-black/10 bg-white/80 overflow-hidden shadow-sm">
                <div className="h-56 bg-[#F3EFE6] relative overflow-hidden">
                  {/* premium frame */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                    <div className="absolute -top-14 -right-14 h-40 w-40 rounded-[44px] bg-[#D6A21E]/12 rotate-12 blur-[30px]" />
                    <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-[48px] bg-black/5 -rotate-12 blur-[34px]" />
                  </div>
                  {a.img ? (
                    <img
                      src={a.img}
                      alt={a.name}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: a.objectPosition || "50% 50%",
                        transform: a.imgTransform || undefined,
                        transformOrigin: a.imgTransform ? "50% 30%" : undefined,
                      }}
                      loading="lazy"
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = e.currentTarget.parentElement?.querySelector("[data-fallback]");
                        if (fb) fb.style.display = "grid";
                      }}
                    />
                  ) : null}
                  {a.maskBottomLeft ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 bottom-0 h-44 w-56"
                      style={{
                        background:
                          "radial-gradient(240px 220px at 0% 100%, rgba(243,239,230,1) 0%, rgba(243,239,230,1) 70%, rgba(243,239,230,0) 78%)",
                      }}
                    />
                  ) : null}
                  <div
                    data-fallback
                    style={{ display: a.img ? "none" : "grid" }}
                    className="absolute inset-0 grid place-items-center"
                  >
                    <div className="h-full w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#1b1b1b] to-[#D6A21E]/35" />
                      <div className="absolute inset-0 pointer-events-none">
                        <img
                          src="/fulcrum-logo.jpg"
                          alt=""
                          aria-hidden="true"
                          className="absolute left-1/2 top-1/2 w-[340px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
                          style={{ filter: "grayscale(1) contrast(1.05)" }}
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-[48px] bg-white/10 rotate-12 blur-[1px]" />
                      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-[56px] bg-black/10 -rotate-12 blur-[2px]" />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="h-24 w-24 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm grid place-items-center shadow-sm">
                          <span className="text-2xl font-black tracking-tight text-white">
                            {(a.name || "")
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((w) => w[0]?.toUpperCase())
                              .join("")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent
                  className="p-5 relative"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(243,239,230,0.65) 100%)",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background:radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:22px_22px]" />
                  <div className="relative">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D6A21E]/55 to-transparent" />
                    <h4 className="font-black mt-3">{a.name}</h4>
                    <p className="text-sm text-black/60 mt-1">{a.role}</p>
                  </div>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    resume: null,
    why: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.why.trim() &&
      !!form.resume
    );
  }, [form]);

  function update(key) {
    return (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function onResumeChange(e) {
    const file = e.target.files?.[0] || null;
    setForm((p) => ({ ...p, resume: file }));
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const fd = new FormData();
        fd.append("bot-field", "");
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("phone", form.phone);
        fd.append("status", form.status);
        fd.append("why", form.why);
        if (form.resume) fd.append("resume", form.resume);
        fd.append("sourceUrl", typeof window !== "undefined" ? window.location.href : "");

        await submitNetlifyMultipart(NETLIFY_FORM_ACADEMY, fd);
        setSubmitted(true);
      } catch (err) {
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    })();
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
        <form
          name="academy-application"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          encType="multipart/form-data"
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <input type="hidden" name="form-name" value="academy-application" />
          <p className="hidden">
            <label>
              Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name" required>
              <input
                name="name"
                className="w-full border border-black/10 rounded-xl p-4"
                placeholder="Your name"
                value={form.name}
                onChange={update("name")}
              />
            </Field>
            <Field label="Email" required>
              <input
                name="email"
                type="email"
                className="w-full border border-black/10 rounded-xl p-4"
                placeholder="you@email.com"
                value={form.email}
                onChange={update("email")}
              />
            </Field>
            <Field label="Phone" required>
              <input
                name="phone"
                className="w-full border border-black/10 rounded-xl p-4"
                placeholder="(555) 555-5555"
                value={form.phone}
                onChange={update("phone")}
              />
            </Field>
            <Field label="Current status">
              <select
                name="status"
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

          <Field label="Upload resume" required>
            <div className="rounded-2xl border border-black/10 bg-[#F3EFE6] p-5">
              <input
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onResumeChange}
                className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#121212] file:text-[#D6A21E] file:px-6 file:py-3 file:font-semibold hover:file:bg-black"
              />
              <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-black/60">
                  PDF or Word document.
                </p>
                <p className="text-xs font-semibold text-black/70">
                  {form.resume ? form.resume.name : "No file selected"}
                </p>
              </div>
            </div>
          </Field>

          <Field label="Why do you want to join Fulcrum Academy?" required>
            <textarea
              name="why"
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
              canSubmit && !loading
                ? "bg-[#D6A21E] text-black hover:bg-[#B88A16]"
                : "bg-black/10 text-black/40 cursor-not-allowed hover:bg-black/10"
            )}
            disabled={!canSubmit || loading}
          >
            {loading ? "Submitting…" : "Submit application"}
          </Button>

          {error ? (
            <p className="text-xs text-red-700 text-center">{error}</p>
          ) : null}

          {!canSubmit && (
            <p className="text-xs text-black/55 text-center">
              Fill out name, email, phone, resume, and your “why” to submit.
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
