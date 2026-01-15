"use client";

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NDAModal({ isOpen, onClose }: NDAModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e9e9e7]">
          <h2 className="text-lg font-semibold text-[#37352f]">
            Confidentiality Agreement
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#9b9a97] hover:text-[#37352f] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6 text-sm text-[#37352f]">
            <p className="text-[#787774]">
              By using Mapiker-AI, you agree to the following terms:
            </p>

            <section>
              <h3 className="font-semibold mb-2">1. CONFIDENTIAL INFORMATION</h3>
              <p className="text-[#787774] mb-2">
                The following information provided through Mapiker-AI is considered confidential:
              </p>
              <ul className="list-disc list-inside text-[#787774] space-y-1 ml-2">
                <li>Product pricing data and cost calculations</li>
                <li>Quality evaluation reports and analysis</li>
                <li>Vendor comparison data</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. NON-DISCLOSURE OBLIGATION</h3>
              <p className="text-[#787774] mb-2">You agree NOT to:</p>
              <ul className="list-disc list-inside text-[#787774] space-y-1 ml-2">
                <li>Share, distribute, or publish any confidential information to third parties</li>
                <li>Use the information for purposes other than your own product evaluation</li>
                <li>Screenshot, copy, or reproduce the information for external distribution</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. PERMITTED USE</h3>
              <p className="text-[#787774] mb-2">You MAY:</p>
              <ul className="list-disc list-inside text-[#787774] space-y-1 ml-2">
                <li>Use the information for internal decision-making within your organization</li>
                <li>Share with colleagues who have also agreed to these terms</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. DURATION</h3>
              <p className="text-[#787774]">
                This agreement remains in effect for 2 years from the date of your last access
                to Mapiker-AI services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. VIOLATION</h3>
              <p className="text-[#787774] mb-2">
                Violation of this agreement may result in:
              </p>
              <ul className="list-disc list-inside text-[#787774] space-y-1 ml-2">
                <li>Immediate termination of your account</li>
                <li>Legal action for damages</li>
              </ul>
            </section>

            <div className="pt-4 border-t border-[#e9e9e7]">
              <p className="text-[#787774] italic">
                By checking the agreement box, you acknowledge that you have read, understood,
                and agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e9e9e7]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
