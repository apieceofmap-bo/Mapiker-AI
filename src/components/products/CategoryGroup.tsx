"use client";

import { Category, EnvironmentType } from "@/lib/types";
import { detectProductEnvironment } from "@/lib/environmentDetector";
import ProductCard from "./ProductCard";

interface CategoryGroupProps {
  category: Category;
  selectedProductId: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (productId: string | null) => void;
  recommendedProvider?: string | null;
  environment?: EnvironmentType;  // Optional: for multi-environment mode sorting
}

export default function CategoryGroup({
  category,
  selectedProductId,
  isExpanded,
  onToggle,
  onSelect,
  recommendedProvider = null,
  environment,
}: CategoryGroupProps) {
  const hasSelection = selectedProductId !== null;

  // Get environment priority for sorting (SDK first for mobile, API first for backend)
  const getEnvironmentPriority = (dataFormat: string, productName: string): number => {
    if (!environment) return 0; // No environment sorting if not specified

    const productEnv = detectProductEnvironment(dataFormat, productName);

    if (environment === 'mobile') {
      // Mobile: SDK first (0), both (1), API last (2)
      if (productEnv === 'mobile') return 0;
      if (productEnv === 'both') return 1;
      return 2;
    } else {
      // Backend: API first (0), both (1), SDK last (2)
      if (productEnv === 'backend') return 0;
      if (productEnv === 'both') return 1;
      return 2;
    }
  };

  // Sort products with environment priority first (if specified)
  const sortedProducts = [...category.products].sort((a, b) => {
    // FIRST: Environment-based priority (SDK vs API) - only when environment is specified
    if (environment) {
      const envPriorityA = getEnvironmentPriority(a.data_format, a.product_name);
      const envPriorityB = getEnvironmentPriority(b.data_format, b.product_name);
      if (envPriorityA !== envPriorityB) {
        return envPriorityA - envPriorityB;
      }
    }

    // Second: by number of matched features (more is better)
    const aMatchedCount = a.matched_features?.length || 0;
    const bMatchedCount = b.matched_features?.length || 0;
    if (aMatchedCount !== bMatchedCount) {
      return bMatchedCount - aMatchedCount;
    }

    // Third: recommended provider gets priority
    if (recommendedProvider) {
      const aIsRecommended = a.provider === recommendedProvider;
      const bIsRecommended = b.provider === recommendedProvider;
      if (aIsRecommended && !bIsRecommended) return -1;
      if (!aIsRecommended && bIsRecommended) return 1;
    }

    // Fourth: by match score
    return b.match_score - a.match_score;
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={`transform transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
              {category.required && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                  Required
                </span>
              )}
              {!category.required && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  Optional
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {category.products.length} product{category.products.length !== 1 ? "s" : ""} available
              {category.description && ` • ${category.description}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              ✓ Selected
            </span>
          )}
          {category.required && !hasSelection && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              Select 1
            </span>
          )}
        </div>
      </button>

      {/* Products List */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-3">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProductId === product.id}
              onSelect={() =>
                onSelect(selectedProductId === product.id ? null : product.id)
              }
              selectionType={category.required ? "radio" : "checkbox"}
              isRecommended={recommendedProvider === product.provider && recommendedProvider !== null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
