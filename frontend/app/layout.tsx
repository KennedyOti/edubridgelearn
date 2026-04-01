import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduBridge Learn — Global EdTech Platform",
  description:
    "Connect with expert tutors, access quality learning resources, and get AI-powered personalized tutoring aligned to your curriculum. Start learning today.",
  keywords: [
    "online tutoring",
    "EdTech",
    "CBC curriculum",
    "AI tutor",
    "learning platform",
    "Kenya education",
    "online learning",
  ],
  openGraph: {
    title: "EduBridge Learn — Learn Without Limits",
    description:
      "Connect with expert tutors, access quality learning resources, and get AI-powered personalized tutoring.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
