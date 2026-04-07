"use client";

import Link from "next/link";
import {
  ArrowRight, Brain, BookOpen, Clock,
  Star, Trophy, Users, Zap, TrendingUp,
  LayoutDashboard, FileText, Play,
} from "lucide-react";

const NAVY    = "#293C7C";
const GOLD    = "#C7984F";
const TEAL    = "#024944";
const CRIMSON = "#812B4A";

/* ─── Browser-frame dashboard mockup ──────────────────────────── */
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Glow under the card */}
      <div
        className="absolute -inset-4 rounded-3xl blur-3xl opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}88, transparent 70%)` }}
      />

      {/* Browser chrome */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/10">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10" style={{ background: "#1a2555" }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-white/8 rounded-lg px-4 py-1.5 text-[11px] text-white/40 font-mono">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              edubridgelearn.com/dashboard
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="flex" style={{ background: "#f4f5f9", minHeight: "360px" }}>

          {/* Sidebar */}
          <div className="w-44 shrink-0 border-r border-gray-200 py-4 px-3 hidden sm:flex flex-col" style={{ background: "white" }}>
            {/* Logo */}
            <div className="flex items-center gap-2 px-2 mb-5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold" style={{ color: NAVY }}>EduBridge</span>
            </div>

            {/* Nav items */}
            {[
              { icon: LayoutDashboard, label: "Overview", active: true },
              { icon: Users,           label: "Find a Tutor", active: false },
              { icon: Clock,           label: "My Sessions", active: false },
              { icon: Brain,           label: "AI Teacher", active: false },
              { icon: FileText,        label: "Resources", active: false },
              { icon: Trophy,          label: "Progress", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-semibold mb-0.5"
                style={{
                  background: active ? NAVY : "transparent",
                  color: active ? "white" : "#6b7280",
                }}
              >
                <Icon className="w-3 h-3 shrink-0" />
                {label}
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* Greeting + date */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-800">Welcome back, Achieng! 👋</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Sunday, 6 April 2026</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: NAVY }}>A</div>
                <span className="text-[10px] font-semibold text-gray-600 hidden md:block">Student</span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {[
                { label: "Sessions",    value: "12",    icon: Clock,       color: NAVY   },
                { label: "Hours",       value: "24h",   icon: TrendingUp,  color: TEAL   },
                { label: "Resources",   value: "45",    icon: FileText,    color: CRIMSON },
                { label: "Achievements",value: "7",     icon: Trophy,      color: GOLD   },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
                  <div className="w-6 h-6 rounded-lg mb-2 flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon className="w-3 h-3" style={{ color }} />
                  </div>
                  <p className="text-sm font-extrabold text-gray-800 leading-none">{value}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Bottom 2 columns */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Upcoming session */}
              <div className="rounded-xl p-3 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, #1e2d5e)` }}>
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/5" />
                <p className="text-[9px] font-semibold opacity-60 mb-1.5 uppercase tracking-wide">Next Session · 3:00 PM</p>
                <p className="text-xs font-bold leading-snug mb-2">Mathematics — Quadratic Equations</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2 h-2" style={{ fill: GOLD, color: GOLD }} />
                    ))}
                    <span className="text-[8px] opacity-50 ml-1">J. Mwangi</span>
                  </div>
                  <button className="flex items-center gap-1 text-white rounded-lg px-2 py-1 text-[9px] font-bold" style={{ background: GOLD }}>
                    <Play className="w-2 h-2" /> Join
                  </button>
                </div>
              </div>

              {/* AI teacher preview */}
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                    <Brain className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-700">AI Teacher</span>
                  <span className="ml-auto text-[8px] font-semibold text-green-500 flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg rounded-tl-none px-2 py-1.5 text-[9px] text-gray-500 w-fit max-w-[85%]">
                    "Explain photosynthesis"
                  </div>
                  <div className="rounded-lg rounded-tr-none px-2 py-1.5 text-[9px] text-white ml-auto max-w-[90%]" style={{ background: TEAL }}>
                    "Photosynthesis converts light energy into glucose using CO₂ and H₂O..."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat pill ────────────────────────────────────────────────── */
function StatPill({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-lg font-extrabold text-white leading-none">{value}</p>
        <p className="text-[11px] text-white/50 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: NAVY }}>

      {/* Background texture — faint dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gold glow — top right */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}30 0%, transparent 70%)` }}
      />
      {/* Teal glow — bottom left */}
      <div
        className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${TEAL}40 0%, transparent 70%)` }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Text block (centered) ──────────────────────── */}
        <div className="pt-28 pb-14 lg:pt-36 lg:pb-16 text-center max-w-4xl mx-auto">

          {/* Top badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold mb-8 border"
            style={{
              background: `${GOLD}20`,
              borderColor: `${GOLD}50`,
              color: GOLD,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GOLD }} />
            Trusted by 10,000+ learners across Africa &nbsp;·&nbsp; CBC, A-Level, AP & IB
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06] mb-6">
            Unlock Your Full{" "}
            <span className="relative inline-block">
              <span style={{ color: GOLD }}>Learning Potential</span>
              {/* Underline squiggle */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 10"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 Q75 1 150 7 Q225 13 298 7"
                  stroke={GOLD}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto mb-10">
            Expert tutors, AI-powered personalized lessons, and a global learning community —
            all in one platform built for every curriculum and every learner.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/auth/register">
              <button
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-2xl transition-all hover:opacity-90 hover:scale-[1.02] group"
                style={{ background: GOLD, boxShadow: `0 8px 32px ${GOLD}55` }}
              >
                Start Learning — It&apos;s Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/auth/register?role=tutor">
              <button
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base border-2 text-white transition-all hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.25)" }}
              >
                <Users className="w-5 h-5 opacity-70" />
                Become a Tutor
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatPill value="500+" label="Expert Tutors"      icon={Users}   />
            <StatPill value="50K+" label="Lessons Completed"  icon={BookOpen} />
            <StatPill value="4.9★" label="Average Rating"     icon={Star}    />
            <StatPill value="12+"  label="Curricula Supported" icon={Zap}    />
          </div>
        </div>

        {/* ── Dashboard mockup ───────────────────────────── */}
        <div className="pb-0 px-2 sm:px-4">
          <DashboardMockup />
        </div>
      </div>

      {/* Wave / angle cut into the next section */}
      <div className="relative h-16 mt-0">
        <svg
          viewBox="0 0 1440 64"
          className="absolute bottom-0 left-0 w-full"
          preserveAspectRatio="none"
          fill="white"
        >
          <path d="M0,64 L0,32 Q360,0 720,32 Q1080,64 1440,32 L1440,64 Z" />
        </svg>
      </div>
    </section>
  );
}
