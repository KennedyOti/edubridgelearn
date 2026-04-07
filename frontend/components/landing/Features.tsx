"use client";

import { useEffect, useRef, useState } from "react";
import {
  Video, Brain, BookOpen, Users,
  Award, ShieldCheck, Globe, Zap,
  ArrowRight, Sparkles,
} from "lucide-react";

const NAVY    = "#293C7C";
const GOLD    = "#C7984F";
const TEAL    = "#024944";
const CRIMSON = "#812B4A";

/* ── Animated icon wrapper ─────────────────────────────────────── */
function AnimatedIcon({
  icon: Icon,
  animation,
  color,
}: {
  icon: React.ElementType;
  animation: "spin-slow" | "pulse-scale" | "bounce-y" | "wiggle" | "ping-dot" | "orbit";
  color: string;
}) {
  const animations: Record<string, string> = {
    "spin-slow":    "animate-[spin_8s_linear_infinite]",
    "pulse-scale":  "animate-[pulse_2s_ease-in-out_infinite]",
    "bounce-y":     "animate-[bounce_2s_ease-in-out_infinite]",
    "wiggle":       "animate-[wiggle_2.5s_ease-in-out_infinite]",
    "ping-dot":     "",   // handled separately
    "orbit":        "",   // handled separately
  };

  if (animation === "ping-dot") {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Icon className="w-6 h-6 relative z-10" style={{ color }} />
        <span
          className="absolute w-10 h-10 rounded-full opacity-20 animate-ping"
          style={{ background: color }}
        />
      </div>
    );
  }

  if (animation === "orbit") {
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <Icon className="w-6 h-6" style={{ color }} />
        <span
          className="absolute w-1.5 h-1.5 rounded-full animate-[spin_3s_linear_infinite]"
          style={{
            background: GOLD,
            top: "4px",
            right: "4px",
            transformOrigin: "18px 18px",
          }}
        />
      </div>
    );
  }

  return <Icon className={`w-6 h-6 ${animations[animation]}`} style={{ color }} />;
}

/* ── Intersection-aware feature card ──────────────────────────── */
function FeatureCard({
  icon,
  animation,
  iconColor,
  iconBg,
  accentColor,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  animation: "spin-slow" | "pulse-scale" | "bounce-y" | "wiggle" | "ping-dot" | "orbit";
  iconColor: string;
  iconBg: string;
  accentColor: string;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms, box-shadow 0.3s, translate 0.3s`,
      }}
    >
      {/* Left accent bar on hover */}
      <div
        className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: accentColor }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: iconBg }}
      >
        <AnimatedIcon icon={icon} animation={animation} color={iconColor} />
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Feature data ─────────────────────────────────────────────── */
const features = [
  {
    icon: Video,
    animation: "ping-dot" as const,
    iconColor: NAVY,
    iconBg: `${NAVY}12`,
    accentColor: NAVY,
    title: "Live & Recorded Tutoring",
    description: "1-on-1 live sessions with screen sharing, whiteboard & chat. HD recorded lessons with chapters and transcripts — watch on your schedule.",
  },
  {
    icon: Brain,
    animation: "pulse-scale" as const,
    iconColor: GOLD,
    iconBg: `${GOLD}18`,
    accentColor: GOLD,
    title: "AI-Powered Learning",
    description: "Your always-available AI teacher adapts to your level. Get step-by-step solutions, quizzes, flashcards and Socratic-guided discovery.",
  },
  {
    icon: BookOpen,
    animation: "bounce-y" as const,
    iconColor: TEAL,
    iconBg: `${TEAL}12`,
    accentColor: TEAL,
    title: "Resource Marketplace",
    description: "Thousands of curated notes, past papers, practice questions, and flashcard decks — all tagged to your curriculum, level, and topic.",
  },
  {
    icon: Users,
    animation: "wiggle" as const,
    iconColor: NAVY,
    iconBg: `${NAVY}12`,
    accentColor: NAVY,
    title: "Learning Community",
    description: "Subject-based forums, upvoted Q&A, tutor-verified answers, and @mentions. Ask anything, get expert help from peers worldwide.",
  },
  {
    icon: Award,
    animation: "orbit" as const,
    iconColor: GOLD,
    iconBg: `${GOLD}18`,
    accentColor: GOLD,
    title: "Gamified Progress",
    description: "Earn XP, unlock badges, and climb leaderboards. Daily streaks, milestone certificates, and study streak power-ups keep you motivated.",
  },
  {
    icon: ShieldCheck,
    animation: "ping-dot" as const,
    iconColor: TEAL,
    iconBg: `${TEAL}12`,
    accentColor: TEAL,
    title: "Verified Tutors Only",
    description: "Every tutor passes qualification review, intro-video screening, and subject testing before they appear in search results.",
  },
  {
    icon: Globe,
    animation: "spin-slow" as const,
    iconColor: CRIMSON,
    iconBg: `${CRIMSON}12`,
    accentColor: CRIMSON,
    title: "Multi-Curriculum Support",
    description: "CBC Kenya, British A-Level, American AP, IB Diploma and more — all content tagged and filtered to match your exact education system.",
  },
  {
    icon: Zap,
    animation: "pulse-scale" as const,
    iconColor: CRIMSON,
    iconBg: `${CRIMSON}12`,
    accentColor: CRIMSON,
    title: "Spaced Repetition",
    description: "SM-2 algorithm schedules your flashcard reviews at the scientifically optimal intervals for long-term memory retention.",
  },
];

/* ── Section ──────────────────────────────────────────────────── */
export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────── */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-5 border"
            style={{ background: `${NAVY}0d`, borderColor: `${NAVY}22`, color: NAVY }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
            Platform Features
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            Everything You Need{" "}
            <span style={{ color: NAVY }}>to Excel</span>
          </h2>

          <p className="text-lg text-gray-500 leading-relaxed">
            A complete learning ecosystem — live tutoring, AI assistance, resources, community and more.
            One platform, every curriculum.
          </p>
        </div>

        {/* ── Featured highlight strip ────────────────── */}
        <div
          className="rounded-3xl mb-10 p-8 sm:p-10 relative overflow-hidden"
          style={{ background: NAVY }}
        >
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          {/* gold glow */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${GOLD}30, transparent 70%)` }}
          />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            {/* Left — copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-5 border"
                style={{ background: `${GOLD}25`, borderColor: `${GOLD}50`, color: GOLD }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
                Highlight Feature
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-4">
                Your Personal AI Teacher,{" "}
                <span style={{ color: GOLD }}>Always On</span>
              </h3>
              <p className="text-white/65 text-sm leading-relaxed mb-6">
                Ask anything — in text, with images, or with LaTeX math. The AI Teacher knows your
                curriculum, your grade level, and your previous sessions. It guides you to the answer
                using the Socratic method rather than just giving it to you.
              </p>
              <a
                href="/auth/register"
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90 group"
                style={{ background: GOLD }}
              >
                Try AI Teacher Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Right — mini chat UI */}
            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 space-y-3">
              {[
                {
                  from: "student",
                  text: "I don't understand how to integrate by parts. Can you help?",
                },
                {
                  from: "ai",
                  text: "Of course! Integration by parts follows the formula: ∫u dv = uv − ∫v du. Let's pick a good example together. What function are you working with?",
                },
                {
                  from: "student",
                  text: "I need to integrate x·eˣ",
                },
                {
                  from: "ai",
                  text: "Perfect choice. Set u = x and dv = eˣ dx. Then du = dx and v = eˣ. Applying the formula gives x·eˣ − ∫eˣ dx = x·eˣ − eˣ + C. Does each step make sense?",
                },
              ].map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.from === "student" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[12px] leading-relaxed"
                    style={
                      msg.from === "student"
                        ? { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }
                        : { background: GOLD, color: "white" }
                    }
                  >
                    {msg.from === "ai" && (
                      <span className="block text-[9px] font-bold uppercase tracking-wider mb-1 opacity-70">
                        AI Teacher
                      </span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              <div className="flex justify-end">
                <div
                  className="flex items-center gap-1 px-4 py-2.5 rounded-2xl"
                  style={{ background: `${GOLD}55` }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 8 feature cards ─────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
