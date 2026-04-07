"use client";

import Link from "next/link";
import { GraduationCap, Twitter, Linkedin, Youtube, Facebook, Mail } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "For Tutors", href: "/auth/register?role=tutor" },
    { label: "For Institutions", href: "mailto:institutions@edubridgelearn.com" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Help Centre", href: "#" },
    { label: "Community", href: "#" },
    { label: "Curricula Supported", href: "#features" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Partners", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

const socials = [
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
  { label: "Facebook", icon: Facebook, href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">

          {/* Brand + newsletter */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/40">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                EduBridge<span className="font-black" style={{ color: "#C7984F" }}>.</span>
              </span>
            </Link>

            <p className="text-sm text-white/55 leading-relaxed mb-6">
              Democratising quality education through technology — one learner at a time, from Kenya to the world.
            </p>

            {/* Newsletter */}
            <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3">
              Learning tips in your inbox
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <div className="flex-1 flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                <Mail className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ background: "#C7984F" }}
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-sm text-white/35 text-center sm:text-left">
            &copy; {new Date().getFullYear()} EduBridge Learn. All rights reserved. Built for Africa, loved worldwide.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {socials.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-white/45 hover:text-secondary hover:bg-white/10 hover:border-secondary/30 transition-all duration-150"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
