"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const EXAMPLE_PROMPTS = [
  { label: "Ride-hailing", query: "I'm building a ride-hailing app like Uber" },
  { label: "Logistics", query: "I need routing for fleet management and logistics" },
  { label: "Food Delivery", query: "Building a food delivery service with real-time tracking" },
  { label: "Navigation", query: "I need turn-by-turn navigation for my mobile app" },
];

export default function HeroChat() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/project/new?initial=${encodeURIComponent(input.trim())}`);
    }
  };

  const handleExampleClick = (query: string) => {
    router.push(`/project/new?initial=${encodeURIComponent(query)}`);
  };

  return (
    <section className="py-12 px-4 sm:py-20 sm:px-8">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-[#37352f] mb-4 leading-tight"
        >
          AI Agent Finds the Perfect Map Products
          <br />
          <span className="text-[#787774]">for Your Location-Based Service</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-[#787774] mb-10 leading-relaxed"
        >
          AI-powered recommendations from 100+ map products across globe.
          <br />
          Get matched with the best solutions for your use case.
        </motion.p>

        {/* Chat Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`bg-white rounded-xl border-2 transition-all duration-200 ${
            isFocused
              ? "border-[#37352f] shadow-lg"
              : "border-[#e9e9e7] shadow-md hover:border-[#d3d3d0]"
          }`}
        >
          <div className="p-5">
            {/* Label */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 text-left">
              <Image src="/logo.png" alt="Mapiker-AI" width={80} height={22} className="flex-shrink-0 sm:w-[100px] sm:h-[28px]" />
              <span className="text-xs sm:text-sm font-medium text-[#787774]">
                What kind of service are you building?
              </span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="I'm building a food delivery app..."
                className="w-full sm:flex-1 px-4 py-3 text-[#37352f] placeholder-[#9b9a97] bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] focus:outline-none focus:border-[#37352f] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full sm:w-auto px-5 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Start</span>
                <span>→</span>
              </button>
            </form>

            {/* Example Prompts */}
            <div className="mt-4 flex items-center gap-2 flex-wrap text-left">
              <span className="text-xs text-[#9b9a97]">💡 Try:</span>
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleExampleClick(prompt.query)}
                  className="px-3 py-1 text-xs font-medium text-[#787774] bg-[#f7f6f3] hover:bg-[#e9e9e7] rounded-full transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-[#9b9a97]"
        >
          <p className="text-sm mb-2">Scroll to learn more</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
