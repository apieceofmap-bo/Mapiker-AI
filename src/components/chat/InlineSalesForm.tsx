"use client";

import { useState } from "react";
import { submitSalesLead } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

interface InlineSalesFormProps {
  conversationHistory: ChatMessage[];
  useCase?: string;
  region?: string;
  requiredFeatures?: string[];
  onSubmitSuccess?: () => void;
}

export default function InlineSalesForm({
  conversationHistory,
  useCase,
  region,
  requiredFeatures,
  onSubmitSuccess,
}: InlineSalesFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    request_details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitSalesLead({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone || undefined,
        request_details: formData.request_details,
        conversation_history: conversationHistory,
        use_case: useCase,
        region: region,
        required_features: requiredFeatures,
      });
      setIsSubmitted(true);
      onSubmitSuccess?.();
    } catch (err) {
      console.error("Failed to submit sales lead:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[rgba(15,123,108,0.08)] border border-[rgba(15,123,108,0.2)] rounded-lg p-4 my-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[rgba(15,123,108,0.15)] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[#0f7b6c] text-xl">✓</span>
          </div>
          <div>
            <p className="font-semibold text-[#0f7b6c]">Request Submitted!</p>
            <p className="text-sm text-[#0f7b6c] mt-1">
              Thank you for your interest. Our sales team will contact you within 1 business day.
            </p>
            <p className="text-xs text-[#0f7b6c] mt-2 opacity-75">
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e9e9e7] rounded-lg p-4 my-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#e9e9e7]">
        <div className="w-8 h-8 bg-[rgba(55,53,47,0.08)] rounded-full flex items-center justify-center">
          <span className="text-lg">📞</span>
        </div>
        <div>
          <h4 className="font-semibold text-[#37352f]">Contact Sales Team</h4>
          <p className="text-xs text-[#9b9a97]">We&apos;ll reach out within 1 business day</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] placeholder:text-[#9b9a97]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Company name"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] placeholder:text-[#9b9a97]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] placeholder:text-[#9b9a97]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#37352f] mb-1">
              Phone <span className="text-[#9b9a97]">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] placeholder:text-[#9b9a97]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#37352f] mb-1">
            How can we help? <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            placeholder="Tell us about your project and what kind of help you need..."
            value={formData.request_details}
            onChange={(e) => setFormData(prev => ({ ...prev, request_details: e.target.value }))}
            className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] resize-none placeholder:text-[#9b9a97]"
            rows={3}
          />
        </div>

        {error && (
          <div className="p-2 bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md">
            <p className="text-sm text-[#e03e3e]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <span>Submit Request</span>
              <span>→</span>
            </>
          )}
        </button>

        <p className="text-xs text-[#9b9a97] text-center">
          Your conversation context will be shared with our sales team
        </p>
      </form>
    </div>
  );
}
