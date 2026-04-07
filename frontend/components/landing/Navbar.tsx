"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap, Menu, X, ChevronDown,
  Users, BookOpen, Brain, FileText,
  MessageSquare, Newspaper, CreditCard,
  ArrowRight, Sparkles, Video,
} from "lucide-react";

const NAVY = "#293C7C";
const GOLD = "#C7984F";

/* ── Dropdown item type ──────────────────────────────────────── */
interface DropItem {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  badge?: string;
}

/* ── Platform dropdown items ─────────────────────────────────── */
const platformItems: DropItem[] = [
  {
    href: "/tutors",
    icon: Users,
    label: "Find a Tutor",
    desc: "Browse verified tutors by subject, level and rating",
  },
  {
    href: "/lessons",
    icon: Video,
    label: "Recorded Lessons",
    desc: "HD lessons from expert tutors, watch anytime",
  },
  {
    href: "/auth/register",
    icon: Brain,
    label: "AI Teacher",
    desc: "24/7 personalised AI tutoring for any topic",
    badge: "New",
  },
  {
    href: "/auth/register",
    icon: FileText,
    label: "Resource Marketplace",
    desc: "Notes, past papers, quizzes and flashcard decks",
  },
];

/* ── Top-level links ─────────────────────────────────────────── */
interface TopLink {
  label: string;
  href?: string;
  dropdown?: DropItem[];
}

const topLinks: TopLink[] = [
  { label: "Platform", dropdown: platformItems },
  { label: "Community",  href: "/auth/register" },
  { label: "Blog",       href: "/blog"           },
  { label: "Pricing",    href: "/#pricing"       },
];

/* ── Dropdown panel ──────────────────────────────────────────── */
function DropdownPanel({
  items,
  visible,
}: {
  items: DropItem[];
  visible: boolean;
}) {
  return (
    <div
      className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[520px] transition-all duration-200 pointer-events-none ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Arrow */}
      <div className="flex justify-center mb-1">
        <div
          className="w-3 h-3 rotate-45 border-l border-t border-gray-200 bg-white"
          style={{ marginBottom: "-7px" }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-900/10 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            The Platform
          </span>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 gap-1 p-3">
          {items.map(({ href, icon: Icon, label, desc, badge }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-150"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-150 group-hover:scale-110"
                style={{ background: `${NAVY}12` }}
              >
                <Icon className="w-4 h-4" style={{ color: NAVY }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{label}</span>
                  {badge && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: GOLD }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div
          className="mx-3 mb-3 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{ background: `${NAVY}08` }}
        >
          <div>
            <p className="text-xs font-bold text-gray-700">New to EduBridge?</p>
            <p className="text-[11px] text-gray-400">Start your free account in 60 seconds</p>
          </div>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: NAVY }}
          >
            Get Started <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile drawer link ──────────────────────────────────────── */
function MobileNavItem({
  link,
  onClose,
}: {
  link: TopLink;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (link.dropdown) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          {link.label}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96" : "max-h-0"}`}
        >
          <div className="pl-4 pb-2 space-y-0.5">
            {link.dropdown.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: NAVY }} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={link.href!}
      onClick={onClose}
      className="flex items-center justify-between py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
    >
      {link.label}
      <ChevronDown className="w-4 h-4 -rotate-90 text-gray-300" />
    </Link>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close mobile on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* hover helpers with delay so cursor can move into panel */
  const handleEnter = (label: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActiveDropdown(label);
  };
  const handleLeave = () => {
    hideTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  /* on dark hero = transparent; after scroll = white */
  const isDark = !scrolled;

  return (
    <>
      {/* ─── Fixed wrapper ──────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav
          className={`transition-all duration-300 ${
            scrolled
              ? "bg-white/96 backdrop-blur-md border-b border-gray-200/70 shadow-sm shadow-gray-900/5"
              : "bg-transparent border-b border-white/8"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* ── Logo ─────────────────────────────────── */}
              <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105"
                  style={{ background: NAVY }}
                >
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-[1.2rem] font-extrabold tracking-tight transition-colors duration-300 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Edu
                  <span style={{ color: isDark ? GOLD : NAVY }}>Bridge</span>
                  <span style={{ color: GOLD }}>.</span>
                </span>
              </Link>

              {/* ── Desktop links ─────────────────────────── */}
              <div
                ref={dropdownRef}
                className="hidden lg:flex items-center gap-0.5"
              >
                {topLinks.map((link) => (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => link.dropdown && handleEnter(link.label)}
                    onMouseLeave={() => link.dropdown && handleLeave()}
                  >
                    {link.dropdown ? (
                      <button
                        className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isDark
                            ? "text-white/80 hover:text-white hover:bg-white/10"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                        aria-expanded={activeDropdown === link.label}
                      >
                        {link.label}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            activeDropdown === link.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={link.href!}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isDark
                            ? "text-white/80 hover:text-white hover:bg-white/10"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        } ${pathname === link.href ? "font-semibold" : ""}`}
                      >
                        {link.label}
                      </Link>
                    )}

                    {/* Dropdown panel */}
                    {link.dropdown && (
                      <DropdownPanel
                        items={link.dropdown}
                        visible={activeDropdown === link.label}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ── Desktop auth CTAs ─────────────────────── */}
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150 ${
                    isDark
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Log In
                </Link>

                {/* Divider */}
                <div
                  className={`w-px h-5 mx-1 ${isDark ? "bg-white/15" : "bg-gray-200"}`}
                />

                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-150 hover:opacity-90 hover:shadow-xl hover:scale-[1.02]"
                  style={{ background: GOLD, boxShadow: `0 4px 16px ${GOLD}44` }}
                >
                  Get Started Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* ── Mobile toggle ─────────────────────────── */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2.5 rounded-xl transition-colors duration-150 ${
                  isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── Mobile drawer ──────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 lg:hidden flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900">
              Edu<span style={{ color: NAVY }}>Bridge</span>
              <span style={{ color: GOLD }}>.</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {topLinks.map((link) => (
            <MobileNavItem
              key={link.label}
              link={link}
              onClose={() => setMobileOpen(false)}
            />
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-gray-100" />

          {/* Extra page links */}
          {[
            { label: "Find a Tutor",  href: "/tutors",          icon: Users       },
            { label: "Browse Lessons", href: "/lessons",         icon: BookOpen    },
            { label: "Blog",           href: "/blog",            icon: Newspaper   },
            { label: "Community",      href: "/auth/register",   icon: MessageSquare },
            { label: "Pricing",        href: "/#pricing",        icon: CreditCard  },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: NAVY }} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer — auth */}
        <div className="px-4 pb-6 pt-3 border-t border-gray-100 space-y-2.5">
          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold border-2 text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#e5e7eb" }}
          >
            Log In
          </Link>
          <Link
            href="/auth/register"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
            style={{ background: GOLD }}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-center text-[11px] text-gray-400 pt-1">
            No credit card required · Free plan available
          </p>
        </div>
      </div>
    </>
  );
}
