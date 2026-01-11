"use client";

import { formatSessionAge } from "@/lib/sessionStorage";

interface SessionRestoreDialogProps {
  sessionAge: number;
  onRestore: () => void;
  onStartNew: () => void;
}

export default function SessionRestoreDialog({
  sessionAge,
  onRestore,
  onStartNew,
}: SessionRestoreDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-[#e9e9e7]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgba(46,170,220,0.15)] rounded-full flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#37352f]">
                Welcome Back!
              </h3>
              <p className="text-sm text-[#787774]">
                You have an unfinished session
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[#787774]">
            We found a previous session from{" "}
            <span className="font-medium text-[#37352f]">
              {formatSessionAge(sessionAge)}
            </span>
            . Would you like to continue where you left off?
          </p>

          <div className="space-y-3">
            <button
              onClick={onRestore}
              className="w-full py-3 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              Continue Previous Session
            </button>
            <button
              onClick={onStartNew}
              className="w-full py-3 bg-[#f7f6f3] text-[#37352f] rounded-md font-medium hover:bg-[#e9e9e7] transition-colors"
            >
              Start Fresh
            </button>
          </div>

          <p className="text-xs text-[#9b9a97] text-center">
            Previous sessions expire after 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
