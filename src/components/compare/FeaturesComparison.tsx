"use client";

import { useState, useEffect } from "react";
import { Project, SelectionState, MatchResponse } from "@/lib/types";
import { getCatalog, CatalogProduct } from "@/lib/api";

interface FeaturesComparisonProps {
  projects: Project[];
}

interface SelectedProduct {
  id: string;
  provider: string;
  product_name: string;
  categoryId: string;
  categoryName: string;  // Original category from match_result
  featureCategory: string;  // Feature category from catalog API
  features: string[];  // Feature names extracted from FeatureDetail[]
  matched_features: string[];
}

// Extract selected product IDs from a project
function getSelectedProductIds(project: Project): string[] {
  if (!project.match_result || !project.selected_products) return [];

  const productIds: string[] = [];
  const selectionState = project.selected_products as SelectionState;
  const matchResult = project.match_result as MatchResponse;

  matchResult.categories.forEach((category) => {
    Object.entries(selectionState).forEach(([key, value]) => {
      if (!value) return;
      if (!key.startsWith(category.id)) return;

      const ids = Array.isArray(value) ? value : [value];
      ids.forEach((id) => {
        if (!productIds.includes(id)) {
          productIds.push(id);
        }
      });
    });
  });

  return productIds;
}

// Get selected products with feature category from catalog
function getSelectedProducts(
  project: Project,
  featureCategoryMap: Map<string, string>
): SelectedProduct[] {
  if (!project.match_result) return [];

  const selected: SelectedProduct[] = [];
  const selectionState = project.selected_products as SelectionState;
  const matchResult = project.match_result as MatchResponse;

  matchResult.categories.forEach((category) => {
    Object.entries(selectionState).forEach(([key, value]) => {
      if (!value) return;
      if (!key.startsWith(category.id)) return;

      const productIds = Array.isArray(value) ? value : [value];

      productIds.forEach((productId) => {
        const product = category.products.find((p) => p.id === productId);
        if (product && !selected.some((s) => s.id === product.id)) {
          // Use feature_category from catalog API, fallback to original category name
          const featureCategory = featureCategoryMap.get(product.id) || category.name;

          selected.push({
            id: product.id,
            provider: product.provider,
            product_name: product.product_name,
            categoryId: category.id,
            categoryName: category.name,
            featureCategory,
            features: product.features?.map(f => f.name) || [],
            matched_features: product.matched_features || [],
          });
        }
      });
    });
  });

  return selected;
}

// Get all unique features across products in a category
function getCategoryFeatures(allProducts: SelectedProduct[][]): string[] {
  const features = new Set<string>();

  allProducts.forEach((products) => {
    products.forEach((product) => {
      product.features.forEach((f) => features.add(f));
    });
  });

  return Array.from(features).sort();
}

export default function FeaturesComparison({ projects }: FeaturesComparisonProps) {
  const [featureCategoryMap, setFeatureCategoryMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch catalog to get feature_category mapping
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const catalogData = await getCatalog();
        const map = new Map<string, string>();

        catalogData.products.forEach((product: CatalogProduct) => {
          if (product.feature_category) {
            map.set(product.id, product.feature_category);
          }
        });

        setFeatureCategoryMap(map);
      } catch (error) {
        console.error("Failed to fetch catalog for feature categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Check if any project has match result
  const hasMatchResults = projects.some((p) => p.match_result);

  if (!hasMatchResults) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">&#x1F4E6;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          No product selection available
        </h3>
        <p className="text-sm text-[#787774]">
          Complete the product selection step for at least one project to see the comparison.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f] mx-auto mb-3"></div>
        <p className="text-sm text-[#787774]">Loading feature categories...</p>
      </div>
    );
  }

  // Get selected products for each project (with feature_category from catalog)
  const projectProducts = projects.map((project) => ({
    project,
    products: getSelectedProducts(project, featureCategoryMap),
  }));

  // Get all unique feature categories across all projects
  const allFeatureCategories = new Set<string>();
  projectProducts.forEach(({ products }) => {
    products.forEach((p) => allFeatureCategories.add(p.featureCategory));
  });
  const sortedCategories = Array.from(allFeatureCategories).sort();

  return (
    <div>
      {/* Project Info Header - Region & Required Features */}
      <div className="p-4 border-b border-[#e9e9e7] bg-[#fafafa]">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
          {projects.map((project, index) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-[#37352f] truncate">{project.name}</span>
              </div>
              <div className="pl-7 space-y-1">
                <div className="flex items-center gap-1 text-xs text-[#787774]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Region: <span className="text-[#37352f] font-medium">{project.region || "Global"}</span></span>
                </div>
                {project.required_features && project.required_features.length > 0 && (
                  <div className="text-xs text-[#787774]">
                    <span>Required: </span>
                    <span className="text-[#37352f]">
                      {project.required_features.slice(0, 3).join(", ")}
                      {project.required_features.length > 3 && ` +${project.required_features.length - 3} more`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Product Summary */}
      <div className="p-4 border-b border-[#e9e9e7]">
        <h3 className="text-sm font-semibold text-[#37352f] mb-3">Selected Product Summary</h3>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
          {projectProducts.map(({ project, products }, index) => (
            <div key={project.id} className="bg-[#f7f6f3] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-[#37352f] truncate">{project.name}</span>
              </div>
              <div className="text-lg font-bold text-[#37352f] mb-2">{products.length} <span className="text-sm font-normal text-[#787774]">products</span></div>

              {/* Product List */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {products.map((p) => (
                  <div key={p.id} className="flex items-start gap-1.5 text-xs">
                    <span className="text-[#0f7b6c] mt-0.5">&#x2713;</span>
                    <div>
                      <span className="text-[#37352f] font-medium">{p.product_name}</span>
                      <span className="text-[#9b9a97] ml-1">({p.provider})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Category Comparison */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#37352f] mb-3">Feature Comparison by Category</h3>

        <div className="space-y-6">
          {sortedCategories.map((featureCategory) => {
            // Get products for this feature category from each project
            const categoryProducts = projectProducts.map(({ products }) =>
              products.filter((p) => p.featureCategory === featureCategory)
            );

            // Get all unique features in this category
            const categoryFeatures = getCategoryFeatures(categoryProducts);

            // Skip if no features to compare
            if (categoryFeatures.length === 0) return null;

            return (
              <div key={featureCategory} className="border border-[#e9e9e7] rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-[#f7f6f3] px-4 py-2 border-b border-[#e9e9e7]">
                  <h4 className="text-sm font-semibold text-[#37352f]">{featureCategory}</h4>
                </div>

                {/* Products in this category per project */}
                <div className="px-4 py-2 border-b border-[#e9e9e7] bg-white">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `160px repeat(${projects.length}, 1fr)` }}>
                    <div className="text-xs text-[#787774] font-medium">Products</div>
                    {categoryProducts.map((products, idx) => (
                      <div key={idx} className="text-xs text-[#37352f]">
                        {products.length > 0 ? (
                          products.map((p) => (
                            <div key={p.id} className="mb-1">
                              <span className="font-medium">{p.product_name}</span>
                              <span className="text-[#9b9a97] ml-1">({p.provider})</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[#9b9a97]">No product selected</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature comparison table */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#e9e9e7] bg-[#fafafa]">
                      <th className="text-left py-2 px-4 text-[#787774] font-medium w-40">Feature</th>
                      {projects.map((project, idx) => (
                        <th key={project.id} className="text-center py-2 px-2 text-[#787774] font-medium">
                          Project {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryFeatures.slice(0, 10).map((feature, featureIdx) => (
                      <tr key={feature} className={featureIdx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                        <td className="py-2 px-4 text-[#37352f]">{feature}</td>
                        {categoryProducts.map((products, idx) => {
                          // Check if any product in this project has this feature
                          const hasFeature = products.some((p) =>
                            p.features.includes(feature) || p.matched_features.includes(feature)
                          );
                          return (
                            <td key={idx} className="text-center py-2 px-2">
                              {hasFeature ? (
                                <span className="text-[#0f7b6c] font-bold">&#x2713;</span>
                              ) : (
                                <span className="text-[#d3d3d0]">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {categoryFeatures.length > 10 && (
                  <div className="px-4 py-2 text-xs text-[#787774] bg-[#fafafa] border-t border-[#e9e9e7]">
                    +{categoryFeatures.length - 10} more features
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
