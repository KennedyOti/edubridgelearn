"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Users, BookOpen, Brain } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-primary">
                Trusted by 10,000+ learners across Africa
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Learn Without{" "}
              <span className="text-primary relative">
                Limits
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="hsl(234, 93%, 49%)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              , Grow Beyond Borders
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect with expert tutors, access quality learning resources, and get AI-powered personalized tutoring — all aligned to your curriculum.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Learning Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </div>
                Watch How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              {[
                { value: "500+", label: "Expert Tutors" },
                { value: "50K+", label: "Lessons Completed" },
                { value: "4.9", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main circle */}
              <div className="absolute inset-8 rounded-3xl bg-gradient-to-br from-primary to-secondary/80 shadow-2xl shadow-primary/20 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold">Your Learning Hub</h3>
                  <p className="text-white/80 mt-2 text-sm">Live tutoring, AI assistance, and curated resources</p>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg p-4 animate-bounce" style={{ animationDuration: "3s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI Tutor</div>
                    <div className="text-xs text-muted-foreground">Always available</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-lg p-4 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Live Sessions</div>
                    <div className="text-xs text-muted-foreground">1-on-1 tutoring</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -left-2 bg-white rounded-2xl shadow-lg p-3 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-200 to-secondary-light border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">2.4k online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
