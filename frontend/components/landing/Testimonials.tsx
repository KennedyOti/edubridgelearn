"use client";

import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Achieng Odhiambo",
    role: "Grade 9 Student",
    location: "Nairobi, Kenya",
    content: "EduBridge helped me finally understand Physics concepts I'd been struggling with for months. My tutor explains everything so clearly, and the AI teacher is perfect for late-night revision!",
    rating: 5,
    avatarGrad: "from-primary to-primary-light",
    initials: "AO",
    tag: "Student",
    tagColor: "bg-primary/10 text-primary",
  },
  {
    name: "James Mwangi",
    role: "Mathematics Tutor",
    location: "Nairobi, Kenya",
    content: "EduBridge gives me a professional platform to reach students across Kenya and beyond. The booking system is seamless, and I love how payments are handled securely through escrow.",
    rating: 5,
    avatarGrad: "from-secondary-dark to-secondary",
    initials: "JM",
    tag: "Tutor",
    tagColor: "bg-secondary/10 text-secondary-dark",
  },
  {
    name: "Fatima Hassan",
    role: "University Student",
    location: "Mombasa, Kenya",
    content: "The resource marketplace is a goldmine — past papers and study notes that helped me ace my exams. The spaced repetition flashcard system is incredibly effective.",
    rating: 5,
    avatarGrad: "from-accent to-accent-light",
    initials: "FH",
    tag: "Student",
    tagColor: "bg-accent/10 text-accent",
  },
  {
    name: "Daniel Kipchoge",
    role: "Parent",
    location: "Eldoret, Kenya",
    content: "The parental dashboard lets me track my daughter's learning progress and control spending. Peace of mind knowing she gets quality education while I monitor her activity.",
    rating: 5,
    avatarGrad: "from-highlight to-highlight-light",
    initials: "DK",
    tag: "Parent",
    tagColor: "bg-highlight/10 text-highlight",
  },
  {
    name: "Grace Wanjiku",
    role: "A-Level Student",
    location: "International",
    content: "As an international student needing British curriculum support, EduBridge has everything — from verified tutors to curriculum-aligned resources. Couldn't ask for more.",
    rating: 5,
    avatarGrad: "from-primary-dark to-primary",
    initials: "GW",
    tag: "Student",
    tagColor: "bg-primary/10 text-primary",
  },
  {
    name: "Prof. Samuel Otieno",
    role: "Content Contributor",
    location: "Kisumu, Kenya",
    content: "Uploading my teaching materials and earning from them has been fantastic. The review process ensures quality, and I now reach thousands of students I never could have offline.",
    rating: 5,
    avatarGrad: "from-secondary to-secondary-dark",
    initials: "SO",
    tag: "Contributor",
    tagColor: "bg-secondary/10 text-secondary-dark",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-accent bg-accent-50 border border-accent/20 px-4 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
            Loved by{" "}
            <span className="text-primary">Learners</span> &amp; Educators
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Hear from students, tutors, parents, and contributors who trust EduBridge every day.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative bg-white rounded-3xl p-7 border border-border hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
            >
              {/* Decorative quote mark */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/5 group-hover:text-primary/10 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/60">
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${t.avatarGrad} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md`}>
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground leading-none">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.role} · {t.location}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${t.tagColor}`}>
                  {t.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 opacity-50">
          {["Nation Media", "Daily Nation", "Standard", "KBC", "NTV Kenya"].map((brand) => (
            <span key={brand} className="text-sm font-bold text-muted-foreground tracking-wide uppercase">
              {brand}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">As featured in</p>

      </div>
    </section>
  );
}
