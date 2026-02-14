"use client";

import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md mx-auto">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Your Account ✨
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Choose your path wisely. Greatness does not rush.
          It registers first.
        </p>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Form Component */}
      <RegisterForm />

      {/* Footer */}
      <p className="mt-8 text-sm text-center text-gray-500">
        Already inside the knowledge sphere?{" "}
        <Link
          href="/login"
          className="text-indigo-600 font-medium hover:underline"
        >
          Log in
        </Link>
      </p>

    </div>
  );
}
