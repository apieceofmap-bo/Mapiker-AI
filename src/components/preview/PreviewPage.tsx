"use client";

import { useState } from "react";
import { MatchResponse, SelectionState, Product } from "@/lib/types";
import EmbedCode from "./EmbedCode";

interface PreviewPageProps {
  matchResult: MatchResponse;
  selections: SelectionState;
  onBack: () => void;
}

export default function PreviewPage({
  matchResult,
  selections,
  onBack,
}: PreviewPageProps) {
  const [copied, setCopied] = useState(false);

  // Get selected products
  const selectedProducts: Product[] = [];
  matchResult.categories.forEach((category) => {
    const selectedId = selections[category.id];
    if (selectedId) {
      const product = category.products.find((p) => p.id === selectedId);
      if (product) {
        selectedProducts.push(product);
      }
    }
  });

  // Group selected products by provider
  const productsByProvider = selectedProducts.reduce((acc, product) => {
    if (!acc[product.provider]) {
      acc[product.provider] = [];
    }
    acc[product.provider].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Preview & Export</h2>
          <p className="text-gray-600 mt-1">
            Review your selection and get the embed code
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Back to Products
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Map Preview */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Map Preview</h3>
            <p className="text-sm text-gray-500">
              Interactive preview of your map solution
            </p>
          </div>
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {/* Placeholder for actual map preview */}
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-lg font-medium">Map Preview</p>
              <p className="text-sm">
                This would display an interactive map using your selected
                products
              </p>
            </div>
          </div>
        </div>

        {/* Right: Selected Products Summary */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Selected Products</h3>
            <p className="text-sm text-gray-500">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(productsByProvider).map(([provider, products]) => (
              <div key={provider}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {provider}
                </h4>
                <ul className="space-y-2">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-green-500 mt-0.5">✓</span>
                      <div>
                        <span className="font-medium text-gray-800">
                          {product.product_name}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({product.data_format})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embed Code Section */}
      <EmbedCode
        selectedProducts={selectedProducts}
        onCopy={handleCopyCode}
        copied={copied}
      />

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Products
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const code = generateFullCode(selectedProducts);
              handleCopyCode(code);
            }}
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy All Code"}
          </button>
          <button
            onClick={() => {
              const code = generateFullCode(selectedProducts);
              const blob = new Blob([code], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "map-solution.html";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Download HTML
          </button>
        </div>
      </div>
    </div>
  );
}

function generateFullCode(products: Product[]): string {
  const productIds = products.map((p) => p.id);
  const productNames = products.map((p) => p.product_name).join(", ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Map Solution</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>

    <!--
    Selected Products: ${productNames}

    To implement this map solution, you'll need to:
    1. Get API keys from your selected provider(s)
    2. Include the appropriate SDK/library scripts
    3. Initialize the map with your configuration

    Documentation links:
    ${products.map((p) => `- ${p.product_name}: ${p.document_url}`).join("\n    ")}
    -->

    <script>
        // Map initialization code would go here
        // This is a placeholder - replace with actual SDK implementation

        const config = {
            products: ${JSON.stringify(productIds, null, 12)},
            container: 'map',
            // Add your API key here
            apiKey: 'YOUR_API_KEY'
        };

        console.log('Map Solution configured with:', config);

        // Example: Initialize map (replace with actual SDK code)
        // const map = new MapSDK.Map(config);
    </script>
</body>
</html>`;
}
