"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const QUALITY_METRICS = [
  { vendor: "Google Maps", geocoding: 95, routing: 92, coverage: 98, color: "#4285f4" },
  { vendor: "HERE", geocoding: 88, routing: 94, coverage: 85, color: "#00afaa" },
  { vendor: "Mapbox", geocoding: 82, routing: 89, coverage: 78, color: "#000000" },
  { vendor: "TomTom", geocoding: 85, routing: 91, coverage: 82, color: "#e60000" },
];

const FEATURES = [
  { id: "geocoding", name: "Geocoding Accuracy", icon: "📍" },
  { id: "routing", name: "Routing Quality", icon: "🛣️" },
  { id: "coverage", name: "Regional Coverage", icon: "🌏" },
];

export default function DemoQualityEval() {
  const [selectedFeature, setSelectedFeature] = useState<"geocoding" | "routing" | "coverage">("geocoding");
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Animate bars when feature changes
  useEffect(() => {
    setAnimatedValues({});
    const timer = setTimeout(() => {
      const newValues: Record<string, number> = {};
      QUALITY_METRICS.forEach((metric) => {
        newValues[metric.vendor] = metric[selectedFeature];
      });
      setAnimatedValues(newValues);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedFeature]);

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
          <span className="inline-block px-3 py-1 bg-[rgba(155,89,182,0.1)] text-[#9b59b6] text-sm font-medium rounded-full mb-4">
            Demo 3
          </span>
          <h2 className="text-3xl font-bold text-[#37352f] mb-3">
            Map Quality Evaluation
          </h2>
          <p className="text-[#787774] max-w-xl mx-auto">
            Compare vendors across quality metrics for your target regions
          </p>
        </motion.div>

        {/* Demo Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          {/* Feature Selector */}
          <div className="flex justify-center gap-3 mb-8">
            {FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id as "geocoding" | "routing" | "coverage")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFeature === feature.id
                    ? "bg-[#37352f] text-white"
                    : "bg-[#f7f6f3] text-[#787774] hover:bg-[#e9e9e7]"
                }`}
              >
                <span>{feature.icon}</span>
                {feature.name}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-[#e9e9e7] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-semibold text-[#37352f]">
                {FEATURES.find((f) => f.id === selectedFeature)?.name} - South Korea
              </h4>
              <span className="text-sm text-[#787774]">Sample Data</span>
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              {QUALITY_METRICS.map((metric, index) => (
                <motion.div
                  key={metric.vendor}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-24 text-sm font-medium text-[#37352f]">
                    {metric.vendor}
                  </div>
                  <div className="flex-1 h-8 bg-[#f7f6f3] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${animatedValues[metric.vendor] || 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full flex items-center justify-end pr-3"
                      style={{ backgroundColor: metric.color }}
                    >
                      <span className="text-xs font-bold text-white">
                        {animatedValues[metric.vendor] || 0}%
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-[#e9e9e7]">
              <div className="flex flex-wrap justify-center gap-6">
                {QUALITY_METRICS.map((metric) => (
                  <div key={metric.vendor} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />
                    <span className="text-sm text-[#787774]">{metric.vendor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 p-4 bg-[rgba(155,89,182,0.08)] border border-[rgba(155,89,182,0.2)] rounded-lg"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">📊</span>
              <div>
                <h5 className="font-medium text-[#9b59b6]">Quality Reports Available</h5>
                <p className="text-sm text-[#9b59b6] opacity-80 mt-1">
                  Get detailed quality evaluation reports for your specific regions and use cases.
                  Compare accuracy, coverage, and performance across vendors.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
