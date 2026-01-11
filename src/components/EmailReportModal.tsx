"use client";

import { useState } from "react";
import { sendReportEmail, ReportProductInfo } from "@/lib/api";
import { Requirements } from "@/lib/types";

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: Requirements;
  selectedProducts: ReportProductInfo[];
}

export default function EmailReportModal({
  isOpen,
  onClose,
  requirements,
  selectedProducts,
}: EmailReportModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await sendReportEmail({
        email,
        requirements,
        selected_products: selectedProducts,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setEmail("");
      setIsSuccess(false);
      setError(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[rgba(15,123,108,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-[#0f7b6c]">✓</span>
            </div>
            <h3 className="text-xl font-bold text-[#37352f] mb-2">
              Report Sent!
            </h3>
            <p className="text-[#787774] mb-6">
              Check your inbox at <strong className="text-[#37352f]">{email}</strong> for your personalized map solution report.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Form State
          <>
            <div className="p-6 border-b border-[#e9e9e7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📧</span>
                  <h3 className="text-lg font-bold text-[#37352f]">
                    Send Report to Email
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-[#9b9a97] hover:text-[#37352f] text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-[#787774] mt-1">
                Get your solution report delivered to your inbox
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-[#f7f6f3] rounded-md p-4 space-y-2">
                <p className="text-sm text-[#787774]">
                  <span className="font-medium text-[#37352f]">Use Case:</span> {requirements.use_case}
                </p>
                <p className="text-sm text-[#787774]">
                  <span className="font-medium text-[#37352f]">Products:</span> {selectedProducts.length} selected
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-[#37352f] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f]"
                  placeholder="your@email.com"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md">
                  <p className="text-sm text-[#e03e3e]">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    Send Report
                  </>
                )}
              </button>

              <p className="text-xs text-[#9b9a97] text-center">
                We&apos;ll send your personalized solution report with selected products and next steps.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
