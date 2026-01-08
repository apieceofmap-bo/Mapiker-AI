"use client";

import { useState } from "react";
import { MatchResponse, SelectionState, Category } from "@/lib/types";
import ProductCard from "./ProductCard";
import CategoryGroup from "./CategoryGroup";

interface ProductSelectionProps {
  matchResult: MatchResponse;
  selections: SelectionState;
  onSelectionChange: (categoryId: string, productId: string | null) => void;
  onPreview: () => void;
  onBack: () => void;
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
    (c) => selections[c.id] !== null
  ).length;

  const allRequiredSelected = selectedRequiredCount === requiredCategories.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Recommended Products</h2>
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

      {/* Selection Status */}
      <div
        className={`p-4 rounded-lg border ${
          allRequiredSelected
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-center justify-between">
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
                ? "All required categories selected!"
                : `Select one product from each required category (${selectedRequiredCount}/${requiredCategories.length})`}
            </span>
          </div>
          {allRequiredSelected && (
            <button
              onClick={onPreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue to Preview →
            </button>
          )}
        </div>
      </div>

      {/* Feature Coverage */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-800 mb-2">Feature Coverage</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all"
              style={{ width: `${matchResult.feature_coverage.coverage_percent}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {matchResult.feature_coverage.coverage_percent}% (
            {matchResult.feature_coverage.total_covered}/
            {matchResult.feature_coverage.total_required} features)
          </span>
        </div>
        {matchResult.feature_coverage.uncovered_features.length > 0 && (
          <p className="text-sm text-amber-600 mt-2">
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
            selectedProductId={selections[category.id]}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => toggleCategory(category.id)}
            onSelect={(productId) => onSelectionChange(category.id, productId)}
          />
        ))}
      </div>

      {/* Bottom Action */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Chat
        </button>
        <button
          onClick={onPreview}
          disabled={!allRequiredSelected}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            allRequiredSelected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
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
