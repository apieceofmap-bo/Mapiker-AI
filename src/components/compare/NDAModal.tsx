"use client";

import { useState } from "react";

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export default function NDAModal({ isOpen, onClose, onAgree }: NDAModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleAgree = () => {
    if (agreed) {
      onAgree();
      setAgreed(false);
    }
  };

  const handleClose = () => {
    setAgreed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e9e9e7]">
          <h2 className="text-lg font-semibold text-[#37352f]">
            Confidentiality Agreement
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-[#9b9a97] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#e67e22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-[#37352f]">Important Notice</span>
            </div>
            <p className="text-sm text-[#787774] leading-relaxed">
              The comparison report you are about to download contains proprietary pricing and product information from our respective map product partners. This information is provided under strict confidentiality terms.
            </p>
          </div>

          <div className="bg-[#f7f6f3] rounded-lg p-4 mb-6">
            <h3 className="font-medium text-[#37352f] mb-2 text-sm">By proceeding, you agree to:</h3>
            <ul className="text-sm text-[#787774] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#37352f] mt-0.5">1.</span>
                <span>Not share, distribute, or disclose this information to any third party without prior written consent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#37352f] mt-0.5">2.</span>
                <span>Use this information solely for internal evaluation and decision-making purposes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#37352f] mt-0.5">3.</span>
                <span>Acknowledge that pricing information may be subject to change and should be verified before final decisions.</span>
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none mb-6">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#d3d3d3] text-[#37352f] focus:ring-[#37352f] focus:ring-offset-0"
            />
            <span className="text-sm text-[#37352f]">
              I have read and agree to the confidentiality terms above.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-[#787774] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.04)] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAgree}
              disabled={!agreed}
              className="px-4 py-2 text-sm font-medium bg-[#37352f] text-white rounded-md hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agree & Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
