// app/(auth)/layout.tsx

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-center bg-indigo-600 text-white p-16">
        <h2 className="text-4xl font-bold leading-tight">
          EduBridgeLearn
        </h2>
        <p className="mt-6 text-indigo-100 max-w-md">
          Where ambitious students meet brilliant tutors and
          knowledge architects. Learning deserves a proper stage.
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
