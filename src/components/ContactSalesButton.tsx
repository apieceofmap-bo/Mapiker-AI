"use client";

import { useState } from "react";
import { sendContactEmail } from "@/lib/api";

interface ContactFormData {
  name: string;
  email: string;
  question: string;
}

interface ContactSalesButtonProps {
  useCase?: string;
  selectedProducts?: string[];
}

export default function ContactSalesButton({ useCase, selectedProducts }: ContactSalesButtonProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    question: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await sendContactEmail({
        ...formData,
        use_case: useCase,
        selected_products: selectedProducts,
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit:", err);
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after closing
    setTimeout(() => {
      setIsSubmitted(false);
      setError(null);
      setFormData({ name: "", email: "", question: "" });
    }, 300);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#37352f] text-white px-5 py-3 rounded-full shadow-md hover:bg-[#2f2d28] transition-all hover:scale-105 flex items-center gap-2 z-40"
      >
        <span className="text-xl">💬</span>
        <span className="font-medium">Contact Sales</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {isSubmitted ? (
              // Success Message
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[rgba(15,123,108,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-[#0f7b6c]">✓</span>
                </div>
                <h3 className="text-xl font-bold text-[#37352f] mb-2">
                  Message Sent!
                </h3>
                <p className="text-[#787774] mb-6">
                  Thank you! We will reach out to you within 1 business day.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              // Contact Form
              <>
                <div className="p-6 border-b border-[#e9e9e7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💬</span>
                      <h3 className="text-lg font-bold text-[#37352f]">
                        Contact Sales
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
                    Have questions? We&apos;re here to help!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#37352f] mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f]"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#37352f] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f]"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#37352f] mb-1">
                      Question
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.question}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          question: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] resize-none text-[#37352f]"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md">
                      <p className="text-sm text-[#e03e3e]">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
