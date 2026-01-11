"use client";

import { useState } from "react";
import { CatalogProduct } from "@/lib/api";

interface CatalogProductCardProps {
  product: CatalogProduct;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

const providerColors: Record<string, { bg: string; text: string }> = {
  "HERE Technologies": { bg: "bg-[rgba(15,123,108,0.1)]", text: "text-[#0f7b6c]" },
  Google: { bg: "bg-[rgba(46,170,220,0.1)]", text: "text-[#2eaadc]" },
  Mapbox: { bg: "bg-[rgba(155,89,182,0.1)]", text: "text-[#9b59b6]" },
};

export default function CatalogProductCard({
  product,
  isSelected = false,
  onSelect,
  selectable = false,
}: CatalogProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = providerColors[product.provider] || {
    bg: "bg-[#f7f6f3]",
    text: "text-[#787774]",
  };

  const isDescriptionLong = product.description.length > 150;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={`p-4 rounded-lg border transition-all ${
        selectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-[#37352f] bg-[#f7f6f3]"
          : "border-[#e9e9e7] hover:border-[#d3d3d0] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox (only if selectable) */}
        {selectable && (
          <div className="mt-0.5">
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
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-[#37352f] text-sm">{product.product_name}</h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}>
              {product.provider}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#f7f6f3] text-[#787774]">
              {product.sub_category}
            </span>
          </div>

          {/* Description */}
          <div className="mt-1">
            <p className={`text-sm text-[#787774] ${!isExpanded && isDescriptionLong ? "line-clamp-2" : ""}`}>
              {product.description}
            </p>
            {isDescriptionLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs text-[#37352f] hover:underline mt-1"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {/* Key Features */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.key_features.slice(0, 5).map((feature) => (
              <span key={feature} className="px-2 py-0.5 bg-[#f7f6f3] text-[#787774] text-xs rounded">
                {feature}
              </span>
            ))}
            {product.key_features.length > 5 && (
              <span className="px-2 py-0.5 text-[#9b9a97] text-xs">
                +{product.key_features.length - 5} more
              </span>
            )}
          </div>

          {/* Use Cases */}
          {product.suitable_for?.use_cases && product.suitable_for.use_cases.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.suitable_for.use_cases.slice(0, 3).map((useCase) => (
                <span key={useCase} className="px-2 py-0.5 bg-[rgba(46,170,220,0.1)] text-[#2eaadc] text-xs rounded">
                  {useCase}
                </span>
              ))}
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

        {/* Data Format */}
        <div className="text-right">
          <span className="px-2 py-1 bg-[#f7f6f3] text-[#787774] text-xs rounded">
            {product.data_format}
          </span>
        </div>
      </div>
    </div>
  );
}
