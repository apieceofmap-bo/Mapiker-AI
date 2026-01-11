"use client";

import { Project, SelectionState, Product } from "@/lib/types";

interface FeaturesComparisonProps {
  projects: Project[];
}

interface SelectedProduct {
  id: string;
  provider: string;
  product_name: string;
  categoryId: string;
  categoryName: string;
}

function getSelectedProducts(project: Project): SelectedProduct[] {
  if (!project.match_result) return [];

  const selected: SelectedProduct[] = [];
  const selectionState = project.selected_products as SelectionState;

  project.match_result.categories.forEach((category) => {
    // Check all possible selection keys for this category
    Object.entries(selectionState).forEach(([key, productId]) => {
      if (!productId) return;
      if (!key.startsWith(category.id)) return;

      const product = category.products.find((p) => p.id === productId);
      if (product) {
        selected.push({
          id: product.id,
          provider: product.provider,
          product_name: product.product_name,
          categoryId: category.id,
          categoryName: category.name,
        });
      }
    });
  });

  return selected;
}

export default function FeaturesComparison({ projects }: FeaturesComparisonProps) {
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

  // Get all unique categories across all projects
  const allCategories = new Map<string, string>();
  projects.forEach((project) => {
    project.match_result?.categories.forEach((cat) => {
      allCategories.set(cat.id, cat.name);
    });
  });

  // Get selected products for each project
  const projectProducts = projects.map((project) => ({
    project,
    products: getSelectedProducts(project),
  }));

  // Get all unique providers across all projects
  const allProviders = new Set<string>();
  projectProducts.forEach(({ products }) => {
    products.forEach((p) => allProviders.add(p.provider));
  });

  // Group products by provider for each project
  const projectsByProvider = projects.map((project) => {
    const products = getSelectedProducts(project);
    const byProvider: Record<string, SelectedProduct[]> = {};
    products.forEach((p) => {
      if (!byProvider[p.provider]) byProvider[p.provider] = [];
      byProvider[p.provider].push(p);
    });
    return { project, byProvider, total: products.length };
  });

  return (
    <div>
      {/* Summary Section */}
      <div className="p-6 border-b border-[#e9e9e7]">
        <h3 className="text-sm font-semibold text-[#37352f] mb-4">Product Count Summary</h3>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}>
          {projectsByProvider.map(({ project, total }, index) => (
            <div key={project.id} className="bg-[#f7f6f3] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-[#37352f] truncate">{project.name}</span>
              </div>
              <div className="text-2xl font-bold text-[#37352f]">{total}</div>
              <div className="text-xs text-[#787774]">products selected</div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e9e9e7]">
              <th className="text-left py-4 px-6 text-sm font-semibold text-[#37352f] bg-[#f7f6f3]">
                Provider
              </th>
              {projects.map((project, index) => (
                <th
                  key={project.id}
                  className="text-left py-4 px-6 text-sm font-semibold text-[#37352f] bg-[#f7f6f3]"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    {project.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(allProviders)
              .sort()
              .map((provider) => (
                <tr key={provider} className="border-b border-[#e9e9e7]">
                  <td className="py-4 px-6 text-sm font-medium text-[#37352f] align-top">
                    {provider}
                  </td>
                  {projectsByProvider.map(({ project, byProvider }) => {
                    const products = byProvider[provider] || [];
                    return (
                      <td
                        key={project.id}
                        className="py-4 px-6 text-sm text-[#37352f] align-top"
                      >
                        {products.length > 0 ? (
                          <div className="space-y-1">
                            {products.map((p) => (
                              <div key={p.id} className="flex items-start gap-2">
                                <span className="text-[#0f7b6c]">&#x2713;</span>
                                <div>
                                  <div className="font-medium">{p.product_name}</div>
                                  <div className="text-xs text-[#787774]">{p.categoryName}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#9b9a97]">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Category Coverage */}
      <div className="p-6 border-t border-[#e9e9e7]">
        <h3 className="text-sm font-semibold text-[#37352f] mb-4">Category Coverage</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e9e9e7]">
                <th className="text-left py-2 px-3 text-[#787774] font-medium">Category</th>
                {projects.map((project, index) => (
                  <th key={project.id} className="text-center py-2 px-3 text-[#787774] font-medium">
                    Project {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(allCategories.entries()).map(([catId, catName]) => (
                <tr key={catId} className="border-b border-[#e9e9e7]">
                  <td className="py-2 px-3 text-[#37352f]">{catName}</td>
                  {projectProducts.map(({ project, products }) => {
                    const hasCategory = products.some((p) => p.categoryId === catId);
                    return (
                      <td key={project.id} className="text-center py-2 px-3">
                        {hasCategory ? (
                          <span className="text-[#0f7b6c] font-bold">&#x2713;</span>
                        ) : (
                          <span className="text-[#9b9a97]">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
