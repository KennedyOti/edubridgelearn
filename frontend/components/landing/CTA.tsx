"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, Users, ShieldCheck } from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, text: "No credit card required" },
  { icon: GraduationCap, text: "Free plan available forever" },
  { icon: Users, text: "Join 10,000+ learners" },
];

export default function CTA() {
  return (
    <section className="py-20 lg:py-28 bg-muted/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main block */}
        <div className="relative rounded-3xl overflow-hidden bg-primary px-8 py-16 sm:px-16 sm:py-20">
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`,
              backgroundSize: "26px 26px",
            }}
          />
          {/* Gold accent blob top-right */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />
          {/* Teal accent blob bottom-left */}
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Pre-headline badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-7">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-semibold text-white/90">
                Start your learning journey today
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Ready to Transform Your{" "}
              <span className="text-secondary">Learning Journey?</span>
            </h2>
            <p className="text-lg text-white/75 max-w-lg mx-auto mb-10 leading-relaxed">
              Join thousands of learners already using EduBridge to achieve their academic goals — from CBC to A-Levels and beyond.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link href="/auth/register">
                <button
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base shadow-xl transition-all hover:opacity-90 group"
                  style={{ background: "#C7984F" }}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/auth/register?role=tutor">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white border-2 border-white/25 hover:bg-white/10 hover:border-white/40 w-full sm:w-auto"
                >
                  Become a Tutor
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {trustItems.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/65">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: "#C7984F" }} />
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
