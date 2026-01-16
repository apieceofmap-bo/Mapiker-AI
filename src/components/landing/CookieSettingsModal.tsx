"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("cookiePreferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-[#e9e9e7]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#37352f]">Cookie Settings</h2>
                  <button
                    onClick={onClose}
                    className="text-[#787774] hover:text-[#37352f] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-[#787774] mt-2">
                  Mapiker-AI uses cookies to enhance your experience.
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#37352f]">Essential Cookies</h3>
                    <p className="text-sm text-[#787774] mt-1">
                      Required for basic site functionality. Cannot be disabled.
                    </p>
                    <ul className="text-sm text-[#787774] mt-2 list-disc list-inside">
                      <li>Session management</li>
                      <li>Security features</li>
                    </ul>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-6 bg-[#37352f] rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#37352f]">Analytics Cookies</h3>
                    <p className="text-sm text-[#787774] mt-1">
                      Help us understand how visitors interact with our site.
                    </p>
                    <ul className="text-sm text-[#787774] mt-2 list-disc list-inside">
                      <li>Usage statistics</li>
                      <li>Performance monitoring</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className="flex-shrink-0"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? "bg-[#37352f] justify-end" : "bg-[#e9e9e7] justify-start"
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#37352f]">Marketing Cookies</h3>
                    <p className="text-sm text-[#787774] mt-1">
                      Used to deliver relevant advertisements.
                    </p>
                    <ul className="text-sm text-[#787774] mt-2 list-disc list-inside">
                      <li>Ad personalization</li>
                      <li>Campaign tracking</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className="flex-shrink-0"
                  >
                    <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? "bg-[#37352f] justify-end" : "bg-[#e9e9e7] justify-start"
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#e9e9e7] flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 border border-[#e9e9e7] text-[#37352f] font-medium rounded-lg hover:bg-[#f7f6f3] transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2 bg-[#37352f] text-white font-medium rounded-lg hover:bg-[#2f2d28] transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
