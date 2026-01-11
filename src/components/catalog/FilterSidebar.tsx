"use client";

import { CategoryMeta, ProviderMeta } from "@/lib/api";

interface FilterSidebarProps {
  categories: CategoryMeta[];
  providers: ProviderMeta[];
  selectedProvider: string | null;
  selectedCategory: string | null;
  onProviderChange: (provider: string | null) => void;
  onCategoryChange: (category: string | null) => void;
}

const providerColors: Record<string, string> = {
  "HERE Technologies": "text-[#0f7b6c]",
  Google: "text-[#2eaadc]",
  Mapbox: "text-[#9b59b6]",
};

export default function FilterSidebar({
  categories,
  providers,
  selectedProvider,
  selectedCategory,
  onProviderChange,
  onCategoryChange,
}: FilterSidebarProps) {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-4 space-y-6">
        {/* Providers Filter */}
        <div>
          <h3 className="text-sm font-semibold text-[#37352f] mb-3">Providers</h3>
          <div className="space-y-1">
            <button
              onClick={() => onProviderChange(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedProvider === null
                  ? "bg-[#f7f6f3] text-[#37352f] font-medium"
                  : "text-[#787774] hover:bg-[#f7f6f3]"
              }`}
            >
              All Providers
            </button>
            {providers.map((provider) => (
              <button
                key={provider.name}
                onClick={() => onProviderChange(provider.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  selectedProvider === provider.name
                    ? "bg-[#f7f6f3] font-medium"
                    : "hover:bg-[#f7f6f3]"
                } ${providerColors[provider.name] || "text-[#787774]"}`}
              >
                <span>{provider.name}</span>
                <span className="text-xs text-[#9b9a97]">{provider.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Filter */}
        <div>
          <h3 className="text-sm font-semibold text-[#37352f] mb-3">Categories</h3>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === null
                  ? "bg-[#f7f6f3] text-[#37352f] font-medium"
                  : "text-[#787774] hover:bg-[#f7f6f3]"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                  selectedCategory === category.name
                    ? "bg-[#f7f6f3] text-[#37352f] font-medium"
                    : "text-[#787774] hover:bg-[#f7f6f3]"
                }`}
              >
                <span className="truncate">{category.name}</span>
                <span className="text-xs text-[#9b9a97] ml-2">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedProvider || selectedCategory) && (
          <button
            onClick={() => {
              onProviderChange(null);
              onCategoryChange(null);
            }}
            className="w-full px-3 py-2 text-sm text-[#e03e3e] hover:bg-[rgba(224,62,62,0.08)] rounded-md transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
