import Link from "next/link";
import { GraduationCap } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "For Tutors", href: "/auth/register?role=tutor" },
    { label: "For Institutions", href: "#" },
  ],
  Resources: [
    { label: "Blog", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "API Docs", href: "#" },
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

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Edu<span className="text-primary">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Democratizing quality education through technology, one learner at a time.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} EduBridge Learn. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              LinkedIn
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
