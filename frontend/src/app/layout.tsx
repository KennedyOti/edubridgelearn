// app/layout.tsx

import ThemeToggle from "@/components/ui/ThemeToggle";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduBridgeLearn",
  description: "Where curious minds meet brilliant mentors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} transition-theme`}>
        <div className="min-h-screen flex flex-col">

          {/* Header */}
          <header className="border-b border-default bg-surface transition-theme">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold text-brand transition-theme">
                EduBridgeLearn
              </h1>

              <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium">
                <a href="/" className="hover:text-brand-hover transition-theme">
                  Home
                </a>
                <a href="/login" className="hover:text-brand-hover transition-theme">
                  Login
                </a>
                <a
                  href="/register"
                  className="btn btn-brand"
                >
                  Join Us
                </a>

                {/* Theme Toggle */}
                <ThemeToggle />
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          {/* <footer className="border-t border-default bg-surface transition-theme">
            <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-text-muted text-center">
              © {new Date().getFullYear()} EduBridgeLearn. Built for curious minds.
            </div>
          </footer> */}
        </div>
      </body>
    </html>
  );
}
