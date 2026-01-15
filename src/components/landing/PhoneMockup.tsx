"use client";

import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="relative w-[300px] h-[600px] mx-auto">
      {/* Phone Frame */}
      <div className="absolute inset-0 bg-[#1a1a1a] rounded-[44px] shadow-2xl flex items-center justify-center">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

        {/* Screen - exactly 280x560 for precise coordinate mapping */}
        <div className="w-[280px] h-[560px] bg-white rounded-[36px] overflow-hidden relative">
          {children}
        </div>
      </div>

      {/* Reflection effect */}
      <div className="absolute inset-0 rounded-[44px] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
