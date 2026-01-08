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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Report Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              Check your inbox at <strong>{email}</strong> for your personalized map solution report.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Form State
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📧</span>
                  <h3 className="text-lg font-bold text-gray-800">
                    Send Report to Email
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Get your solution report delivered to your inbox
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Use Case:</span> {requirements.use_case}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Products:</span> {selectedProducts.length} selected
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  placeholder="your@email.com"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

              <p className="text-xs text-gray-400 text-center">
                We&apos;ll send your personalized solution report with selected products and next steps.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
