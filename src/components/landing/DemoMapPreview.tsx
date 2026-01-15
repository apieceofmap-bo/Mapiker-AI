"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const CODE_SAMPLES = {
  google: `// Google Maps JavaScript API
const map = new google.maps.Map(
  document.getElementById("map"),
  {
    center: { lat: 37.5665, lng: 126.9780 },
    zoom: 15,
  }
);

const marker = new google.maps.Marker({
  position: { lat: 37.5665, lng: 126.9780 },
  map: map,
  title: "Seoul, Korea"
});`,

  mapbox: `// Mapbox GL JS
mapboxgl.accessToken = 'YOUR_TOKEN';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [126.9780, 37.5665],
  zoom: 15
});

new mapboxgl.Marker()
  .setLngLat([126.9780, 37.5665])
  .addTo(map);`,

  here: `// HERE Maps API
const platform = new H.service.Platform({
  apikey: 'YOUR_API_KEY'
});

const map = new H.Map(
  document.getElementById('map'),
  platform.createDefaultLayers().vector.normal.map,
  { center: { lat: 37.5665, lng: 126.9780 }, zoom: 15 }
);`,
};

const VENDORS = [
  { id: "google", name: "Google Maps", color: "#4285f4" },
  { id: "mapbox", name: "Mapbox", color: "#000000" },
  { id: "here", name: "HERE", color: "#00afaa" },
];

export default function DemoMapPreview() {
  const [selectedVendor, setSelectedVendor] = useState<"google" | "mapbox" | "here">("google");

  return (
    <section className="py-20 px-8 bg-[#f7f6f3]">
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
            Map & Code Preview
          </h2>
          <p className="text-[#787774] max-w-xl mx-auto">
            Preview maps and get ready-to-use code snippets for each vendor
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
          {/* Vendor Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            {VENDORS.map((vendor) => (
              <button
                key={vendor.id}
                onClick={() => setSelectedVendor(vendor.id as "google" | "mapbox" | "here")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedVendor === vendor.id
                    ? "bg-[#37352f] text-white"
                    : "bg-white text-[#787774] hover:bg-[#e9e9e7]"
                }`}
              >
                {vendor.name}
              </button>
            ))}
          </div>

          {/* Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Preview (Placeholder) */}
            <motion.div
              key={`map-${selectedVendor}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-[#e9e9e7] overflow-hidden shadow-sm"
            >
              <div className="px-4 py-3 bg-[#f7f6f3] border-b border-[#e9e9e7] flex items-center justify-between">
                <span className="text-sm font-medium text-[#37352f]">Map Preview</span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: VENDORS.find((v) => v.id === selectedVendor)?.color }}
                >
                  {VENDORS.find((v) => v.id === selectedVendor)?.name}
                </span>
              </div>
              <div className="h-72 bg-gradient-to-br from-[#e9e9e7] to-[#d3d3d0] flex items-center justify-center relative overflow-hidden">
                {/* Placeholder Map Visual */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-[#787774] rounded-lg" />
                  <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-[#787774] rounded-lg" />
                  <div className="absolute bottom-1/4 left-1/3 w-40 h-16 border border-[#787774] rounded-lg" />
                </div>
                <div className="text-center z-10">
                  <div className="text-5xl mb-3">🗺️</div>
                  <p className="text-[#787774] text-sm">Interactive map preview</p>
                  <p className="text-[#9b9a97] text-xs mt-1">Seoul, South Korea</p>
                </div>
                {/* Map Pin */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-3xl"
                >
                  📍
                </motion.div>
              </div>
            </motion.div>

            {/* Code Preview */}
            <motion.div
              key={`code-${selectedVendor}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm"
            >
              <div className="px-4 py-3 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#e03e3e]" />
                  <div className="w-3 h-3 rounded-full bg-[#f2c94c]" />
                  <div className="w-3 h-3 rounded-full bg-[#0f7b6c]" />
                  <span className="ml-2 text-sm text-[#9b9a97]">code.js</span>
                </div>
                <button className="text-xs text-[#787774] hover:text-white transition-colors">
                  Copy
                </button>
              </div>
              <div className="p-4 h-64 overflow-auto">
                <pre className="text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap">
                  {CODE_SAMPLES[selectedVendor]}
                </pre>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
