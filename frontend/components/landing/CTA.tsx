"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-secondary overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center">
          {/* Background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Ready to Transform Your Learning Journey?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
              Join thousands of learners already using EduBridge to achieve their academic goals. Start for free today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg w-full sm:w-auto group"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/register?role=tutor">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white border-2 border-white/30 hover:bg-white/10 w-full sm:w-auto"
                >
                  Become a Tutor
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/60">
              No credit card required. Free plan available forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
