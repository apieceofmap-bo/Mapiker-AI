"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCatalog, CatalogProduct, CategoryMeta, ProviderMeta } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import CreateProjectModal from "@/components/catalog/CreateProjectModal";
import { SelectionState } from "@/lib/types";

export default function CatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [providers, setProviders] = useState<ProviderMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Selected products for "Start with these" flow - Map stores full product objects
  const [selectedProducts, setSelectedProducts] = useState<Map<string, CatalogProduct>>(new Map());
  const [selectionMode, setSelectionMode] = useState(false);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch catalog data
  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCatalog({
        provider: selectedProvider || undefined,
        category: selectedCategory || undefined,
        search: debouncedSearch || undefined,
      });
      setProducts(data.products);
      setCategories(data.categories);
      setProviders(data.providers);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      setError("Failed to load catalog. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedProvider, selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const toggleProductSelection = (product: CatalogProduct) => {
    setSelectedProducts((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, product);
      }
      return next;
    });
  };

  // Get selected product objects - now returns all selected products regardless of current filter
  const getSelectedProductObjects = (): CatalogProduct[] => {
    return Array.from(selectedProducts.values());
  };

  const handleStartWithSelected = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/login?redirect=/catalog");
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateProject = async (projectName: string, description?: string) => {
    if (!user) throw new Error("Please log in to create a project");

    const selectedProductObjects = getSelectedProductObjects();

    // Group products by sub_category to create categories
    const categoryMap: Record<string, CatalogProduct[]> = {};
    selectedProductObjects.forEach((product) => {
      const categoryName = product.sub_category || "Other";
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = [];
      }
      categoryMap[categoryName].push(product);
    });

    // Build match_result structure compatible with existing code
    const categories = Object.entries(categoryMap).map(([categoryName, products]) => {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, "-");
      return {
        id: categoryId,
        name: categoryName,
        required: false,
        description: `Products in ${categoryName} category`,
        products: products.map((p) => ({
          id: p.id,
          provider: p.provider,
          product_name: p.product_name,
          description: p.description,
          key_features: p.key_features,
          matched_features: [], // No matching for catalog selection
          match_score: 100, // Default score for manually selected
          document_url: p.document_url,
          data_format: p.data_format,
        })),
      };
    });

    const matchResult = {
      categories,
      total_matched: selectedProductObjects.length,
      feature_coverage: {
        total_required: 0,
        total_covered: 0,
        coverage_percent: 100,
        covered_features: [],
        uncovered_features: [],
        feature_products: {},
      },
      required_features: [],
    };

    // Build selection state: use unique keys for all selected products
    // Format: categoryId or categoryId_index -> productId
    const selectionState: SelectionState = {};
    categories.forEach((category) => {
      category.products.forEach((product, index) => {
        // First product uses category ID, rest use categoryId_index
        const key = index === 0 ? category.id : `${category.id}_${index}`;
        selectionState[key] = product.id;
      });
    });

    // Create project in Supabase
    const { data, error: dbError } = await supabase.from("projects").insert({
      user_id: user.id,
      name: projectName,
      description: description || null,
      use_case: "Custom Selection",
      use_case_description: `Manually selected ${selectedProductObjects.length} products from catalog`,
      required_features: [],
      application: ["web-app"],
      region: "Global",
      additional_notes: null,
      selected_products: selectionState,
      match_result: matchResult,
      is_multi_environment: false,
      pricing_calculated: false,
      pricing_data: null,
      quality_report_requested: false,
      quality_report_countries: [],
      quality_report_features: [],
      current_stage: 3, // Start at stage 3 (skip to pricing since products already selected)
      status: "in_progress",
    }).select().single();

    if (dbError) {
      console.error("Failed to create project:", dbError);
      throw new Error(dbError.message);
    }

    // Navigate to the dashboard to see the new project
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#e9e9e7]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#37352f]">Product Catalog</h1>
              <p className="text-[#787774] text-sm mt-1">
                Browse all {providers.reduce((sum, p) => sum + p.count, 0)} map products from Google, HERE, and Mapbox
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectionMode && selectedProducts.size > 0 && (
                <button
                  onClick={handleStartWithSelected}
                  className="px-4 py-2 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors text-sm"
                >
                  Start with {selectedProducts.size} selected →
                </button>
              )}
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedProducts(new Map());
                }}
                className={`px-4 py-2 font-medium rounded-md transition-colors text-sm ${
                  selectionMode
                    ? "bg-[#f7f6f3] text-[#37352f] border border-[#e9e9e7]"
                    : "bg-[#37352f] hover:bg-[#2f2d28] text-white"
                }`}
              >
                {selectionMode ? "Cancel Selection" : "Select Products"}
              </button>
              <Link
                href="/project/new"
                className="px-4 py-2 border border-[#e9e9e7] hover:bg-[#f7f6f3] text-[#37352f] font-medium rounded-md transition-colors text-sm"
              >
                Use AI Matching
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search products, features, or use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b9a97]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9a97] hover:text-[#37352f]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            categories={categories}
            providers={providers}
            selectedProvider={selectedProvider}
            selectedCategory={selectedCategory}
            onProviderChange={setSelectedProvider}
            onCategoryChange={setSelectedCategory}
          />

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results count and active filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-[#787774]">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing <span className="font-medium text-[#37352f]">{products.length}</span> products
                    {(selectedProvider || selectedCategory || debouncedSearch) && (
                      <span className="ml-2">
                        {selectedProvider && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f7f6f3] rounded text-xs mr-1">
                            {selectedProvider}
                            <button onClick={() => setSelectedProvider(null)} className="hover:text-[#e03e3e]">×</button>
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f7f6f3] rounded text-xs mr-1">
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory(null)} className="hover:text-[#e03e3e]">×</button>
                          </span>
                        )}
                        {debouncedSearch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f7f6f3] rounded text-xs">
                            &quot;{debouncedSearch}&quot;
                            <button onClick={() => setSearchQuery("")} className="hover:text-[#e03e3e]">×</button>
                          </span>
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
              {selectionMode && (
                <div className="text-sm text-[#787774]">
                  {selectedProducts.size} selected
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md">
                <p className="text-[#e03e3e] text-sm">{error}</p>
                <button onClick={fetchCatalog} className="mt-2 text-sm text-[#e03e3e] underline">
                  Try again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-[#37352f] mb-2">No products found</h3>
                <p className="text-[#787774] text-sm mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSelectedProvider(null);
                    setSelectedCategory(null);
                    setSearchQuery("");
                  }}
                  className="text-sm text-[#2eaadc] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Product List */}
            {!loading && products.length > 0 && (
              <div className="space-y-3">
                {products.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.has(product.id)}
                    onSelect={() => toggleProductSelection(product)}
                    selectable={selectionMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedProducts={getSelectedProductObjects()}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
