"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FLOW_STEPS = [
  {
    icon: "💬",
    title: "Describe your needs",
    description: "Tell us about your application in natural language",
  },
  {
    icon: "🔍",
    title: "AI analyzes 100+ products",
    description: "Our AI matches your requirements to available products",
  },
  {
    icon: "✨",
    title: "Get personalized matches",
    description: "Receive tailored recommendations with pricing",
  },
];

const DEMO_MESSAGES = [
  { type: "user", text: "I'm building a food delivery app with real-time tracking" },
  { type: "ai", text: "Analyzing requirements... I'll help you find the best map products." },
  { type: "ai", text: "Based on your needs, here are the top recommendations:" },
];

export default function DemoMatchingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const [showMessages, setShowMessages] = useState<number[]>([]);

  // Auto-advance animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Message animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showMessages.length < DEMO_MESSAGES.length) {
        setShowMessages((prev) => [...prev, prev.length]);
      } else {
        // Reset after all messages shown
        setTimeout(() => setShowMessages([]), 2000);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [showMessages]);

  return (
    <section className="py-20 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl font-bold text-[#37352f] mb-3">
            Smart Product Matching
          </h2>
          <p className="text-[#787774] max-w-xl mx-auto">
            Describe what you're building and let AI find the perfect map products for you
          </p>
        </motion.div>

        {/* Demo Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12"
        >
          {/* Left: Flow Steps */}
          <div className="space-y-4">
            {FLOW_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                  currentStep === index
                    ? "bg-[#37352f] text-white"
                    : "bg-[#f7f6f3] text-[#37352f]"
                }`}
              >
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <h4 className="font-semibold">{step.title}</h4>
                  <p
                    className={`text-sm ${
                      currentStep === index ? "text-white/80" : "text-[#787774]"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                {currentStep === index && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Right: Chat Preview */}
          <div className="bg-white rounded-xl border border-[#e9e9e7] overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-[#f7f6f3] border-b border-[#e9e9e7]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e03e3e]" />
                <div className="w-3 h-3 rounded-full bg-[#f2c94c]" />
                <div className="w-3 h-3 rounded-full bg-[#0f7b6c]" />
                <span className="ml-2 text-sm text-[#787774]">AI Chat</span>
              </div>
            </div>

            <div className="p-4 h-64 overflow-hidden">
              <AnimatePresence>
                {showMessages.map((msgIndex) => {
                  const msg = DEMO_MESSAGES[msgIndex];
                  return (
                    <motion.div
                      key={msgIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-3 flex ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                          msg.type === "user"
                            ? "bg-[#37352f] text-white"
                            : "bg-[#f7f6f3] text-[#37352f]"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing Indicator */}
              {showMessages.length < DEMO_MESSAGES.length && showMessages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1 px-4 py-2 bg-[#f7f6f3] rounded-lg w-fit"
                >
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-[#787774] rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-[#787774] rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-[#787774] rounded-full"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
