"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import NDAModal from "./NDAModal";

interface SignupFormProps {
  redirectTo?: string;
}

export default function SignupForm({ redirectTo = "/dashboard" }: SignupFormProps) {
  const router = useRouter();
  const { signUp, signInWithGoogle, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreedToNDA, setAgreedToNDA] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!agreedToNDA) {
      setError("Please agree to the confidentiality agreement");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, {
        nda_agreed_at: new Date().toISOString(),
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
      // Note: On success, the page will redirect to Google OAuth
    } catch (err) {
      setError("An unexpected error occurred");
      setGoogleLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-[rgba(223,171,1,0.1)] border border-[rgba(223,171,1,0.3)] rounded-md p-4 text-center">
        <p className="text-[#b8860b] text-sm">
          Authentication is not configured. Please set up Supabase environment variables.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-[rgba(15,123,108,0.08)] border border-[rgba(15,123,108,0.2)] rounded-md p-6 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-semibold text-[#0f7b6c] mb-2">Account Created!</h3>
        <p className="text-[#0f7b6c] text-sm">
          Please check your email to verify your account. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md p-3">
          <p className="text-[#e03e3e] text-sm">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[#37352f] mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f] placeholder-[#9b9a97] transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[#37352f] mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f] placeholder-[#9b9a97] transition-colors"
          placeholder="At least 6 characters"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-[#37352f] mb-1.5"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f] placeholder-[#9b9a97] transition-colors"
          placeholder="Confirm your password"
        />
      </div>

      {/* Confidentiality Agreement Checkbox */}
      <div className="flex items-start gap-3">
        <input
          id="nda-agreement"
          type="checkbox"
          checked={agreedToNDA}
          onChange={(e) => setAgreedToNDA(e.target.checked)}
          className="mt-1 w-4 h-4 text-[#37352f] border-[#e9e9e7] rounded focus:ring-[#37352f]"
        />
        <label htmlFor="nda-agreement" className="text-sm text-[#37352f]">
          I agree to keep all pricing and quality report information confidential.{" "}
          <button
            type="button"
            onClick={() => setShowNDAModal(true)}
            className="text-[#2f81f7] hover:underline"
          >
            View Agreement
          </button>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || googleLoading}
        className="w-full py-2.5 px-4 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e9e9e7]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-[#9b9a97]">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full py-2.5 px-4 bg-white hover:bg-[#f7f6f3] text-[#37352f] font-medium rounded-md border border-[#e9e9e7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {googleLoading ? "Connecting..." : "Google"}
      </button>

      <p className="text-center text-sm text-[#787774]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#37352f] hover:underline font-medium">
          Sign in
        </Link>
      </p>

      {/* NDA Modal */}
      <NDAModal isOpen={showNDAModal} onClose={() => setShowNDAModal(false)} />
    </form>
  );
}
