"use client";

export default function ConfidentialBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 text-lg">🔒</span>
        <p className="text-sm text-amber-800">
          <strong>Confidential Information</strong> — This data is for internal use only.
          Do not share or distribute externally.
        </p>
      </div>
    </div>
  );
}
