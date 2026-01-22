"use client";

import { Category, EnvironmentType } from "@/lib/types";
import { detectProductEnvironment } from "@/lib/environmentDetector";
import ProductCard from "./ProductCard";

interface CategoryGroupProps {
  category: Category;
  selectedProductIds: string[];  // Changed: supports multiple selections
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (productId: string, isSelected: boolean) => void;  // Changed: toggle-based
  recommendedProvider?: string | null;
  environment?: EnvironmentType;  // Optional: for multi-environment mode sorting
}

export default function CategoryGroup({
  category,
  selectedProductIds,
  isExpanded,
  onToggle,
  onSelect,
  recommendedProvider = null,
  environment,
}: CategoryGroupProps) {
  const hasSelection = selectedProductIds.length > 0;
  const selectionCount = selectedProductIds.length;

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
    <div className="bg-white rounded-md border border-[#e9e9e7] overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f7f6f3] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={`transform transition-transform text-[#787774] ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#37352f]">{category.name}</h3>
              {category.required && (
                <span className="px-2 py-0.5 bg-[rgba(224,62,62,0.1)] text-[#e03e3e] text-xs font-medium rounded">
                  Required
                </span>
              )}
              {!category.required && (
                <span className="px-2 py-0.5 bg-[#f7f6f3] text-[#787774] text-xs font-medium rounded">
                  Optional
                </span>
              )}
              {category.auto_recommended && (
                <span className="px-2 py-0.5 bg-[rgba(223,171,1,0.15)] text-[#b8860b] text-xs font-medium rounded">
                  💡 {category.auto_recommend_reason || "Recommended"}
                </span>
              )}
            </div>
            <p className="text-sm text-[#787774]">
              {category.products.length} product{category.products.length !== 1 ? "s" : ""} available
              {category.description && ` • ${category.description}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="px-3 py-1 bg-[rgba(15,123,108,0.15)] text-[#0f7b6c] text-sm font-medium rounded-full">
              ✓ {selectionCount} selected
            </span>
          )}
          {category.required && !hasSelection && (
            <span className="px-3 py-1 bg-[rgba(223,171,1,0.15)] text-[#b8860b] text-sm font-medium rounded-full">
              Select products
            </span>
          )}
        </div>
      </button>

      {/* Products List */}
      {isExpanded && (
        <div className="border-t border-[#e9e9e7] p-4 space-y-3">
          {sortedProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={isSelected}
                onSelect={() => onSelect(product.id, !isSelected)}
                selectionType="checkbox"
                isRecommended={recommendedProvider === product.provider && recommendedProvider !== null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
