"use client";

import { motion, AnimatePresence } from "framer-motion";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
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
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-[#e9e9e7] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#37352f]">Privacy Policy</h2>
                  <button
                    onClick={onClose}
                    className="text-[#787774] hover:text-[#37352f] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-[#787774] mt-1">Last updated: January 2026</p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6 text-[#37352f]">
                  {/* Information We Collect */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">Account Information</h4>
                        <ul className="text-sm text-[#787774] list-disc list-inside mt-1">
                          <li>Email address, name, and company name when you create an account</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Usage Data</h4>
                        <ul className="text-sm text-[#787774] list-disc list-inside mt-1">
                          <li>Project configurations and requirements you input</li>
                          <li>Map vendor comparison preferences</li>
                          <li>Analytics on feature usage</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* How We Use Your Information */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
                    <ul className="text-sm text-[#787774] list-disc list-inside space-y-1">
                      <li>Provide personalized map vendor recommendations</li>
                      <li>Send product updates and newsletters (with your consent)</li>
                      <li>Improve our matching algorithms</li>
                      <li>Respond to support requests</li>
                    </ul>
                  </section>

                  {/* Data Retention */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Data Retention</h3>
                    <p className="text-sm text-[#787774]">
                      We retain your data until you delete your account or request deletion.
                      Project data may be retained for up to 30 days after deletion for recovery purposes.
                    </p>
                  </section>

                  {/* Your Rights */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                    <p className="text-sm text-[#787774] mb-2">You may request to:</p>
                    <ul className="text-sm text-[#787774] list-disc list-inside space-y-1">
                      <li>Access your personal data</li>
                      <li>Correct inaccurate data</li>
                      <li>Delete your data</li>
                      <li>Export your data</li>
                    </ul>
                    <p className="text-sm text-[#787774] mt-2">
                      Contact: <a href="mailto:navigate@apieceofmap.com" className="text-[#37352f] underline">navigate@apieceofmap.com</a>
                    </p>
                  </section>

                  {/* Security */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Security</h3>
                    <p className="text-sm text-[#787774]">
                      We implement industry-standard security measures including encryption,
                      access controls, and regular security audits.
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Contact</h3>
                    <p className="text-sm text-[#787774]">
                      A Piece of Map Inc.<br />
                      Email: <a href="mailto:navigate@apieceofmap.com" className="text-[#37352f] underline">navigate@apieceofmap.com</a>
                    </p>
                  </section>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#e9e9e7] flex-shrink-0">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-[#37352f] text-white font-medium rounded-lg hover:bg-[#2f2d28] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
