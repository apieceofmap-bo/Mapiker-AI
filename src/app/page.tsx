"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="py-6 px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <span className="text-2xl">🗺️</span>
          Mapiker-AI
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find the Perfect Map Products
            <br />
            <span className="text-blue-600">for Your Application</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered recommendations from 100+ map products across Google, HERE, Mapbox and more.
            Get matched with the best solutions for your use case.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/project/new"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Start Free Analysis
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-300 transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI-Powered Chat
            </h3>
            <p className="text-gray-600">
              Describe your requirements in natural language. Our AI understands your use case and extracts key features.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Matching
            </h3>
            <p className="text-gray-600">
              Get personalized recommendations from 100+ map products. Compare features, pricing, and coverage.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quality Reports
            </h3>
            <p className="text-gray-600">
              Get detailed analysis reports comparing vendors across your target regions with accuracy benchmarks.
            </p>
          </div>
        </div>

        {/* Vendors */}
        <div className="text-center">
          <p className="text-gray-500 mb-6">Covering products from leading providers</p>
          <div className="flex items-center justify-center gap-12 opacity-60">
            <span className="text-2xl font-semibold text-gray-700">Google</span>
            <span className="text-2xl font-semibold text-gray-700">HERE</span>
            <span className="text-2xl font-semibold text-gray-700">Mapbox</span>
            <span className="text-2xl font-semibold text-gray-700">TomTom</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} A Piece of Map. All rights reserved.
      </footer>
    </div>
  );
}
