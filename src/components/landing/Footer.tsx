"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CookieSettingsModal from "./CookieSettingsModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

export default function Footer() {
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <>
      <footer className="py-8 px-4 sm:py-12 sm:px-8 bg-[#37352f]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* Top Row: Brand + LinkedIn */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white text-sm sm:text-base">
              <span className="font-semibold whitespace-nowrap">Mapiker-AI</span>
              <span className="text-white/50 text-xs sm:text-sm">Powered by</span>
              <a
                href="https://www.apieceofmap.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-1.5 text-white/70 hover:text-white transition-colors"
              >
                <Image
                  src="/company-icon.png"
                  alt="A Piece of Map"
                  width={16}
                  height={16}
                  className="rounded sm:w-5 sm:h-5"
                />
                <span className="whitespace-nowrap">A Piece of Map Inc.</span>
              </a>
            </div>

            {/* LinkedIn Icon */}
            <a
              href="https://www.linkedin.com/company/a-piece-of-map/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mb-8" />

          {/* Middle Row: Cookie Settings & Privacy Policy */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={() => setIsCookieModalOpen(true)}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Cookie Settings
            </button>
            <span className="text-white/30">·</span>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
          </div>

          {/* Bottom Row: Copyright */}
          <div className="text-center text-sm text-white/40">
            © 2026 A Piece of Map Inc. All rights reserved.
          </div>
        </motion.div>
      </footer>

      {/* Modals */}
      <CookieSettingsModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </>
  );
}
