"use client";

import { useState } from "react";
import { MatchResponse, SelectionState, Category } from "@/lib/types";
import ProductCard from "./ProductCard";
import CategoryGroup from "./CategoryGroup";

interface ProductSelectionProps {
  matchResult: MatchResponse;
  selections: SelectionState;
  onSelectionChange: (categoryId: string, productId: string, isSelected: boolean) => void;
  onPreview: () => void;
  onBack: () => void;
}

/**
 * Gets the array of selected product IDs for a category from SelectionState.
 */
function getSelectedProductIds(selections: SelectionState, categoryId: string): string[] {
  const value = selections[categoryId];
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export default function ProductSelection({
  matchResult,
  selections,
  onSelectionChange,
  onPreview,
  onBack,
}: ProductSelectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(matchResult.categories.filter((c) => c.required).map((c) => c.id))
  );

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

  // Count required categories and selected
  const requiredCategories = matchResult.categories.filter((c) => c.required);
  const selectedRequiredCount = requiredCategories.filter(
    (c) => getSelectedProductIds(selections, c.id).length > 0
  ).length;

  const allRequiredSelected = selectedRequiredCount === requiredCategories.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#37352f]">Recommended Products</h2>
          <p className="text-[#787774] mt-1">
            {matchResult.total_matched} products matched across{" "}
            {matchResult.categories.length} categories
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-[#787774] hover:text-[#37352f] flex items-center gap-1"
        >
          ← Back to Chat
        </button>
      </div>

      {/* Selection Status */}
      <div
        className={`p-4 rounded-md border ${
          allRequiredSelected
            ? "bg-[rgba(15,123,108,0.08)] border-[rgba(15,123,108,0.2)]"
            : "bg-[rgba(223,171,1,0.08)] border-[rgba(223,171,1,0.2)]"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {allRequiredSelected ? (
              <span className="text-[#0f7b6c] text-xl">✓</span>
            ) : (
              <span className="text-[#b8860b] text-xl">⚠</span>
            )}
            <span
              className={`font-medium ${
                allRequiredSelected ? "text-[#0f7b6c]" : "text-[#b8860b]"
              }`}
            >
              {allRequiredSelected
                ? "All required categories selected!"
                : `Select one product from each required category (${selectedRequiredCount}/${requiredCategories.length})`}
            </span>
          </div>
          {allRequiredSelected && (
            <button
              onClick={onPreview}
              className="px-4 py-2 bg-[#37352f] text-white rounded-md font-medium hover:bg-[#2f2d28] transition-colors"
            >
              Continue to Preview →
            </button>
          )}
        </div>
      </div>

      {/* Feature Coverage */}
      <div className="bg-white rounded-md border border-[#e9e9e7] p-4">
        <h3 className="font-medium text-[#37352f] mb-2">Feature Coverage</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-[#e9e9e7] rounded-full h-2">
            <div
              className="bg-[#37352f] rounded-full h-2 transition-all"
              style={{ width: `${matchResult.feature_coverage.coverage_percent}%` }}
            />
          </div>
          <span className="text-sm text-[#787774]">
            {matchResult.feature_coverage.coverage_percent}% (
            {matchResult.feature_coverage.total_covered}/
            {matchResult.feature_coverage.total_required} features)
          </span>
        </div>
        {matchResult.feature_coverage.uncovered_features.length > 0 && (
          <p className="text-sm text-[#b8860b] mt-2">
            Uncovered: {matchResult.feature_coverage.uncovered_features.join(", ")}
          </p>
        )}
      </div>

      {/* Category Groups */}
      <div className="space-y-4">
        {matchResult.categories.map((category) => (
          <CategoryGroup
            key={category.id}
            category={category}
            selectedProductIds={getSelectedProductIds(selections, category.id)}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => toggleCategory(category.id)}
            onSelect={(productId, isSelected) => onSelectionChange(category.id, productId, isSelected)}
          />
        ))}
      </div>

      {/* Bottom Action */}
      <div className="flex justify-between items-center pt-4 border-t border-[#e9e9e7]">
        <button
          onClick={onBack}
          className="px-4 py-2 text-[#787774] hover:text-[#37352f]"
        >
          ← Back to Chat
        </button>
        <button
          onClick={onPreview}
          disabled={!allRequiredSelected}
          className={`px-6 py-3 rounded-md font-medium transition-colors ${
            allRequiredSelected
              ? "bg-[#37352f] text-white hover:bg-[#2f2d28]"
              : "bg-[#e9e9e7] text-[#9b9a97] cursor-not-allowed"
          }`}
        >
          {allRequiredSelected
            ? "Continue to Preview →"
            : `Select ${requiredCategories.length - selectedRequiredCount} more required product(s)`}
        </button>
      </div>
    </div>
  );
}
