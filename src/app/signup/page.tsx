"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";

function SignupContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col">
      {/* Header */}
      <header className="py-4 px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Mapiker-AI" width={120} height={32} />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-[#e9e9e7] p-8">
            <h1 className="text-xl font-semibold text-[#37352f] text-center mb-6">
              Create Account
            </h1>
            <SignupForm redirectTo={redirect} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-[#9b9a97]">
        &copy; {new Date().getFullYear()} A Piece of Map. All rights reserved.
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f3]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
