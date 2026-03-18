"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Achieng Odhiambo",
    role: "Grade 9 Student, Nairobi",
    content: "EduBridge helped me understand Physics concepts I was struggling with. My tutor explains things in a way that makes sense, and the AI teacher is perfect for late-night revision!",
    rating: 5,
    avatar: "AO",
  },
  {
    name: "James Mwangi",
    role: "Mathematics Tutor",
    content: "As a tutor, EduBridge gives me a platform to reach students across Kenya and beyond. The booking system is smooth, and I love how payments are handled securely.",
    rating: 5,
    avatar: "JM",
  },
  {
    name: "Fatima Hassan",
    role: "University Student, Mombasa",
    content: "The resource marketplace is a goldmine! I found past papers and study notes that helped me ace my exams. The flashcard system is incredibly effective for memorization.",
    rating: 5,
    avatar: "FH",
  },
  {
    name: "Daniel Kipchoge",
    role: "Parent, Eldoret",
    content: "I can monitor my daughter's learning progress and control her spending. The parental dashboard gives me peace of mind knowing she's getting quality education online.",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Grace Wanjiku",
    role: "A-Level Student, International",
    content: "Being an international student, I needed a platform that supports the British curriculum. EduBridge has everything — from verified tutors to curriculum-aligned resources.",
    rating: 5,
    avatar: "GW",
  },
  {
    name: "Prof. Samuel Otieno",
    role: "Content Contributor",
    content: "Uploading my teaching materials and earning from them has been fantastic. The review process ensures quality, and I reach thousands of students I never could before.",
    rating: 5,
    avatar: "SO",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Loved by <span className="text-primary">Learners</span> & Educators
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Hear from our community of students, tutors, and parents who trust EduBridge for their learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
