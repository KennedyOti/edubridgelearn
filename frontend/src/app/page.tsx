"use client";

import { useState } from "react";

export default function HomePage() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border-light dark:border-border-dark p-6">
          <h1 className="text-3xl font-extrabold text-primary">
            EduBridge Learn
          </h1>

          <button
            onClick={() => setDark(!dark)}
            className="btn btn-secondary"
          >
            Toggle {dark ? "Light" : "Dark"} Mode
          </button>
        </header>

        {/* Hero */}
        <section className="px-6 py-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-primary">
            Learn Faster. Learn Smarter.
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-text-muted dark:text-text-mutedDark">
            A high-energy tutoring platform built to help students succeed.
          </p>

          <div className="flex justify-center gap-4">
            <button className="btn btn-accent">Get Started</button>
            <button className="btn btn-primary">Browse Subjects</button>
          </div>
        </section>

        {/* Color Cards */}
        <section className="grid gap-6 px-6 pb-16 md:grid-cols-3">
          <div className="card">
            <h3 className="mb-2 text-xl font-bold text-primary">Primary</h3>
            <p className="text-text-muted dark:text-text-mutedDark">
              Trust, clarity, education
            </p>
            <div className="mt-4 h-16 rounded-lg bg-primary"></div>
          </div>

          <div className="card">
            <h3 className="mb-2 text-xl font-bold text-secondary">
              Secondary
            </h3>
            <p className="text-text-muted dark:text-text-mutedDark">
              Growth, progress, success
            </p>
            <div className="mt-4 h-16 rounded-lg bg-secondary"></div>
          </div>

          <div className="card">
            <h3 className="mb-2 text-xl font-bold text-accent">
              Accent
            </h3>
            <p className="text-text-muted dark:text-text-mutedDark">
              Energy, attention, motivation
            </p>
            <div className="mt-4 h-16 rounded-lg bg-accent"></div>
          </div>
        </section>

        {/* Status Colors */}
        <section className="px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-primary">
            Status & UI Elements
          </h2>

          <div className="flex flex-wrap gap-4">
            <span className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white">
              Success
            </span>

            <span className="rounded-lg bg-accent px-4 py-2 font-semibold text-black">
              Highlight
            </span>

            <span className="rounded-lg bg-danger px-4 py-2 font-semibold text-white">
              Error
            </span>

            <span className="rounded-lg border border-border-light dark:border-border-dark px-4 py-2">
              Neutral
            </span>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-light dark:border-border-dark px-6 py-8 text-center">
          <p className="text-text-muted dark:text-text-mutedDark">
            © 2026 EduBridge Learn · Built for students, trusted by parents
          </p>
        </footer>
      </main>
    </div>
  );
}
