"use client";

import { useState, useMemo } from "react";
import { MatchResponse, SelectionState, Product, Requirements, EnvironmentType, EnvironmentSelectionState } from "@/lib/types";
import { isMultiEnvironmentRequest, filterCategoriesByEnvironment, ENVIRONMENT_SECTIONS } from "@/lib/environmentDetector";
import CategoryGroup from "./CategoryGroup";
import EnvironmentSection from "./EnvironmentSection";
import EmbedCode from "../preview/EmbedCode";
import EmailReportModal from "../EmailReportModal";
import MapPreview from "../preview/MapPreview";

interface CombinedProductPreviewProps {
  matchResult: MatchResponse;
  selections: SelectionState | EnvironmentSelectionState;
  onSelectionChange: (categoryId: string, productId: string | null, environment?: EnvironmentType) => void;
  onBack: () => void;
  requirements?: Requirements | null;
  isMultiEnvironment?: boolean;
}

export default function CombinedProductPreview({
  matchResult,
  selections,
  onSelectionChange,
  onBack,
  requirements,
  isMultiEnvironment = false,
}: CombinedProductPreviewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // Initialize with required categories expanded
    const initial = new Set<string>();
    if (isMultiEnvironment) {
      matchResult.categories.filter(c => c.required).forEach(c => {
        initial.add(`mobile-${c.id}`);
        initial.add(`backend-${c.id}`);
      });
    } else {
      matchResult.categories.filter(c => c.required).forEach(c => {
        initial.add(c.id);
      });
    }
    return initial;
  });
  const [copied, setCopied] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Filter categories by environment for multi-environment mode
  const mobileCategories = useMemo(() =>
    isMultiEnvironment ? filterCategoriesByEnvironment(matchResult.categories, 'mobile') : [],
    [matchResult.categories, isMultiEnvironment]
  );

  const backendCategories = useMemo(() =>
    isMultiEnvironment ? filterCategoriesByEnvironment(matchResult.categories, 'backend') : [],
    [matchResult.categories, isMultiEnvironment]
  );

  // Get the appropriate selections based on mode
  const getSelectionsForEnv = (env?: EnvironmentType): SelectionState => {
    if (isMultiEnvironment && env) {
      return (selections as EnvironmentSelectionState)[env] || {};
    }
    return selections as SelectionState;
  };

  // Count required categories and selected
  const requiredCategories = matchResult.categories.filter((c) => c.required);
  const flatSelections = isMultiEnvironment
    ? { ...(selections as EnvironmentSelectionState).mobile, ...(selections as EnvironmentSelectionState).backend }
    : selections as SelectionState;

  const selectedRequiredCount = requiredCategories.filter(
    (c) => flatSelections[c.id] !== null
  ).length;
  const allRequiredSelected = isMultiEnvironment
    ? mobileCategories.filter(c => c.required).every(c => (selections as EnvironmentSelectionState).mobile?.[c.id]) &&
      backendCategories.filter(c => c.required).every(c => (selections as EnvironmentSelectionState).backend?.[c.id])
    : selectedRequiredCount === requiredCategories.length;

  // Get selected products (with deduplication by product ID)
  const selectedProductsMap = new Map<string, Product>();
  if (isMultiEnvironment) {
    const envSelections = selections as EnvironmentSelectionState;
    // Mobile products
    mobileCategories.forEach((category) => {
      const selectedId = envSelections.mobile?.[category.id];
      if (selectedId) {
        const product = category.products.find((p) => p.id === selectedId);
        if (product && !selectedProductsMap.has(product.id)) {
          selectedProductsMap.set(product.id, product);
        }
      }
    });
    // Backend products
    backendCategories.forEach((category) => {
      const selectedId = envSelections.backend?.[category.id];
      if (selectedId) {
        const product = category.products.find((p) => p.id === selectedId);
        if (product && !selectedProductsMap.has(product.id)) {
          selectedProductsMap.set(product.id, product);
        }
      }
    });
  } else {
    matchResult.categories.forEach((category) => {
      const selectedId = (selections as SelectionState)[category.id];
      if (selectedId) {
        const product = category.products.find((p) => p.id === selectedId);
        if (product && !selectedProductsMap.has(product.id)) {
          selectedProductsMap.set(product.id, product);
        }
      }
    });
  }
  const selectedProducts = Array.from(selectedProductsMap.values());

  // Group selected products by provider
  const productsByProvider = selectedProducts.reduce((acc, product) => {
    if (!acc[product.provider]) {
      acc[product.provider] = [];
    }
    acc[product.provider].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Determine recommended provider (the one with most selections)
  const recommendedProvider = selectedProducts.length > 0
    ? Object.entries(productsByProvider).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || null
    : null;

  // Count providers
  const providerCounts = Object.entries(productsByProvider).map(([provider, products]) => ({
    provider,
    count: products.length,
    isRecommended: provider === recommendedProvider
  })).sort((a, b) => b.count - a.count);

  // Check if selections are unified (all from same provider)
  const isUnified = providerCounts.length <= 1;
  const hasMultipleProviders = providerCounts.length > 1;

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
          <h2 className="text-2xl font-bold text-gray-800">Select Products & Preview</h2>
          <p className="text-gray-600 mt-1">
            {matchResult.total_matched} products matched across{" "}
            {matchResult.categories.length} categories
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Back to Chat
        </button>
      </div>

      {/* Selection Status Bar */}
      <div
        className={`p-4 rounded-lg border ${
          allRequiredSelected
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {allRequiredSelected ? (
            <span className="text-green-600 text-xl">✓</span>
          ) : (
            <span className="text-amber-600 text-xl">⚠</span>
          )}
          <span
            className={`font-medium ${
              allRequiredSelected ? "text-green-800" : "text-amber-800"
            }`}
          >
            {allRequiredSelected
              ? "All required categories selected! Preview and embed code are ready."
              : `Select one product from each required category (${selectedRequiredCount}/${requiredCategories.length})`}
          </span>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Product Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg">📦 Product Selection</h3>

          {/* Feature Coverage */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${matchResult.feature_coverage.coverage_percent}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {matchResult.feature_coverage.coverage_percent}% coverage
              </span>
            </div>
          </div>

          {/* Provider Recommendation Panel */}
          {hasMultipleProviders && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Tip: Select products from the same provider
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Using a single provider simplifies API key management, ensures data consistency, and may offer bundle pricing.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {providerCounts.map(({ provider, count, isRecommended }) => (
                      <span
                        key={provider}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isRecommended
                            ? "bg-amber-200 text-amber-800"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {provider}: {count} selected
                        {isRecommended && " ★"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Provider Success */}
          {isUnified && selectedProducts.length > 1 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">✓</span>
                <p className="text-sm font-medium text-green-800">
                  Great! All products are from {recommendedProvider} - unified integration
                </p>
              </div>
            </div>
          )}

          {/* Category Groups */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {isMultiEnvironment ? (
              <>
                {/* Mobile Section */}
                <EnvironmentSection
                  environment="mobile"
                  categories={mobileCategories}
                  selections={getSelectionsForEnv('mobile')}
                  expandedCategories={expandedCategories}
                  onToggleCategory={toggleCategory}
                  onSelectionChange={(categoryId, productId) =>
                    onSelectionChange(categoryId, productId, 'mobile')
                  }
                  recommendedProvider={recommendedProvider}
                />

                {/* Backend Section */}
                <EnvironmentSection
                  environment="backend"
                  categories={backendCategories}
                  selections={getSelectionsForEnv('backend')}
                  expandedCategories={expandedCategories}
                  onToggleCategory={toggleCategory}
                  onSelectionChange={(categoryId, productId) =>
                    onSelectionChange(categoryId, productId, 'backend')
                  }
                  recommendedProvider={recommendedProvider}
                />
              </>
            ) : (
              matchResult.categories.map((category) => (
                <CategoryGroup
                  key={category.id}
                  category={category}
                  selectedProductId={(selections as SelectionState)[category.id]}
                  isExpanded={expandedCategories.has(category.id)}
                  onToggle={() => toggleCategory(category.id)}
                  onSelect={(productId) => onSelectionChange(category.id, productId)}
                  recommendedProvider={recommendedProvider}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Preview & Export */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg">🗺️ Preview & Export</h3>

          {/* Map Preview */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4">
            {allRequiredSelected && requirements ? (
              <MapPreview
                useCase={requirements.use_case}
                region={requirements.region}
                selectedCategories={
                  isMultiEnvironment
                    ? Object.keys(getSelectionsForEnv('mobile')).filter(
                        (catId) => getSelectionsForEnv('mobile')[catId] !== null
                      )
                    : Object.keys(selections as SelectionState).filter(
                        (catId) => (selections as SelectionState)[catId] !== null
                      )
                }
                provider={
                  recommendedProvider?.toLowerCase().includes("google")
                    ? "google"
                    : recommendedProvider?.toLowerCase().includes("here")
                    ? "here"
                    : recommendedProvider?.toLowerCase().includes("mapbox")
                    ? "mapbox"
                    : "google"
                }
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-3 opacity-50">🗺️</div>
                  <p className="font-medium">Select required products</p>
                  <p className="text-sm">to see the preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Products Summary */}
          {selectedProducts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-800 mb-3">Selected Products</h4>
              <div className="space-y-3">
                {Object.entries(productsByProvider).map(([provider, products]) => (
                  <div key={provider}>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                      {provider}
                    </p>
                    <ul className="space-y-1">
                      {products.map((product) => (
                        <li key={product.id} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-700">{product.product_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embed Code - Only show when all required are selected */}
          {allRequiredSelected && (
            <EmbedCode
              selectedProducts={selectedProducts}
              onCopy={handleCopyCode}
              copied={copied}
            />
          )}

          {/* Download Button */}
          {allRequiredSelected && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const code = generateFullCode(selectedProducts);
                  handleCopyCode(code);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Download HTML
              </button>
            </div>
          )}

          {/* Send Report Button */}
          {allRequiredSelected && requirements && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>📧</span>
              Send Report to Email
            </button>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Chat
        </button>
        <div className="text-sm text-gray-500">
          {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
        </div>
      </div>

      {/* Email Report Modal */}
      {requirements && (
        <EmailReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          requirements={requirements}
          selectedProducts={selectedProducts.map((p) => ({
            name: p.product_name,
            provider: p.provider,
            description: p.description,
            document_url: p.document_url,
          }))}
        />
      )}
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
    <title>Map Solution - Mapiker-AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="map"></div>

    <!--
    Generated by Mapiker-AI
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
        const config = {
            products: ${JSON.stringify(productIds, null, 12)},
            container: 'map',
            apiKey: 'YOUR_API_KEY'
        };

        console.log('Mapiker-AI configured with:', config);
    </script>
</body>
</html>`;
}
