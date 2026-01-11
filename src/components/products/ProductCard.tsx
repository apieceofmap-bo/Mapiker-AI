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

// Provider colors - Notion style
const providerColors: Record<string, { bg: string; text: string; border: string }> = {
  "HERE Technologies": { bg: "bg-[rgba(15,123,108,0.1)]", text: "text-[#0f7b6c]", border: "border-[rgba(15,123,108,0.2)]" },
  Google: { bg: "bg-[rgba(46,170,220,0.1)]", text: "text-[#2eaadc]", border: "border-[rgba(46,170,220,0.2)]" },
  Mapbox: { bg: "bg-[rgba(155,89,182,0.1)]", text: "text-[#9b59b6]", border: "border-[rgba(155,89,182,0.2)]" },
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
    bg: "bg-[#f7f6f3]",
    text: "text-[#787774]",
    border: "border-[#e9e9e7]",
  };

  // Check if description is long enough to need expansion
  const isDescriptionLong = product.description.length > 150;

  // Get similar products from the product data
  const similarProducts = product.similar_products || [];

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-[#37352f] bg-[#f7f6f3]"
          : isRecommended
          ? "border-[rgba(223,171,1,0.5)] bg-[rgba(223,171,1,0.05)] hover:border-[rgba(223,171,1,0.7)]"
          : "border-[#e9e9e7] hover:border-[#d3d3d0] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Selection indicator */}
        <div className="mt-0.5">
          {selectionType === "radio" ? (
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isSelected ? "border-[#37352f]" : "border-[#d3d3d0]"
              }`}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-[#37352f]" />}
            </div>
          ) : (
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                isSelected ? "border-[#37352f] bg-[#37352f]" : "border-[#d3d3d0]"
              }`}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
            <h4 className="font-semibold text-[#37352f] text-sm">{product.product_name}</h4>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}
            >
              {product.provider}
            </span>
            {isRecommended && !isSelected && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-[rgba(223,171,1,0.15)] text-[#b8860b]">
                ★ Same Provider
              </span>
            )}
            {product.data_format && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#f7f6f3] text-[#787774]">
                {product.data_format}
              </span>
            )}
          </div>

          {/* Expandable Description */}
          <div className="mt-1">
            <p
              className={`text-sm text-[#787774] ${
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
                className="text-xs text-[#37352f] hover:underline mt-1"
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
                  className="px-2 py-0.5 bg-[rgba(15,123,108,0.1)] text-[#0f7b6c] text-xs rounded-full"
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
                className="px-2 py-0.5 bg-[#f7f6f3] text-[#787774] text-xs rounded"
              >
                {feature}
              </span>
            ))}
            {product.key_features.length > 5 && (
              <span className="px-2 py-0.5 text-[#9b9a97] text-xs">
                +{product.key_features.length - 5} more
              </span>
            )}
          </div>

          {/* Similar Products Comparison */}
          {similarProducts.length > 0 && (
            <div className="mt-3 border-t border-[#e9e9e7] pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSimilarComparison(!showSimilarComparison);
                }}
                className="text-xs text-[#b8860b] hover:text-[#996f00] flex items-center gap-1"
              >
                <span>🔄</span>
                {showSimilarComparison ? "Hide" : "Compare"} similar products ({similarProducts.length})
              </button>

              {showSimilarComparison && (
                <div className="mt-2 p-3 bg-[rgba(223,171,1,0.08)] rounded-md text-xs">
                  <p className="font-medium text-[#b8860b] mb-2">
                    Similar products with different pricing models:
                  </p>
                  <div className="space-y-2">
                    {similarProducts.map((similar) => (
                      <div key={similar.id} className="p-2 bg-white rounded border border-[rgba(223,171,1,0.2)]">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#37352f]">{similar.product_name}</span>
                          <span className="text-[#9b9a97]">Score: {Math.round(similar.match_score)}</span>
                        </div>
                        <p className="text-[#787774] mt-1 line-clamp-2">{similar.description}</p>
                        {/* Highlight key differences */}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {similar.key_features.slice(0, 3).map((f) => (
                            <span key={f} className="px-1.5 py-0.5 bg-[#f7f6f3] text-[#787774] rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[#b8860b] italic">
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
              className="inline-flex items-center gap-1 text-xs text-[#2eaadc] hover:underline mt-2"
            >
              View Documentation →
            </a>
          )}
        </div>

        {/* Match Score */}
        <div className="text-right">
          <div className="text-sm font-medium text-[#37352f]">
            {Math.round(product.match_score)}
          </div>
          <div className="text-xs text-[#9b9a97]">score</div>
        </div>
      </div>
    </div>
  );
}
