// src/app/(auth)/layout.tsx

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex relative items-center justify-center p-16 text-white">
        
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1470&q=80"
          alt="Students studying in a modern library"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Content */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            EduBridgeLearn
          </h1>
          <p className="text-white/80">
            Where ambitious students meet brilliant tutors and knowledge architects.
            Learning deserves a proper stage.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8">
        <div className="w-full max-w-md bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg">
          {children}
        </div>
      </div>

    </div>
  );
}
