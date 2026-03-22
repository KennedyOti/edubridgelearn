"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Basic",
    price: "$4.99",
    period: "/month",
    description: "For serious learners ready to level up",
    features: [
      "Unlimited AI teacher",
      "5 recorded lessons/month",
      "Resource discounts (10%)",
      "XP boosts & streaks",
      "Priority community support",
    ],
    cta: "Start Basic Plan",
    variant: "primary" as const,
    popular: true,
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
    variant: "outline" as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Plans That Fit Your <span className="text-primary">Goals</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start for free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border hover:border-primary/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/register">
                <Button
                  variant={plan.variant}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Institutional callout */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a plan for your school or institution?{" "}
            <a href="#" className="text-primary font-semibold hover:underline">
              Contact us for custom pricing
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
