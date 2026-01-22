"use client";

import { useState, useEffect, useCallback } from "react";
import { Project, SelectionState, MatchResponse } from "@/lib/types";
import { calculatePricing, BulkPricingResponse, UsageMetrics } from "@/lib/api";

interface PricingComparisonProps {
  projects: Project[];
}

interface VendorSummary {
  vendor: string;
  subtotal: number;
  productCount: number;
}

interface ProjectPricingData {
  projectId: string;
  loading: boolean;
  error: string | null;
  data: BulkPricingResponse | null;
  vendorSummaries: VendorSummary[];
}

// Get selected product IDs from a project
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

// Get vendor from product ID using match result
function getVendorFromProduct(project: Project, productId: string): string {
  if (!project.match_result) return "Unknown";
  const matchResult = project.match_result as MatchResponse;

  for (const category of matchResult.categories) {
    const product = category.products.find((p) => p.id === productId);
    if (product) return product.provider;
  }
  return "Unknown";
}

export default function PricingComparison({ projects }: PricingComparisonProps) {
  // Usage metrics state
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    requests: 100000,
    mau: 2000,
    trips: 10000,
    destinations: 5000,
  });

  // Pricing data for each project
  const [pricingData, setPricingData] = useState<Record<string, ProjectPricingData>>({});

  // Format number with commas
  const formatNumber = (num: number) => num.toLocaleString();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle metric change
  const handleMetricChange = (field: keyof UsageMetrics, value: string) => {
    const numValue = parseInt(value.replace(/,/g, "")) || 0;
    setUsageMetrics((prev) => ({ ...prev, [field]: numValue }));
  };

  // Fetch pricing for all projects
  const fetchPricing = useCallback(async () => {
    const newPricingData: Record<string, ProjectPricingData> = {};

    // Initialize loading state
    projects.forEach((project) => {
      newPricingData[project.id] = {
        projectId: project.id,
        loading: true,
        error: null,
        data: null,
        vendorSummaries: [],
      };
    });
    setPricingData(newPricingData);

    // Fetch pricing for each project
    await Promise.all(
      projects.map(async (project) => {
        const productIds = getSelectedProductIds(project);

        if (productIds.length === 0) {
          setPricingData((prev) => ({
            ...prev,
            [project.id]: {
              ...prev[project.id],
              loading: false,
              error: "No products selected",
              data: null,
              vendorSummaries: [],
            },
          }));
          return;
        }

        try {
          const data = await calculatePricing(productIds, usageMetrics.requests, usageMetrics);

          // Calculate vendor summaries
          const vendorMap = new Map<string, { subtotal: number; count: number }>();
          data.products.forEach((cost) => {
            const vendor = getVendorFromProduct(project, cost.product_id);
            if (!vendorMap.has(vendor)) {
              vendorMap.set(vendor, { subtotal: 0, count: 0 });
            }
            const v = vendorMap.get(vendor)!;
            v.subtotal += cost.estimated_cost;
            v.count += 1;
          });

          const vendorSummaries: VendorSummary[] = Array.from(vendorMap.entries())
            .map(([vendor, { subtotal, count }]) => ({
              vendor,
              subtotal,
              productCount: count,
            }))
            .sort((a, b) => a.vendor.localeCompare(b.vendor));

          setPricingData((prev) => ({
            ...prev,
            [project.id]: {
              ...prev[project.id],
              loading: false,
              error: null,
              data,
              vendorSummaries,
            },
          }));
        } catch (err) {
          setPricingData((prev) => ({
            ...prev,
            [project.id]: {
              ...prev[project.id],
              loading: false,
              error: err instanceof Error ? err.message : "Failed to calculate pricing",
              data: null,
              vendorSummaries: [],
            },
          }));
        }
      })
    );
  }, [projects, usageMetrics]);

  // Fetch pricing when metrics change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPricing();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchPricing]);

  // Get all unique vendors across all projects
  const allVendors = new Set<string>();
  Object.values(pricingData).forEach((pd) => {
    pd.vendorSummaries.forEach((vs) => allVendors.add(vs.vendor));
  });
  const sortedVendors = Array.from(allVendors).sort();

  // Calculate totals for comparison
  const totals = projects.map((p) => {
    const pd = pricingData[p.id];
    return {
      id: p.id,
      total: pd?.data?.total_cost || 0,
      loading: pd?.loading || false,
    };
  });
  const validTotals = totals.filter((t) => t.total > 0 && !t.loading);
  const minTotal = validTotals.length > 0 ? Math.min(...validTotals.map((t) => t.total)) : 0;
  const maxTotal = validTotals.length > 0 ? Math.max(...validTotals.map((t) => t.total)) : 0;

  // Check if any project has products selected
  const hasProducts = projects.some((p) => getSelectedProductIds(p).length > 0);

  if (!hasProducts) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">&#x1F4B0;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          No products selected
        </h3>
        <p className="text-sm text-[#787774]">
          Complete the product selection step for at least one project to see pricing comparison.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Usage Metrics Input */}
      <div className="p-4 border-b border-[#e9e9e7] bg-[#fafafa]">
        <h3 className="text-sm font-semibold text-[#37352f] mb-3">Estimated Monthly Usage</h3>
        <p className="text-xs text-[#787774] mb-3">
          Adjust your expected monthly usage to calculate estimated costs for all projects.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#37352f]">
              Monthly API Requests
            </label>
            <input
              type="text"
              value={formatNumber(usageMetrics.requests)}
              onChange={(e) => handleMetricChange("requests", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#37352f]">
              Monthly Active Users
            </label>
            <input
              type="text"
              value={formatNumber(usageMetrics.mau ?? 0)}
              onChange={(e) => handleMetricChange("mau", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#37352f]">
              Monthly Trips
            </label>
            <input
              type="text"
              value={formatNumber(usageMetrics.trips ?? 0)}
              onChange={(e) => handleMetricChange("trips", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#37352f]">
              Monthly Destinations
            </label>
            <input
              type="text"
              value={formatNumber(usageMetrics.destinations ?? 0)}
              onChange={(e) => handleMetricChange("destinations", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
            />
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-[#e9e9e7]">
              <th className="text-left py-4 px-4 text-sm font-semibold text-[#37352f] bg-[#f7f6f3] w-36">
                Vendor
              </th>
              {projects.map((project, index) => (
                <th
                  key={project.id}
                  className="text-right py-4 px-4 text-sm font-semibold text-[#37352f] bg-[#f7f6f3]"
                >
                  <span className="inline-flex items-center justify-end gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="truncate">{project.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedVendors.map((vendor) => (
              <tr key={vendor} className="border-b border-[#e9e9e7]">
                <td className="py-4 px-4 text-sm text-[#37352f] font-medium">
                  {vendor}
                </td>
                {projects.map((project) => {
                  const pd = pricingData[project.id];
                  const vendorData = pd?.vendorSummaries.find((vs) => vs.vendor === vendor);

                  if (pd?.loading) {
                    return (
                      <td key={project.id} className="py-4 px-4 text-sm text-right text-[#787774]">
                        <div className="animate-pulse">Calculating...</div>
                      </td>
                    );
                  }

                  return (
                    <td key={project.id} className="py-4 px-4 text-sm text-right text-[#37352f]">
                      {vendorData ? (
                        <div>
                          <div className="font-medium">{formatCurrency(vendorData.subtotal)}</div>
                          <div className="text-xs text-[#787774]">
                            {vendorData.productCount} product{vendorData.productCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#9b9a97]">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Total Row */}
            <tr className="bg-[#f7f6f3]">
              <td className="py-4 px-4 text-sm font-semibold text-[#37352f]">
                Total Monthly Cost
              </td>
              {projects.map((project) => {
                const pd = pricingData[project.id];
                const total = pd?.data?.total_cost || 0;
                const isLoading = pd?.loading;
                const isLowest = !isLoading && total === minTotal && total > 0;
                const isHighest = !isLoading && total === maxTotal && projects.length > 1 && total > 0;

                return (
                  <td
                    key={project.id}
                    className={`py-4 px-4 text-right ${
                      isLowest
                        ? "text-[#0f7b6c]"
                        : isHighest
                        ? "text-[#e03e3e]"
                        : "text-[#37352f]"
                    }`}
                  >
                    {isLoading ? (
                      <div className="animate-pulse text-[#787774]">Calculating...</div>
                    ) : (
                      <>
                        <div className="text-lg font-bold">
                          {total > 0 ? formatCurrency(total) : "-"}
                        </div>
                        {isLowest && total > 0 && (
                          <span className="text-xs bg-[rgba(15,123,108,0.15)] text-[#0f7b6c] px-2 py-0.5 rounded-full">
                            Lowest
                          </span>
                        )}
                        {isHighest && (
                          <span className="text-xs bg-[rgba(224,62,62,0.08)] text-[#e03e3e] px-2 py-0.5 rounded-full">
                            Highest
                          </span>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cost Difference Summary */}
      {minTotal !== maxTotal && minTotal > 0 && !totals.some((t) => t.loading) && (
        <div className="p-4 border-t border-[#e9e9e7]">
          <div className="text-sm text-[#787774]">
            <span className="font-medium text-[#37352f]">Price difference:</span>{" "}
            {formatCurrency(maxTotal - minTotal)} ({Math.round(((maxTotal - minTotal) / minTotal) * 100)}% more expensive)
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 border-t border-[#e9e9e7] bg-[#fffbeb]">
        <div className="flex gap-2 text-xs text-[#92400e]">
          <span>&#x26A0;</span>
          <span>
            Estimated costs based on publicly available pricing. Actual costs may vary based on usage patterns and contract terms.
          </span>
        </div>
      </div>
    </div>
  );
}
