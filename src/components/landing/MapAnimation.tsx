"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DeliveryExample from "./DeliveryExample";
import RetailExample from "./RetailExample";
import LogisticsExample from "./LogisticsExample";

const EXAMPLES = [
  { id: "delivery", label: "Delivery", component: DeliveryExample, duration: 5500 },
  { id: "retail", label: "Retail", component: RetailExample, duration: 5000 },
  { id: "logistics", label: "Logistics", component: LogisticsExample, duration: 10000 },
];

export default function MapAnimation() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate with different durations per tab
  useEffect(() => {
    const timeout = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % EXAMPLES.length);
    }, EXAMPLES[activeIndex].duration);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  const ActiveComponent = EXAMPLES[activeIndex].component;

  return (
    <div className="relative w-full h-full">
      {/* Animation Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>

      {/* Indicator Dots */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {EXAMPLES.map((example, index) => (
          <button
            key={example.id}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex
                ? "bg-[#37352f] w-4"
                : "bg-[#37352f]/30 hover:bg-[#37352f]/50"
            }`}
            aria-label={`Show ${example.label} example`}
          />
        ))}
      </div>
    </div>
  );
}
