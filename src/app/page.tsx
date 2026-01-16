"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import HeroChat from "@/components/landing/HeroChat";
import ProductShowcase from "@/components/landing/ProductShowcase";
import DemoMatchingFlow from "@/components/landing/DemoMatchingFlow";
import DemoMapPreview from "@/components/landing/DemoMapPreview";
import DemoQualityEval from "@/components/landing/DemoQualityEval";
import Footer from "@/components/landing/Footer";
import ContactModal from "@/components/landing/ContactModal";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isContactOpen, setIsContactOpen] = useState(false);

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
      <header className="sticky top-0 z-50 bg-white border-b border-[#e9e9e7]">
        <div className="py-3 px-4 sm:py-4 sm:px-8 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Mapiker-AI" width={100} height={27} className="sm:w-[120px] sm:h-[32px]" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:block px-3 py-1.5 text-[#787774] hover:text-[#37352f] font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#37352f] hover:bg-[#2f2d28] text-white text-sm sm:text-base font-medium rounded-md transition-colors"
            >
              Get Started
            </Link>
            <button
              onClick={() => setIsContactOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-[#37352f] text-[#37352f] hover:bg-[#37352f] hover:text-white text-sm sm:text-base font-medium rounded-md transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero with Chat Input */}
        <HeroChat />

        {/* Product Types Showcase */}
        <ProductShowcase />

        {/* Demo 1: Smart Product Matching */}
        <DemoMatchingFlow />

        {/* Demo 2: Map & Code Preview */}
        <DemoMapPreview />

        {/* Demo 3: Quality Evaluation */}
        <DemoQualityEval />

        {/* Footer */}
        <Footer />
      </main>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
