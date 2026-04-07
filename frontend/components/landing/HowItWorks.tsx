"use client";

import { UserPlus, Search, CalendarCheck, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up as a student, tutor, or contributor. Verify your email and set up your profile in minutes.",
    step: "01",
    accentBg: "bg-primary",
    ringColor: "ring-primary/20",
    cardBorder: "border-primary/20",
    cardBg: "hover:bg-primary/3",
    numColor: "text-primary",
  },
  {
    icon: Search,
    title: "Discover & Connect",
    description: "Browse tutors by subject, level, and rating. Explore the marketplace for curriculum-tagged materials.",
    step: "02",
    accentBg: "bg-secondary-dark",
    ringColor: "ring-secondary/20",
    cardBorder: "border-secondary/20",
    cardBg: "hover:bg-secondary/3",
    numColor: "text-secondary-dark",
  },
  {
    icon: CalendarCheck,
    title: "Book & Learn",
    description: "Schedule live sessions, access recorded lessons, or chat with our AI teacher for instant help anytime.",
    step: "03",
    accentBg: "bg-accent",
    ringColor: "ring-accent/20",
    cardBorder: "border-accent/20",
    cardBg: "hover:bg-accent/3",
    numColor: "text-accent",
  },
  {
    icon: Rocket,
    title: "Track & Excel",
    description: "Monitor your progress, earn achievements, and climb the leaderboard as you master new subjects.",
    step: "04",
    accentBg: "bg-highlight",
    ringColor: "ring-highlight/20",
    cardBorder: "border-highlight/20",
    cardBg: "hover:bg-highlight/3",
    numColor: "text-highlight",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary bg-primary-50 border border-primary/10 px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
            Up and Running in{" "}
            <span className="text-primary">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            From sign-up to your first session — EduBridge gets you learning faster than any other platform.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Dashed connector line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-primary/15 z-0" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step) => (
              <div
                key={step.step}
                className={`group bg-white rounded-3xl border ${step.cardBorder} ${step.cardBg} p-7 transition-all duration-200 hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Step number + icon */}
                <div className="relative mb-6 inline-flex">
                  {/* Outer ring */}
                  <div className={`w-15 h-15 rounded-2xl ring-8 ${step.ringColor} bg-white flex items-center justify-center`}>
                    <div className={`w-full h-full rounded-2xl ${step.accentBg} flex items-center justify-center shadow-md`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Step number badge */}
                  <span className={`absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white border-2 border-current ${step.numColor} text-xs font-extrabold flex items-center justify-center shadow-sm`}>
                    {step.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust strip */}
        <div className="mt-16 bg-primary-50 border border-primary/10 rounded-2xl px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-foreground text-center sm:text-left">
            No credit card required &nbsp;·&nbsp; Free plan available forever &nbsp;·&nbsp; Cancel anytime
          </p>
          <a
            href="/auth/register"
            className="shrink-0 inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:opacity-90"
            style={{ background: "#293C7C" }}
          >
            Get started free
          </a>
        </div>

      </div>
    </section>
  );
}
