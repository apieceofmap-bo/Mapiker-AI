"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import HeroChat from "@/components/landing/HeroChat";
import ProductShowcase from "@/components/landing/ProductShowcase";
import DemoMatchingFlow from "@/components/landing/DemoMatchingFlow";
import DemoMapPreview from "@/components/landing/DemoMapPreview";
import DemoQualityEval from "@/components/landing/DemoQualityEval";
import FinalCTA from "@/components/landing/FinalCTA";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-4 px-8 flex items-center justify-between max-w-7xl mx-auto border-b border-[#e9e9e7]">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Mapiker-AI" width={120} height={32} />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3 py-1.5 text-[#787774] hover:text-[#37352f] font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero with Chat Input */}
        <HeroChat />

        {/* Product Types Showcase */}
        <ProductShowcase />

        {/* Demo Section Header */}
        <section className="py-12 px-8 text-center bg-white">
          <h2 className="text-3xl font-bold text-[#37352f] mb-2">
            See How It Works
          </h2>
          <p className="text-[#787774]">
            Explore our key features through interactive demos
          </p>
        </section>

        {/* Demo 1: Smart Product Matching */}
        <DemoMatchingFlow />

        {/* Demo 2: Map & Code Preview */}
        <DemoMapPreview />

        {/* Demo 3: Quality Evaluation */}
        <DemoQualityEval />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-[#9b9a97] border-t border-[#e9e9e7] bg-white">
        &copy; {new Date().getFullYear()} A Piece of Map. All rights reserved.
      </footer>
    </div>
  );
}
