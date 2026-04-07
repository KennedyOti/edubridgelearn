"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Building2 } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring the platform",
    features: [
      "20 AI teacher queries/day",
      "Community access",
      "Free learning resources",
      "Basic progress tracking",
    ],
    cta: "Get Started Free",
    popular: false,
    style: {
      card: "border-border bg-white hover:border-primary/20",
      badge: null,
      checkColor: "text-accent",
      ctaVariant: "outline" as const,
    },
  },
  {
    name: "Basic",
    price: "$4.99",
    period: "/month",
    description: "For serious learners ready to level up",
    features: [
      "Unlimited AI teacher",
      "5 recorded lessons/month",
      "10% resource discounts",
      "XP boosts & streaks",
      "Priority community support",
    ],
    cta: "Start Basic Plan",
    popular: true,
    style: {
      card: "border-primary bg-linear-to-b from-primary-50 to-white shadow-xl shadow-primary/10",
      badge: "Most Popular",
      checkColor: "text-primary",
      ctaVariant: "primary" as const,
    },
  },
  {
    name: "Premium",
    price: "$14.99",
    period: "/month",
    description: "The complete learning experience",
    features: [
      "Everything in Basic",
      "2 live sessions/month",
      "All recorded lessons",
      "Priority tutor matching",
      "Certificates of completion",
      "Dedicated support",
    ],
    cta: "Go Premium",
    popular: false,
    style: {
      card: "border-accent/30 bg-white hover:border-accent/50",
      badge: null,
      checkColor: "text-accent",
      ctaVariant: "outline" as const,
    },
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-muted/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-secondary-dark bg-secondary-50 border border-secondary/20 px-4 py-1.5 rounded-full mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
            Plans That Fit Your{" "}
            <span className="text-primary">Goals</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Start free and upgrade as your learning grows. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border-2 p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 ${plan.style.card} ${plan.popular ? "scale-[1.02]" : ""}`}
            >
              {/* Popular badge */}
              {plan.style.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">
                    <Zap className="w-3 h-3 text-secondary" />
                    {plan.style.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-7">
                <h3 className="text-base font-bold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border mb-6" />

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 ${plan.style.checkColor} shrink-0 mt-0.5`} />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <Button variant={plan.style.ctaVariant} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Institutional callout */}
        <div className="mt-10 max-w-5xl mx-auto bg-primary rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Institutional Plan</p>
              <p className="text-white/75 text-xs mt-0.5">
                Bulk licenses, custom curriculum, admin dashboard & analytics for schools.
              </p>
            </div>
          </div>
          <a
            href="mailto:institutions@edubridgelearn.com"
            className="shrink-0 inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:opacity-90"
            style={{ background: "#C7984F" }}
          >
            Contact us for pricing
          </a>
        </div>

      </div>
    </section>
  );
}
