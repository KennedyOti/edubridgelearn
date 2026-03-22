"use client";

import { UserPlus, Search, CalendarCheck, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up as a student, tutor, or contributor. Verify your email and set up your profile in minutes.",
    step: "01",
  },
  {
    icon: Search,
    title: "Discover & Connect",
    description: "Browse tutors by subject, level, and rating. Explore the marketplace for study materials tailored to your curriculum.",
    step: "02",
  },
  {
    icon: CalendarCheck,
    title: "Book & Learn",
    description: "Schedule live sessions, access recorded lessons, or chat with our AI teacher for instant help anytime.",
    step: "03",
  },
  {
    icon: Rocket,
    title: "Track & Excel",
    description: "Monitor your progress, earn achievements, and watch yourself climb the leaderboard as you master new subjects.",
    step: "04",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Get Started in <span className="text-primary">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            From sign-up to success — here&apos;s how EduBridge transforms your learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
              )}

              <div className="text-center">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <step.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
