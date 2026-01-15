"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const CODE_CONTENT = `import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [139.780, 35.672],
  zoom: 14
});

// Marker A (Ginza Station)
new mapboxgl.Marker({ color: '#e74c3c' })
  .setLngLat([139.7649, 35.6718])
  .addTo(map);

// Marker B (Monzen-Nakacho Station)
new mapboxgl.Marker({ color: '#e74c3c' })
  .setLngLat([139.7956, 35.6725])
  .addTo(map);

// Route line
map.on('load', () => {
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [139.7649, 35.6718],
          [139.7800, 35.6750],
          [139.7956, 35.6725]
        ]
      }
    }
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#e74c3c',
      'line-width': 6
    }
  });
});`;

export default function DemoMapPreview() {
  const [displayedCode, setDisplayedCode] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Typing animation
  useEffect(() => {
    if (!hasStarted) return;

    if (displayedCode.length < CODE_CONTENT.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setDisplayedCode(CODE_CONTENT.slice(0, displayedCode.length + 1));
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedCode, hasStarted]);

  // Start typing when component comes into view
  const handleViewEnter = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

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
            Preview maps and get ready-to-use code snippets
          </p>
        </motion.div>

        {/* Demo Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onViewportEnter={handleViewEnter}
          className="mt-12"
        >
          {/* Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl border border-[#e9e9e7] overflow-hidden shadow-sm"
            >
              <div className="px-4 py-3 bg-[#f7f6f3] border-b border-[#e9e9e7]">
                <span className="text-sm font-medium text-[#37352f]">Map Preview</span>
              </div>
              <div className="h-72 relative overflow-hidden">
                {/* Static Map Image with Route */}
                <Image
                  src="/images/map-preview-tokyo.png?v=3"
                  alt="Map Preview - Tokyo Route"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </motion.div>

            {/* Code Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm"
            >
              <div className="px-4 py-3 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#e03e3e]" />
                  <div className="w-3 h-3 rounded-full bg-[#f2c94c]" />
                  <div className="w-3 h-3 rounded-full bg-[#0f7b6c]" />
                  <span className="ml-2 text-sm text-[#9b9a97]">map.js</span>
                </div>
              </div>
              <div className="p-4 h-64 overflow-auto">
                <pre className="text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap">
                  {displayedCode}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-[#d4d4d4] ml-0.5"
                    />
                  )}
                </pre>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
