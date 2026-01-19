"use client";

import { useState } from "react";
import { Category, SelectionState, EnvironmentType } from "@/lib/types";
import { ENVIRONMENT_SECTIONS } from "@/lib/environmentDetector";
import CategoryGroup from "./CategoryGroup";

interface EnvironmentSectionProps {
  environment: EnvironmentType;
  categories: Category[];
  selections: SelectionState;
  expandedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onSelectionChange: (categoryId: string, productId: string, isSelected: boolean) => void;
  recommendedProvider: string | null;
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

export default function EnvironmentSection({
  environment,
  categories,
  selections,
  expandedCategories,
  onToggleCategory,
  onSelectionChange,
  recommendedProvider,
}: EnvironmentSectionProps) {
  const sectionInfo = ENVIRONMENT_SECTIONS[environment];

  // Count selections in this environment
  const selectedCount = Object.values(selections).filter(v => v !== null).length;
  const requiredCount = categories.filter(c => c.required).length;
  const selectedRequiredCount = categories.filter(
    c => c.required && selections[c.id] !== null
  ).length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{sectionInfo.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {sectionInfo.label}
              </h3>
              <p className="text-sm text-gray-500">{sectionInfo.description}</p>
            </div>
          </div>

          {/* Selection Status */}
          <div className="flex items-center gap-2">
            {selectedRequiredCount === requiredCount && requiredCount > 0 ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                {selectedCount} selected
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                {selectedRequiredCount}/{requiredCount} required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Groups */}
      <div className="p-4 space-y-3 bg-white">
        {categories.length > 0 ? (
          categories.map(category => (
            <CategoryGroup
              key={`${environment}-${category.id}`}
              category={category}
              selectedProductIds={getSelectedProductIds(selections, category.id)}
              isExpanded={expandedCategories.has(`${environment}-${category.id}`)}
              onToggle={() => onToggleCategory(`${environment}-${category.id}`)}
              onSelect={(productId, isSelected) => onSelectionChange(category.id, productId, isSelected)}
              recommendedProvider={recommendedProvider}
              environment={environment}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No products available for this environment</p>
          </div>
        )}
      </div>
    </div>
  );
}
