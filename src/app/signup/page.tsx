"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";

function SignupContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <span className="text-2xl">🗺️</span>
          Mapiker-AI
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Create Account
            </h1>
            <SignupForm redirectTo={redirect} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} A Piece of Map. All rights reserved.
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
