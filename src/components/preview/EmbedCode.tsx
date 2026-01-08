"use client";

import { useState } from "react";
import { Product } from "@/lib/types";

interface EmbedCodeProps {
  selectedProducts: Product[];
  onCopy: (code: string) => void;
  copied: boolean;
}

type CodeTab = "html" | "react" | "vue";

export default function EmbedCode({ selectedProducts, onCopy, copied }: EmbedCodeProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>("html");

  const productIds = selectedProducts.map((p) => p.id);

  const htmlCode = `<!-- Map Solution Builder - Embed Code -->
<div id="map-container" style="width: 100%; height: 400px;"></div>

<script>
  // Configuration
  const mapConfig = {
    container: 'map-container',
    products: ${JSON.stringify(productIds)},
    apiKey: 'YOUR_API_KEY'
  };

  // Initialize your map SDK here
  // Documentation: See selected product docs for implementation
</script>`;

  const reactCode = `import { useEffect, useRef } from 'react';

export function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize your map SDK here
    const config = {
      container: mapRef.current,
      products: ${JSON.stringify(productIds)},
      apiKey: process.env.NEXT_PUBLIC_MAP_API_KEY
    };

    // Example: Initialize map
    // const map = new MapSDK.Map(config);

    return () => {
      // Cleanup map instance
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '400px' }}
    />
  );
}`;

  const vueCode = `<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const mapContainer = ref(null);
let mapInstance = null;

onMounted(() => {
  if (!mapContainer.value) return;

  const config = {
    container: mapContainer.value,
    products: ${JSON.stringify(productIds)},
    apiKey: import.meta.env.VITE_MAP_API_KEY
  };

  // Initialize your map SDK here
  // mapInstance = new MapSDK.Map(config);
});

onUnmounted(() => {
  // Cleanup map instance
  if (mapInstance) {
    mapInstance.destroy();
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
}
</style>`;

  const codeMap: Record<CodeTab, string> = {
    html: htmlCode,
    react: reactCode,
    vue: vueCode,
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex">
          {(["html", "react", "vue"] as CodeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => onCopy(codeMap[activeTab])}
          className="mr-4 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy Code"}
        </button>
      </div>

      <div className="p-4 bg-gray-900 overflow-x-auto">
        <pre className="text-sm text-gray-100 font-mono whitespace-pre">
          {codeMap[activeTab]}
        </pre>
      </div>

      {/* Documentation Links */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Implementation Resources
        </h4>
        <ul className="space-y-1">
          {selectedProducts.map((product) => (
            <li key={product.id}>
              <a
                href={product.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {product.product_name} Documentation →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
