// app/layout.tsx
import ThemeToggle from "@/components/ui/ThemeToggle";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // client-only toggle

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
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <div className="min-h-screen flex flex-col">
          
          <header className="border-b bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                EduBridgeLearn
              </h1>

              <nav className="flex items-center gap-6 text-sm font-medium">
                <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Home
                </a>
                <a href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Login
                </a>
                <a
                  href="/register"
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                >
                  Join the Adventure
                </a>

                {/* Client-only Theme Toggle */}
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              © {new Date().getFullYear()} EduBridgeLearn. Built for curious minds.
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}
