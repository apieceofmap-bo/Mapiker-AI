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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Welcome Back!
              </h3>
              <p className="text-sm text-gray-500">
                You have an unfinished session
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            We found a previous session from{" "}
            <span className="font-medium text-gray-800">
              {formatSessionAge(sessionAge)}
            </span>
            . Would you like to continue where you left off?
          </p>

          <div className="space-y-3">
            <button
              onClick={onRestore}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              Continue Previous Session
            </button>
            <button
              onClick={onStartNew}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Start Fresh
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Previous sessions expire after 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
