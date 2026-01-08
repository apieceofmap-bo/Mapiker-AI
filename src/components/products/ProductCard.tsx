"use client";

import { useState } from "react";
import { Product, SimilarProduct } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  selectionType: "radio" | "checkbox";
  isRecommended?: boolean;
}

// Provider colors
const providerColors: Record<string, { bg: string; text: string; border: string }> = {
  "HERE Technologies": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Google: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Mapbox: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

export default function ProductCard({
  product,
  isSelected,
  onSelect,
  selectionType,
  isRecommended = false,
}: ProductCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showSimilarComparison, setShowSimilarComparison] = useState(false);

  const colors = providerColors[product.provider] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  // Check if description is long enough to need expansion
  const isDescriptionLong = product.description.length > 150;

  // Get similar products from the product data
  const similarProducts = product.similar_products || [];

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : isRecommended
          ? "border-amber-300 bg-amber-50/30 hover:border-amber-400"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Selection indicator */}
        <div className="mt-1">
          {selectionType === "radio" ? (
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? "border-blue-500" : "border-gray-300"
              }`}
            >
              {isSelected && <div className="w-3 h-3 rounded-full bg-blue-500" />}
            </div>
          ) : (
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-800">{product.product_name}</h4>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}
            >
              {product.provider}
            </span>
            {isRecommended && !isSelected && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700">
                ★ Same Provider
              </span>
            )}
            {product.data_format && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                {product.data_format}
              </span>
            )}
          </div>

          {/* Expandable Description */}
          <div className="mt-1">
            <p
              className={`text-sm text-gray-600 ${
                !isDescriptionExpanded && isDescriptionLong ? "line-clamp-2" : ""
              }`}
            >
              {product.description}
            </p>
            {isDescriptionLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                {isDescriptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Matched Features */}
          {product.matched_features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.matched_features.map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          )}

          {/* Key Features (limited) */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.key_features.slice(0, 5).map((feature) => (
              <span
                key={feature}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {feature}
              </span>
            ))}
            {product.key_features.length > 5 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{product.key_features.length - 5} more
              </span>
            )}
          </div>

          {/* Similar Products Comparison */}
          {similarProducts.length > 0 && (
            <div className="mt-3 border-t border-gray-100 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSimilarComparison(!showSimilarComparison);
                }}
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>🔄</span>
                {showSimilarComparison ? "Hide" : "Compare"} similar products ({similarProducts.length})
              </button>

              {showSimilarComparison && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg text-xs">
                  <p className="font-medium text-amber-800 mb-2">
                    Similar products with different pricing models:
                  </p>
                  <div className="space-y-2">
                    {similarProducts.map((similar) => (
                      <div key={similar.id} className="p-2 bg-white rounded border border-amber-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{similar.product_name}</span>
                          <span className="text-gray-500">Score: {Math.round(similar.match_score)}</span>
                        </div>
                        <p className="text-gray-500 mt-1 line-clamp-2">{similar.description}</p>
                        {/* Highlight key differences */}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {similar.key_features.slice(0, 3).map((f) => (
                            <span key={f} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-amber-700 italic">
                    💡 Tip: Session-based pricing is cost-effective for interactive searches.
                    Request-based pricing is better for one-time lookups.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Document Link */}
          {product.document_url && (
            <a
              href={product.document_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
            >
              View Documentation →
            </a>
          )}
        </div>

        {/* Match Score */}
        <div className="text-right">
          <div className="text-sm font-medium text-gray-800">
            {Math.round(product.match_score)}
          </div>
          <div className="text-xs text-gray-500">score</div>
        </div>
      </div>
    </div>
  );
}
