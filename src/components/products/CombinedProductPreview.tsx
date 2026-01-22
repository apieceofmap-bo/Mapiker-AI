"use client";

import { useState, useMemo, useCallback } from "react";
import { MatchResponse, SelectionState, Product, Requirements, EnvironmentType, EnvironmentSelectionState } from "@/lib/types";
import { isMultiEnvironmentRequest, filterCategoriesByEnvironment, ENVIRONMENT_SECTIONS } from "@/lib/environmentDetector";
import CategoryGroup from "./CategoryGroup";
import EnvironmentSection from "./EnvironmentSection";
import EmbedCode from "../preview/EmbedCode";
import EmailReportModal from "../EmailReportModal";
import MapPreview from "../preview/MapPreview";

/**
 * Parses selection state to handle both legacy suffixed keys (categoryId_0, categoryId_1)
 * and new array-based values. Returns a Map of categoryId -> array of productIds.
 */
function parseSelectionKeys(selections: SelectionState): Map<string, string[]> {
  const categoryProducts = new Map<string, string[]>();

  Object.entries(selections).forEach(([key, value]) => {
    if (!value) return;

    // Extract base category ID by removing numeric suffix (e.g., "category_0" -> "category")
    const parts = key.split('_');
    const lastPart = parts[parts.length - 1];
    const baseKey = /^\d+$/.test(lastPart) && parts.length > 1
      ? parts.slice(0, -1).join('_')
      : key;

    if (!categoryProducts.has(baseKey)) {
      categoryProducts.set(baseKey, []);
    }

    // Handle both array and single string values
    if (Array.isArray(value)) {
      categoryProducts.get(baseKey)!.push(...value);
    } else {
      categoryProducts.get(baseKey)!.push(value);
    }
  });

  return categoryProducts;
}

/**
 * Gets the array of selected product IDs for a category from SelectionState.
 * Handles both string and string[] values.
 */
function getSelectedProductIds(selections: SelectionState, categoryId: string): string[] {
  const value = selections[categoryId];
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

interface CombinedProductPreviewProps {
  matchResult: MatchResponse;
  selections: SelectionState | EnvironmentSelectionState;
  onSelectionChange: (categoryId: string, productId: string, isSelected: boolean, environment?: EnvironmentType) => void;
  onBack: () => void;
  onResetSelections?: () => void;
  requirements?: Requirements | null;
  isMultiEnvironment?: boolean;
  hideHeader?: boolean;  // Hide the header section (for Dashboard Products page)
}

export default function CombinedProductPreview({
  matchResult,
  selections,
  onSelectionChange,
  onBack,
  onResetSelections,
  requirements,
  isMultiEnvironment = false,
  hideHeader = false,
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
  const [vendorFilter, setVendorFilter] = useState<string>("all");

  // Get all unique vendors from products
  const allVendors = useMemo(() => {
    const vendors = new Set<string>();
    matchResult.categories.forEach((category) => {
      category.products.forEach((product) => {
        vendors.add(product.provider);
      });
    });
    return Array.from(vendors).sort();
  }, [matchResult.categories]);

  // Filter products by vendor
  const filterProductsByVendor = useCallback((products: Product[]) => {
    if (vendorFilter === "all") return products;
    return products.filter((p) => p.provider === vendorFilter);
  }, [vendorFilter]);

  // Select all products from the current vendor for required categories
  const handleSelectAllVendorRequired = useCallback(() => {
    if (vendorFilter === "all") return;

    matchResult.categories.forEach((category) => {
      if (!category.required) return;

      // Find the first product from the selected vendor in this category
      const vendorProduct = category.products.find(
        (p) => p.provider === vendorFilter
      );

      if (vendorProduct) {
        onSelectionChange(category.id, vendorProduct.id, true);
      }
    });
  }, [vendorFilter, matchResult.categories, onSelectionChange]);

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

  // Count required categories (for legacy compatibility)
  const requiredCategories = matchResult.categories.filter((c) => c.required);

  // Parse selections to handle both legacy suffixed keys and array values
  const parsedSelections = useMemo(() => {
    if (isMultiEnvironment) {
      return {
        mobile: parseSelectionKeys((selections as EnvironmentSelectionState).mobile || {}),
        backend: parseSelectionKeys((selections as EnvironmentSelectionState).backend || {}),
      };
    }
    return { single: parseSelectionKeys(selections as SelectionState) };
  }, [selections, isMultiEnvironment]);

  // Get selected products (with deduplication by product ID)
  const selectedProductsMap = new Map<string, Product>();
  if (isMultiEnvironment) {
    const envSelections = selections as EnvironmentSelectionState;
    // Mobile products
    mobileCategories.forEach((category) => {
      const selectedIds = getSelectedProductIds(envSelections.mobile || {}, category.id);
      selectedIds.forEach((selectedId) => {
        const product = category.products.find((p) => p.id === selectedId);
        if (product && !selectedProductsMap.has(product.id)) {
          selectedProductsMap.set(product.id, product);
        }
      });
    });
    // Backend products
    backendCategories.forEach((category) => {
      const selectedIds = getSelectedProductIds(envSelections.backend || {}, category.id);
      selectedIds.forEach((selectedId) => {
        const product = category.products.find((p) => p.id === selectedId);
        if (product && !selectedProductsMap.has(product.id)) {
          selectedProductsMap.set(product.id, product);
        }
      });
    });
  } else {
    // Handle both legacy suffixed keys and array values
    const categorySelections = parsedSelections.single || parseSelectionKeys(selections as SelectionState);
    matchResult.categories.forEach((category) => {
      const selectedIds = categorySelections.get(category.id) || getSelectedProductIds(selections as SelectionState, category.id);
      selectedIds.forEach((selectedId) => {
        const product = category.products.find((p) => p.id === selectedId);
        if (product && !selectedProductsMap.has(product.id)) {
          selectedProductsMap.set(product.id, product);
        }
      });
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

  // Calculate feature coverage status based on selected products
  const featureStatus = useMemo(() => {
    const requiredFeatures = requirements?.required_features || matchResult.required_features || [];
    const selectedProductFeatures = new Set<string>();

    // Collect all matched features from selected products
    selectedProducts.forEach((product) => {
      product.matched_features?.forEach((f) => selectedProductFeatures.add(f));
      product.features?.forEach((f) => selectedProductFeatures.add(f.name));
    });

    // Build feature coverage map: feature -> covering products
    const featureCoverage = new Map<string, Product[]>();
    selectedProducts.forEach((product) => {
      const allFeatures = [...(product.matched_features || []), ...(product.features?.map(f => f.name) || [])];
      allFeatures.forEach((feature) => {
        if (!featureCoverage.has(feature)) {
          featureCoverage.set(feature, []);
        }
        if (!featureCoverage.get(feature)!.some(p => p.id === product.id)) {
          featureCoverage.get(feature)!.push(product);
        }
      });
    });

    // Determine status for each required feature
    const requiredStatus = requiredFeatures.map((feature) => {
      const coveringProducts = featureCoverage.get(feature) || [];
      return {
        feature,
        isCovered: coveringProducts.length > 0,
        coveringProducts,
      };
    });

    // Get optional features (from optional categories that are selected)
    const optionalCategories = matchResult.categories.filter((c) => !c.required);
    const optionalFeatures = new Set<string>();
    optionalCategories.forEach((category) => {
      category.products.forEach((product) => {
        // Only include features from selected products in optional categories
        if (selectedProductsMap.has(product.id)) {
          product.features?.forEach((f) => optionalFeatures.add(f.name));
          product.matched_features?.forEach((f) => optionalFeatures.add(f));
        }
      });
    });

    // Also include any features from selected products that are not in required list
    selectedProducts.forEach((product) => {
      [...(product.matched_features || []), ...(product.features?.map(f => f.name) || [])].forEach((f) => {
        if (!requiredFeatures.includes(f)) {
          optionalFeatures.add(f);
        }
      });
    });

    const optionalStatus = Array.from(optionalFeatures).map((feature) => {
      const coveringProducts = featureCoverage.get(feature) || [];
      return {
        feature,
        isCovered: coveringProducts.length > 0,
        coveringProducts,
      };
    });

    const coveredRequiredCount = requiredStatus.filter((s) => s.isCovered).length;
    const allRequiredCovered = coveredRequiredCount === requiredFeatures.length;

    return {
      required: requiredStatus,
      optional: optionalStatus,
      coveredRequiredCount,
      totalRequired: requiredFeatures.length,
      allRequiredCovered,
    };
  }, [selectedProducts, selectedProductsMap, requirements, matchResult.required_features, matchResult.categories]);

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
      {/* Header - Hidden when hideHeader is true (Dashboard Products page) */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#37352f]">Select Products & Preview</h2>
            <p className="text-[#787774] mt-1">
              {matchResult.total_matched} products matched across{" "}
              {matchResult.categories.length} categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onResetSelections && (
              <button
                onClick={onResetSelections}
                className="px-3 py-1.5 text-[#787774] hover:text-[#37352f] border border-[#e9e9e7] hover:border-[#d3d3d0] rounded-md flex items-center gap-1.5 transition-colors"
              >
                <span className="text-sm">↻</span>
                Refresh
              </button>
            )}
            <button
              onClick={onBack}
              className="text-[#787774] hover:text-[#37352f] flex items-center gap-1"
            >
              ← Back to Chat
            </button>
          </div>
        </div>
      )}

      {/* Feature Status Panel */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] overflow-hidden">
        {/* Required Features Section */}
        <div className="p-4 border-b border-[#e9e9e7]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[#37352f] flex items-center gap-2">
              <span className="text-[#0f7b6c]">●</span>
              Required Features
            </h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              featureStatus.allRequiredCovered
                ? "bg-[rgba(15,123,108,0.15)] text-[#0f7b6c]"
                : "bg-[rgba(223,171,1,0.15)] text-[#b8860b]"
            }`}>
              {featureStatus.coveredRequiredCount}/{featureStatus.totalRequired} covered
            </span>
          </div>
          {featureStatus.required.length > 0 ? (
            <div className="space-y-2">
              {featureStatus.required.map(({ feature, isCovered, coveringProducts }) => (
                <div key={feature} className="flex items-start gap-2 text-sm">
                  <span className={`flex-shrink-0 mt-0.5 ${isCovered ? "text-[#0f7b6c]" : "text-[#9b9a97]"}`}>
                    {isCovered ? "✓" : "○"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={isCovered ? "text-[#37352f]" : "text-[#9b9a97]"}>
                      {feature}
                    </span>
                    {isCovered && coveringProducts.length > 0 && (
                      <span className="text-xs text-[#787774] ml-1">
                        (by: {coveringProducts.map(p => p.product_name).join(", ")})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9b9a97]">No required features specified</p>
          )}
        </div>

        {/* Optional Features Section */}
        {featureStatus.optional.length > 0 && (
          <div className="p-4 bg-[#fafafa]">
            <h4 className="text-sm font-semibold text-[#37352f] flex items-center gap-2 mb-3">
              <span className="text-[#2383e2]">◆</span>
              Optional Features
            </h4>
            <div className="flex flex-wrap gap-2">
              {featureStatus.optional.slice(0, 8).map(({ feature, isCovered }) => (
                <span
                  key={feature}
                  className={`px-2 py-1 text-xs rounded-md ${
                    isCovered
                      ? "bg-[rgba(35,131,226,0.15)] text-[#2383e2]"
                      : "bg-[#f0f0f0] text-[#9b9a97]"
                  }`}
                >
                  {isCovered ? "◆" : "◇"} {feature}
                </span>
              ))}
              {featureStatus.optional.length > 8 && (
                <span className="px-2 py-1 text-xs text-[#787774]">
                  +{featureStatus.optional.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status Summary */}
        {!featureStatus.allRequiredCovered && (
          <div className="px-4 py-3 bg-[rgba(223,171,1,0.08)] border-t border-[rgba(223,171,1,0.2)]">
            <div className="flex items-center gap-2 text-sm text-[#b8860b]">
              <span>⚠</span>
              <span>Select products to cover all required features to continue</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Product Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#37352f] text-lg">📦 Product Selection</h3>
          </div>

          {/* Vendor Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVendorFilter("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                vendorFilter === "all"
                  ? "bg-[#37352f] text-white"
                  : "bg-[#f7f6f3] text-[#787774] hover:bg-[#e9e9e7]"
              }`}
            >
              All Vendors
            </button>
            {allVendors.map((vendor) => (
              <button
                key={vendor}
                onClick={() => setVendorFilter(vendor)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  vendorFilter === vendor
                    ? "bg-[#37352f] text-white"
                    : "bg-[#f7f6f3] text-[#787774] hover:bg-[#e9e9e7]"
                }`}
              >
                {vendor}
              </button>
            ))}
          </div>

          {/* Select All Vendor Required Button */}
          {vendorFilter !== "all" && (
            <button
              onClick={handleSelectAllVendorRequired}
              className="w-full px-4 py-2 text-sm font-medium text-[#0f7b6c] bg-[rgba(15,123,108,0.08)] hover:bg-[rgba(15,123,108,0.15)] border border-[rgba(15,123,108,0.2)] rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <span>✓</span>
              Select all {vendorFilter} products for Required Features
            </button>
          )}

          {/* Feature Coverage */}
          <div className="bg-white rounded-md border border-[#e9e9e7] p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-[#e9e9e7] rounded-full h-2">
                <div
                  className="bg-[#37352f] rounded-full h-2 transition-all"
                  style={{ width: `${matchResult.feature_coverage.coverage_percent}%` }}
                />
              </div>
              <span className="text-sm text-[#787774]">
                {matchResult.feature_coverage.coverage_percent}% coverage
              </span>
            </div>
          </div>

          {/* Provider Recommendation Panel */}
          {hasMultipleProviders && (
            <div className="bg-[rgba(223,171,1,0.08)] border border-[rgba(223,171,1,0.2)] rounded-md p-4">
              <div className="flex items-start gap-2">
                <span className="text-[#b8860b] text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#b8860b]">
                    Tip: Select products from the same provider
                  </p>
                  <p className="text-xs text-[#b8860b] mt-1">
                    Using a single provider simplifies API key management, ensures data consistency, and may offer bundle pricing.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {providerCounts.map(({ provider, count, isRecommended }) => (
                      <span
                        key={provider}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isRecommended
                            ? "bg-[rgba(223,171,1,0.2)] text-[#b8860b]"
                            : "bg-[rgba(223,171,1,0.1)] text-[#b8860b]"
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
            <div className="bg-[rgba(15,123,108,0.08)] border border-[rgba(15,123,108,0.2)] rounded-md p-4">
              <div className="flex items-center gap-2">
                <span className="text-[#0f7b6c] text-lg">✓</span>
                <p className="text-sm font-medium text-[#0f7b6c]">
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
                  onSelectionChange={(categoryId, productId, isSelected) =>
                    onSelectionChange(categoryId, productId, isSelected, 'mobile')
                  }
                  recommendedProvider={recommendedProvider}
                  vendorFilter={vendorFilter}
                />

                {/* Backend Section */}
                <EnvironmentSection
                  environment="backend"
                  categories={backendCategories}
                  selections={getSelectionsForEnv('backend')}
                  expandedCategories={expandedCategories}
                  onToggleCategory={toggleCategory}
                  onSelectionChange={(categoryId, productId, isSelected) =>
                    onSelectionChange(categoryId, productId, isSelected, 'backend')
                  }
                  recommendedProvider={recommendedProvider}
                  vendorFilter={vendorFilter}
                />
              </>
            ) : (
              matchResult.categories.map((category) => {
                // Filter products by vendor
                const filteredProducts = filterProductsByVendor(category.products);

                // Skip category if no products after filtering
                if (filteredProducts.length === 0) return null;

                const filteredCategory = {
                  ...category,
                  products: filteredProducts,
                };

                const categorySelections = parsedSelections.single?.get(category.id) ||
                  getSelectedProductIds(selections as SelectionState, category.id);
                return (
                  <CategoryGroup
                    key={category.id}
                    category={filteredCategory}
                    selectedProductIds={categorySelections}
                    isExpanded={expandedCategories.has(category.id)}
                    onToggle={() => toggleCategory(category.id)}
                    onSelect={(productId, isSelected) => {
                      onSelectionChange(category.id, productId, isSelected);
                    }}
                    recommendedProvider={recommendedProvider}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Preview & Export */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#37352f] text-lg">🗺️ Preview & Export</h3>

          {/* Map Preview */}
          <div className="bg-white rounded-md border border-[#e9e9e7] overflow-hidden p-4">
            {featureStatus.allRequiredCovered && requirements ? (
              (() => {
                const selectedCats = isMultiEnvironment
                  ? Object.keys(getSelectionsForEnv('mobile')).filter(
                      (catId) => getSelectionsForEnv('mobile')[catId] !== null
                    )
                  : Object.keys(selections as SelectionState).filter(
                      (catId) => (selections as SelectionState)[catId] !== null
                    );
                const mapProvider = recommendedProvider?.toLowerCase().includes("google")
                  ? "google"
                  : recommendedProvider?.toLowerCase().includes("here")
                  ? "here"
                  : recommendedProvider?.toLowerCase().includes("mapbox")
                  ? "mapbox"
                  : "google";
                const mapKey = `map-${requirements.use_case}-${requirements.region}-${mapProvider}-${selectedCats.join(',')}`;

                return (
                  <MapPreview
                    key={mapKey}
                    useCase={requirements.use_case}
                    region={requirements.region}
                    selectedCategories={selectedCats}
                    provider={mapProvider}
                  />
                );
              })()
            ) : (
              <div className="aspect-video bg-[#f7f6f3] rounded-md flex items-center justify-center">
                <div className="text-center text-[#9b9a97]">
                  <div className="text-5xl mb-3 opacity-50">🗺️</div>
                  <p className="font-medium">Select required products</p>
                  <p className="text-sm">to see the preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Products Summary */}
          {selectedProducts.length > 0 && (
            <div className="bg-white rounded-md border border-[#e9e9e7] p-4">
              <h4 className="font-medium text-[#37352f] mb-3">Selected Products</h4>
              <div className="space-y-3">
                {Object.entries(productsByProvider).map(([provider, products]) => (
                  <div key={provider}>
                    <p className="text-xs font-medium text-[#787774] uppercase mb-1">
                      {provider}
                    </p>
                    <ul className="space-y-1">
                      {products.map((product) => (
                        <li key={product.id} className="flex items-center gap-2 text-sm">
                          <span className="text-[#0f7b6c]">✓</span>
                          <span className="text-[#37352f]">{product.product_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embed Code - Only show when all required are selected */}
          {featureStatus.allRequiredCovered && (
            <EmbedCode
              selectedProducts={selectedProducts}
              onCopy={handleCopyCode}
              copied={copied}
            />
          )}

          {/* Download Button */}
          {featureStatus.allRequiredCovered && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const code = generateFullCode(selectedProducts);
                  handleCopyCode(code);
                }}
                className="flex-1 px-4 py-3 bg-[#f7f6f3] text-[#37352f] rounded-md font-medium hover:bg-[#e9e9e7] transition-colors"
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
                className="flex-1 px-4 py-3 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors"
              >
                Download HTML
              </button>
            </div>
          )}

          {/* Send Report Button */}
          {featureStatus.allRequiredCovered && requirements && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full px-4 py-3 bg-[#0f7b6c] text-white rounded-md font-medium hover:bg-[#0a6459] transition-colors flex items-center justify-center gap-2"
            >
              <span>📧</span>
              Send Report to Email
            </button>
          )}
        </div>
      </div>

      {/* Bottom Actions - Hidden when hideHeader is true (Dashboard Products page) */}
      {!hideHeader && (
        <div className="flex justify-between items-center pt-4 border-t border-[#e9e9e7]">
          <button
            onClick={onBack}
            className="px-4 py-2 text-[#787774] hover:text-[#37352f]"
          >
            ← Back to Chat
          </button>
          <div className="text-sm text-[#787774]">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
          </div>
        </div>
      )}

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
