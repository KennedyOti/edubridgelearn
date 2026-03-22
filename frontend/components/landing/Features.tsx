"use client";

import {
  Video,
  Brain,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  Globe,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live & Recorded Tutoring",
    description: "Connect with verified tutors for 1-on-1 live sessions or learn at your own pace with recorded lessons.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Get instant help from our AI teacher that adapts to your level and curriculum for personalized guidance.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: BookOpen,
    title: "Resource Marketplace",
    description: "Access thousands of curated study materials — notes, past papers, quizzes, and more from expert educators.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Learning Community",
    description: "Join subject-based communities, ask questions, and learn together with peers from around the world.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Award,
    title: "Gamified Progress",
    description: "Earn XP, badges, and climb leaderboards. Track your streak and celebrate learning milestones.",
    color: "bg-error/10 text-error",
  },
  {
    icon: ShieldCheck,
    title: "Verified Tutors",
    description: "Every tutor is verified with qualification checks, ensuring you learn from qualified professionals.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Globe,
    title: "Multi-Curriculum Support",
    description: "CBC, British, American, IB — we support multiple curricula aligned to your education system.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Zap,
    title: "Smart Study Tools",
    description: "Flashcards with spaced repetition, AI-generated quizzes, and adaptive study plans for efficient learning.",
    color: "bg-primary/10 text-primary",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything You Need to{" "}
            <span className="text-primary">Excel</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A complete learning ecosystem designed to help you achieve your academic goals, no matter where you are.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
