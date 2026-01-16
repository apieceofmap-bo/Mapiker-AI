"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Map Data tab data
const MAP_DATA_METRICS = [
  { vendor: "Map Maker A", score: 95 },
  { vendor: "Map Maker B", score: 88 },
  { vendor: "Solution Maker C", score: 82 },
  { vendor: "Local Map Maker D", score: 85 },
];

// API Functions tab data
const API_FEATURES = [
  { id: "multiDest", name: "Multi-Destinations", shortName: "Multi" },
  { id: "eta", name: "ETA", shortName: "ETA" },
  { id: "liveTraffic", name: "Live-Traffic", shortName: "Live" },
  { id: "historicalTraffic", name: "Historical Traffic", shortName: "Hist" },
  { id: "vehicleType", name: "Vehicle Type", shortName: "Type" },
];

const API_SUPPORT: Record<string, Record<string, boolean>> = {
  "Map Maker A": { multiDest: true, eta: true, liveTraffic: true, historicalTraffic: false, vehicleType: true },
  "Map Maker B": { multiDest: true, eta: true, liveTraffic: false, historicalTraffic: true, vehicleType: false },
  "Solution Maker C": { multiDest: true, eta: false, liveTraffic: true, historicalTraffic: true, vehicleType: false },
  "Local Map Maker D": { multiDest: true, eta: true, liveTraffic: true, historicalTraffic: true, vehicleType: true },
};

// Regional Coverage tab data
const COVERAGE_DATA = [
  { vendor: "Map Maker A", advanced: 7, basic: 4 },
  { vendor: "Map Maker B", advanced: 5, basic: 3 },
  { vendor: "Solution Maker C", advanced: 3, basic: 4 },
  { vendor: "Regional Map Maker D", advanced: 6, basic: 3 },
];

const TOTAL_COUNTRIES = 11;

const FEATURES = [
  { id: "mapData", name: "Map Data", shortName: "Map", icon: "📍" },
  { id: "apiFunctions", name: "API Functions", shortName: "API", icon: "⚙️" },
  { id: "coverage", name: "Regional Coverage", shortName: "Regional", icon: "🌏" },
];

// Calculate color based on score (blue gradient)
const getColorByScore = (score: number, minScore: number, maxScore: number) => {
  const ratio = (score - minScore) / (maxScore - minScore);
  const lightness = 80 - (ratio * 50); // 80% ~ 30%
  return `hsl(220, 70%, ${lightness}%)`;
};

export default function DemoQualityEval() {
  const [selectedFeature, setSelectedFeature] = useState<"mapData" | "apiFunctions" | "coverage">("mapData");
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Get min and max scores for color calculation
  const scores = MAP_DATA_METRICS.map((m) => m.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Animate bars when feature changes
  useEffect(() => {
    setAnimatedValues({});
    const timer = setTimeout(() => {
      const newValues: Record<string, number> = {};
      if (selectedFeature === "mapData") {
        MAP_DATA_METRICS.forEach((metric) => {
          newValues[metric.vendor] = metric.score;
        });
      } else if (selectedFeature === "coverage") {
        COVERAGE_DATA.forEach((data) => {
          newValues[`${data.vendor}-advanced`] = data.advanced;
          newValues[`${data.vendor}-basic`] = data.basic;
        });
      }
      setAnimatedValues(newValues);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedFeature]);

  return (
    <section className="py-12 px-4 sm:py-20 sm:px-8">
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
                onClick={() => setSelectedFeature(feature.id as "mapData" | "apiFunctions" | "coverage")}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedFeature === feature.id
                    ? "bg-[#37352f] text-white"
                    : "bg-[#f7f6f3] text-[#787774] hover:bg-[#e9e9e7]"
                }`}
              >
                <span>{feature.icon}</span>
                <span className="hidden sm:inline">{feature.name}</span>
                <span className="sm:hidden">{feature.shortName}</span>
              </button>
            ))}
          </div>

          {/* Chart Container */}
          <div className="bg-white rounded-xl border border-[#e9e9e7] p-6 shadow-sm">
            {/* Map Data Tab */}
            {selectedFeature === "mapData" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                    <span className="font-semibold text-[#37352f] text-sm sm:text-base">Country: Singapore</span>
                    <span className="font-semibold text-[#37352f] text-sm sm:text-base">Feature: POI Coverage</span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#787774]">Example</span>
                </div>

                {/* Bar Chart */}
                <div className="space-y-4">
                  {MAP_DATA_METRICS.map((metric, index) => (
                    <motion.div
                      key={metric.vendor}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
                    >
                      <div className="w-full sm:w-36 text-xs sm:text-sm font-medium text-[#37352f]">
                        {metric.vendor}
                      </div>
                      <div className="flex-1 h-6 sm:h-8 bg-[#f7f6f3] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${animatedValues[metric.vendor] || 0}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full flex items-center justify-end pr-3"
                          style={{ backgroundColor: getColorByScore(metric.score, minScore, maxScore) }}
                        >
                          <span className="text-xs font-bold text-white">
                            {animatedValues[metric.vendor] || 0}%
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* API Functions Tab */}
            {selectedFeature === "apiFunctions" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                    <span className="font-semibold text-[#37352f] text-sm sm:text-base">Country: Singapore</span>
                    <span className="font-semibold text-[#37352f] text-sm sm:text-base">Map Product: Directions API</span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#787774]">Example</span>
                </div>

                {/* Checkbox Table */}
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className="border-b border-[#e9e9e7]">
                        <th className="text-left py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-[#37352f] w-20 sm:w-auto">Vendor</th>
                        {API_FEATURES.map((feature) => (
                          <th key={feature.id} className="text-center py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-semibold text-[#37352f]">
                            <span className="hidden sm:inline">{feature.name}</span>
                            <span className="sm:hidden">{feature.shortName}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(API_SUPPORT).map(([vendor, support], index) => (
                        <motion.tr
                          key={vendor}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-[#f7f6f3]"
                        >
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm font-medium text-[#37352f]">{vendor}</td>
                          {API_FEATURES.map((feature) => (
                            <td key={feature.id} className="text-center py-2 sm:py-3 px-1 sm:px-2">
                              {support[feature.id] ? (
                                <span className="text-[#1e40af] text-base sm:text-lg">✓</span>
                              ) : (
                                <span className="text-[#d1d5db] text-sm">-</span>
                              )}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Regional Coverage Tab */}
            {selectedFeature === "coverage" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-[#37352f]">
                    Region: Southeast Asia
                  </h4>
                  <span className="text-sm text-[#787774]">Example</span>
                </div>

                {/* Stacked Bar Chart */}
                <div className="space-y-4">
                  {COVERAGE_DATA.map((data, index) => {
                    const total = data.advanced + data.basic;
                    const advancedWidth = (data.advanced / TOTAL_COUNTRIES) * 100;
                    const basicWidth = (data.basic / TOTAL_COUNTRIES) * 100;

                    return (
                      <motion.div
                        key={data.vendor}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
                      >
                        <div className="flex justify-between sm:block w-full sm:w-44">
                          <span className="text-xs sm:text-sm font-medium text-[#37352f]">
                            {data.vendor}
                          </span>
                          <span className="text-xs sm:hidden text-[#787774]">
                            {total}/{TOTAL_COUNTRIES}
                          </span>
                        </div>
                        <div className="flex-1 h-6 sm:h-8 bg-[#f7f6f3] rounded-full overflow-hidden flex">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${advancedWidth}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full flex items-center justify-center"
                            style={{ backgroundColor: "#1e40af" }}
                          >
                            {advancedWidth > 10 && (
                              <span className="text-xs font-bold text-white">{data.advanced}</span>
                            )}
                          </motion.div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${basicWidth}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="h-full flex items-center justify-center"
                            style={{ backgroundColor: "#93c5fd" }}
                          >
                            {basicWidth > 10 && (
                              <span className="text-xs font-bold text-[#1e40af]">{data.basic}</span>
                            )}
                          </motion.div>
                        </div>
                        <div className="hidden sm:block w-12 text-sm text-[#787774] text-right">
                          {total}/{TOTAL_COUNTRIES}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-[#e9e9e7]">
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1e40af" }} />
                      <span className="text-sm text-[#787774]">Advanced</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#93c5fd" }} />
                      <span className="text-sm text-[#787774]">Basic</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
