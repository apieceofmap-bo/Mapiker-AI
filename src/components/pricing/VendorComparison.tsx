"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Product, Category } from "@/lib/types";
import { calculatePricing, ProductCost } from "@/lib/api";
import { getVendorColor } from "@/lib/vendorColors";

interface VendorComparisonProps {
  categories: Category[];
  monthlyRequests: number;
}

interface VendorCategoryData {
  vendor: string;
  categoryId: string;
  categoryName: string;
  product: Product | null;
  monthlyCost: number | null;
  freeQuota: boolean;
  freeTier: number | null;
  billingUnit: string;
  contactSales: boolean;
}

export default function VendorComparison({
  categories,
  monthlyRequests,
}: VendorComparisonProps) {
  const [pricingMap, setPricingMap] = useState<Map<string, ProductCost>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all unique vendors
  const vendors = useMemo(() => {
    const vendorSet = new Set<string>();
    categories.forEach((cat) => {
      cat.products.forEach((p) => vendorSet.add(p.provider));
    });
    return Array.from(vendorSet).sort();
  }, [categories]);

  // Get all product IDs
  const allProductIds = useMemo(() => {
    const ids: string[] = [];
    categories.forEach((cat) => {
      cat.products.forEach((p) => ids.push(p.id));
    });
    return ids;
  }, [categories]);

  // Fetch pricing data from backend
  const fetchPricing = useCallback(async (productIds: string[], requests: number) => {
    if (productIds.length === 0) {
      setPricingMap(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await calculatePricing(productIds, requests);
      const newMap = new Map<string, ProductCost>();
      response.products.forEach((p) => {
        newMap.set(p.product_id, p);
      });
      setPricingMap(newMap);
    } catch (err) {
      console.error("Failed to fetch pricing:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pricing when products or monthly requests change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPricing(allProductIds, monthlyRequests);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [allProductIds, monthlyRequests, fetchPricing]);

  // Build comparison matrix
  const comparisonData = useMemo(() => {
    return categories.map((category) => {
      const vendorProducts: Record<string, VendorCategoryData> = {};

      vendors.forEach((vendor) => {
        // Find the best product for this vendor in this category
        const product = category.products.find((p) => p.provider === vendor);

        if (product) {
          const pricing = pricingMap.get(product.id);

          vendorProducts[vendor] = {
            vendor,
            categoryId: category.id,
            categoryName: category.name,
            product,
            monthlyCost: pricing?.estimated_cost ?? null,
            freeQuota: pricing?.free_tier_applied ?? false,
            freeTier: pricing?.free_tier ?? null,
            billingUnit: pricing?.billing_unit ?? "request",
            contactSales: pricing?.contact_sales_required ?? false,
          };
        } else {
          vendorProducts[vendor] = {
            vendor,
            categoryId: category.id,
            categoryName: category.name,
            product: null,
            monthlyCost: null,
            freeQuota: false,
            freeTier: null,
            billingUnit: "request",
            contactSales: false,
          };
        }
      });

      return {
        category,
        vendorProducts,
      };
    });
  }, [categories, vendors, pricingMap]);

  // Calculate vendor totals
  const vendorTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    vendors.forEach((vendor) => {
      totals[vendor] = 0;
    });

    comparisonData.forEach((row) => {
      vendors.forEach((vendor) => {
        const data = row.vendorProducts[vendor];
        if (data?.monthlyCost !== null && !data?.contactSales) {
          totals[vendor] += data.monthlyCost;
        }
      });
    });

    return totals;
  }, [comparisonData, vendors]);

  // Find cheapest vendor
  const cheapestVendor = useMemo(() => {
    let minCost = Infinity;
    let cheapest = "";
    Object.entries(vendorTotals).forEach(([vendor, total]) => {
      if (total < minCost && total > 0) {
        minCost = total;
        cheapest = vendor;
      }
    });
    return cheapest;
  }, [vendorTotals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f] mx-auto mb-4"></div>
        <p className="text-[#787774]">Loading pricing comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md p-4">
        <p className="text-[#e03e3e] text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#e9e9e7] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e9e9e7]">
        <h3 className="text-lg font-semibold text-[#37352f]">
          Vendor Comparison
        </h3>
        <p className="text-sm text-[#787774]">
          Compare pricing across vendors for {formatNumber(monthlyRequests)} requests/month
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f7f6f3]">
              <th className="px-6 py-3 text-left text-sm font-medium text-[#787774]">
                Category
              </th>
              {vendors.map((vendor) => {
                const colors = getVendorColor(vendor);
                const isLowest = vendor === cheapestVendor;
                return (
                  <th
                    key={vendor}
                    className={`px-4 py-3 text-center text-sm font-medium ${colors.text} ${colors.bg}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {vendor}
                      {isLowest && (
                        <span className="px-1.5 py-0.5 text-xs bg-[#0f7b6c] text-white rounded">
                          Lowest
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9e9e7]">
            {comparisonData.map((row) => {
              // Find lowest cost for this category
              let lowestCost = Infinity;
              vendors.forEach((vendor) => {
                const data = row.vendorProducts[vendor];
                const cost = data?.monthlyCost;
                if (cost !== null && cost < lowestCost && !data.contactSales) {
                  lowestCost = cost;
                }
              });

              return (
                <tr key={row.category.id} className="hover:bg-[#f7f6f3]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#37352f]">
                      {row.category.name}
                    </div>
                    {row.category.required && (
                      <span className="text-xs text-[#e03e3e]">Required</span>
                    )}
                  </td>
                  {vendors.map((vendor) => {
                    const data = row.vendorProducts[vendor];
                    const colors = getVendorColor(vendor);
                    const isLowest =
                      data?.monthlyCost !== null &&
                      data?.monthlyCost === lowestCost &&
                      lowestCost < Infinity &&
                      !data.contactSales;

                    if (!data?.product) {
                      return (
                        <td
                          key={vendor}
                          className="px-4 py-4 text-center text-[#9b9a97]"
                        >
                          <span className="text-sm">N/A</span>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={vendor}
                        className={`px-4 py-4 text-center ${
                          isLowest ? "bg-[rgba(15,123,108,0.05)]" : ""
                        }`}
                      >
                        <div className="text-sm font-medium text-[#37352f]">
                          {data.product.product_name}
                        </div>
                        {data.contactSales ? (
                          <div className="text-sm font-medium text-[#9b59b6]">
                            Contact Sales
                          </div>
                        ) : data.monthlyCost !== null ? (
                          <>
                            <div
                              className={`text-lg font-semibold ${
                                isLowest ? "text-[#0f7b6c]" : colors.text
                              }`}
                            >
                              {formatCurrency(data.monthlyCost)}
                            </div>
                            {data.freeQuota && (
                              <div className="text-xs text-[#0f7b6c]">
                                Free: {data.freeTier ? `${formatNumber(data.freeTier)}/mo` : "applied"}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-[#9b9a97]">
                            Loading...
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#f7f6f3] font-semibold">
              <td className="px-6 py-4 text-[#37352f]">Total Monthly Cost</td>
              {vendors.map((vendor) => {
                const colors = getVendorColor(vendor);
                const isLowest = vendor === cheapestVendor;
                const total = vendorTotals[vendor];

                return (
                  <td
                    key={vendor}
                    className={`px-4 py-4 text-center ${
                      isLowest ? "bg-[rgba(15,123,108,0.1)]" : colors.bg
                    }`}
                  >
                    <div
                      className={`text-xl ${
                        isLowest ? "text-[#0f7b6c]" : colors.text
                      }`}
                    >
                      {formatCurrency(total)}
                    </div>
                    {isLowest && (
                      <div className="text-xs text-[#0f7b6c] mt-1">
                        Best Value
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Savings Comparison */}
      {cheapestVendor && Object.keys(vendorTotals).length > 1 && (
        <div className="px-6 py-4 bg-[#f7f6f3] border-t border-[#e9e9e7]">
          <h4 className="text-sm font-medium text-[#37352f] mb-3">
            Potential Savings with {cheapestVendor}
          </h4>
          <div className="flex flex-wrap gap-4">
            {vendors
              .filter((v) => v !== cheapestVendor && vendorTotals[v] > 0)
              .map((vendor) => {
                const savings = vendorTotals[vendor] - vendorTotals[cheapestVendor];
                const savingsPercent = (savings / vendorTotals[vendor]) * 100;
                const colors = getVendorColor(vendor);

                return (
                  <div
                    key={vendor}
                    className={`px-4 py-2 rounded-lg ${colors.bg} ${colors.border} border`}
                  >
                    <span className={`text-sm ${colors.text}`}>
                      Save <span className="font-semibold">{formatCurrency(savings)}</span>
                      {" "}({savingsPercent.toFixed(0)}%) vs {vendor}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
