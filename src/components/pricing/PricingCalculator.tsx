"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";
import { calculatePricing, ProductCost, BulkPricingResponse, UsageMetrics } from "@/lib/api";
import { getVendorColor } from "@/lib/vendorColors";

interface VendorSummary {
  vendor: string;
  products: ProductCost[];
  subtotal: number;
  productCount: number;
  hasContactSales: boolean;
  hasPricingUnavailable: boolean;
}

interface PricingCalculatorProps {
  selectedProducts: Product[];
  onContinue?: () => void;
}

// Preset monthly request options
const REQUEST_PRESETS = [
  { label: "Starter", value: 10000, description: "10K requests/month" },
  { label: "Growth", value: 100000, description: "100K requests/month" },
  { label: "Scale", value: 500000, description: "500K requests/month" },
  { label: "Enterprise", value: 1000000, description: "1M requests/month" },
];

export default function PricingCalculator({
  selectedProducts,
  onContinue,
}: PricingCalculatorProps) {
  const [monthlyRequests, setMonthlyRequests] = useState(100000);
  const [customRequests, setCustomRequests] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(100000);
  const [pricingData, setPricingData] = useState<BulkPricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced mode state
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    requests: 100000,
    mau: 2000,
    trips: 10000,
    destinations: 5000,
  });

  // Debounced API call
  const fetchPricing = useCallback(async (
    productIds: string[],
    requests: number,
    metrics?: UsageMetrics
  ) => {
    if (productIds.length === 0) {
      setPricingData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await calculatePricing(productIds, requests, metrics);
      setPricingData(response);
    } catch (err) {
      console.error("Failed to calculate pricing:", err);
      setError(err instanceof Error ? err.message : "Failed to calculate pricing");
      setPricingData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pricing when products or usage changes
  useEffect(() => {
    const productIds = selectedProducts.map((p) => p.id);
    const timeoutId = setTimeout(() => {
      if (isAdvancedMode) {
        fetchPricing(productIds, usageMetrics.requests, usageMetrics);
      } else {
        fetchPricing(productIds, monthlyRequests);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [selectedProducts, monthlyRequests, isAdvancedMode, usageMetrics, fetchPricing]);

  // Group products by vendor
  const vendorSummaries: VendorSummary[] = pricingData
    ? (() => {
        const vendorMap = new Map<string, ProductCost[]>();

        // Find vendor for each product from selectedProducts
        pricingData.products.forEach((cost) => {
          const product = selectedProducts.find((p) => p.id === cost.product_id);
          const vendor = product?.provider || "Unknown";
          if (!vendorMap.has(vendor)) {
            vendorMap.set(vendor, []);
          }
          vendorMap.get(vendor)!.push(cost);
        });

        return Array.from(vendorMap.entries()).map(([vendor, products]) => ({
          vendor,
          products,
          subtotal: products.reduce((sum, p) => sum + p.estimated_cost, 0),
          productCount: products.length,
          hasContactSales: products.some((p) => p.contact_sales_required),
          hasPricingUnavailable: products.some((p) => p.pricing_unavailable),
        }));
      })()
    : [];

  const handlePresetClick = (value: number) => {
    setMonthlyRequests(value);
    setActivePreset(value);
    setCustomRequests("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    setCustomRequests(value);
    setActivePreset(null);
    if (value && !isNaN(Number(value))) {
      setMonthlyRequests(Number(value));
    }
  };

  const handleMetricChange = (field: keyof UsageMetrics, value: string) => {
    const numValue = parseInt(value.replace(/,/g, "")) || 0;
    setUsageMetrics(prev => ({ ...prev, [field]: numValue }));
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBillingUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      request: "Per request",
      MAU: "Per MAU",
      trip: "Per trip",
      session: "Per session",
      element: "Per element",
      load: "Per load",
      "MAU+trip": "Per MAU + trip",
      order: "Per order",
    };
    return labels[unit] || `Per ${unit}`;
  };

  if (selectedProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-8 text-center">
        <div className="text-4xl mb-4">&#x1F4B0;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          No products selected
        </h3>
        <p className="text-[#787774]">
          Go back to select products to see pricing estimates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Requests Selector */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
        <h3 className="text-lg font-semibold text-[#37352f] mb-4">
          Estimated Monthly Usage
        </h3>
        <p className="text-sm text-[#787774] mb-4">
          Select your expected monthly API requests to calculate estimated costs
        </p>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setIsAdvancedMode(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !isAdvancedMode
                ? "bg-[#37352f] text-white"
                : "bg-[#f7f6f3] text-[#787774] hover:bg-[#e9e9e7]"
            }`}
          >
            Simple Mode
          </button>
          <button
            onClick={() => setIsAdvancedMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isAdvancedMode
                ? "bg-[#37352f] text-white"
                : "bg-[#f7f6f3] text-[#787774] hover:bg-[#e9e9e7]"
            }`}
          >
            Advanced Mode
          </button>
          <span className="text-xs text-[#9b9a97]">
            {isAdvancedMode ? "Specify MAU, trips, and requests separately" : "Use requests to estimate all metrics"}
          </span>
        </div>

        {!isAdvancedMode ? (
          <>
            {/* Preset Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {REQUEST_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`px-4 py-3 rounded-md border-2 transition-all ${
                    activePreset === preset.value
                      ? "border-[#37352f] bg-[#f7f6f3] text-[#37352f]"
                      : "border-[#e9e9e7] hover:border-[#d3d3d0] text-[#787774]"
                  }`}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs text-[#9b9a97]">{preset.description}</div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#787774]">Custom:</span>
              <input
                type="text"
                value={customRequests ? Number(customRequests).toLocaleString() : ""}
                onChange={handleCustomChange}
                placeholder="Enter custom amount"
                className="flex-1 px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
              />
              <span className="text-sm text-[#787774]">requests/month</span>
            </div>

            <div className="mt-4 p-3 bg-[#f7f6f3] rounded-md">
              <div className="text-sm text-[#787774]">
                Calculating for:{" "}
                <span className="font-semibold text-[#37352f]">
                  {formatNumber(monthlyRequests)}
                </span>{" "}
                requests per product per month
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Advanced Mode Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#37352f]">
                  Monthly Active Users (MAU)
                </label>
                <input
                  type="text"
                  value={formatNumber(usageMetrics.mau)}
                  onChange={(e) => handleMetricChange("mau", e.target.value)}
                  className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
                />
                <p className="text-xs text-[#9b9a97]">For SDK products with MAU-based pricing</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#37352f]">
                  Monthly Trips
                </label>
                <input
                  type="text"
                  value={formatNumber(usageMetrics.trips)}
                  onChange={(e) => handleMetricChange("trips", e.target.value)}
                  className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
                />
                <p className="text-xs text-[#9b9a97]">For navigation products with trip-based pricing</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#37352f]">
                  Monthly Destinations
                </label>
                <input
                  type="text"
                  value={formatNumber(usageMetrics.destinations)}
                  onChange={(e) => handleMetricChange("destinations", e.target.value)}
                  className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
                />
                <p className="text-xs text-[#9b9a97]">For route optimization products</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#37352f]">
                  Monthly API Requests
                </label>
                <input
                  type="text"
                  value={formatNumber(usageMetrics.requests)}
                  onChange={(e) => handleMetricChange("requests", e.target.value)}
                  className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f]"
                />
                <p className="text-xs text-[#9b9a97]">For API products with request-based pricing</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#f7f6f3] rounded-md">
              <div className="text-sm text-[#787774]">
                Calculating for:{" "}
                <span className="font-semibold text-[#37352f]">{formatNumber(usageMetrics.mau)}</span> MAU,{" "}
                <span className="font-semibold text-[#37352f]">{formatNumber(usageMetrics.trips)}</span> trips,{" "}
                <span className="font-semibold text-[#37352f]">{formatNumber(usageMetrics.destinations)}</span> destinations,{" "}
                <span className="font-semibold text-[#37352f]">{formatNumber(usageMetrics.requests)}</span> requests per month
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f] mx-auto mb-4"></div>
          <p className="text-[#787774]">Calculating pricing...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md p-4">
          <p className="text-[#e03e3e] text-sm">{error}</p>
        </div>
      )}

      {/* Vendor Breakdown */}
      {!loading && pricingData && (
        <>
          <div className="space-y-4">
            {vendorSummaries.map((vendor) => {
              const colors = getVendorColor(vendor.vendor);
              return (
                <div
                  key={vendor.vendor}
                  className={`bg-white rounded-xl border ${colors.border} overflow-hidden`}
                >
                  {/* Vendor Header */}
                  <div className={`px-6 py-4 ${colors.bg} border-b ${colors.border}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${colors.text}`}>
                          {vendor.vendor}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {vendor.productCount} product
                          {vendor.productCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${colors.text}`}>
                          {vendor.hasContactSales && vendor.subtotal === 0
                            ? "Contact Sales"
                            : formatCurrency(vendor.subtotal)}
                        </div>
                        <div className="text-sm text-gray-500">/month</div>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="divide-y divide-[#e9e9e7]">
                    {vendor.products.map((cost) => (
                      <div
                        key={cost.product_id}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-[#37352f]">
                            {cost.product_name}
                          </div>
                          <div className="text-sm text-[#787774]">
                            {getBillingUnitLabel(cost.billing_unit)}
                            {cost.free_tier_applied && (
                              <span className="ml-2 text-[#0f7b6c]">
                                &#x2713; Free tier: {cost.free_tier ? `${formatNumber(cost.free_tier)} ${cost.billing_unit}s/mo` :
                                  cost.tier_breakdown?.some(t => t.free_tier) ?
                                    cost.tier_breakdown.filter(t => t.free_tier).map(t => `${formatNumber(t.free_tier!)} ${t.component}`).join(' + ') + '/mo' :
                                    'applied'}
                              </span>
                            )}
                          </div>
                          {cost.pricing_note && (
                            <div className="text-xs text-[#b8860b] mt-1">
                              {cost.pricing_note}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {cost.contact_sales_required ? (
                            <div className="text-sm font-medium text-[#9b59b6]">
                              Contact Sales
                            </div>
                          ) : cost.pricing_unavailable ? (
                            <div className="text-sm font-medium text-[#787774]">
                              Price N/A
                            </div>
                          ) : (
                            <>
                              <div className="font-semibold text-[#37352f]">
                                {formatCurrency(cost.estimated_cost)}
                              </div>
                              {cost.monthly_usage !== cost.original_requests && (
                                <div className="text-xs text-[#787774]">
                                  {formatNumber(cost.monthly_usage)} {cost.billing_unit}s
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Summary */}
          <div className="bg-[#37352f] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold opacity-90">
                  Estimated Total Monthly Cost
                </h3>
                <p className="text-sm opacity-75">
                  Based on {formatNumber(monthlyRequests)} requests/product/month
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">
                  {formatCurrency(pricingData.total_cost)}
                </div>
                <div className="text-sm opacity-75">/month</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-75">Estimated Annual Cost</span>
                <span className="font-semibold">
                  {formatCurrency(pricingData.total_cost * 12)}
                </span>
              </div>
            </div>

            {/* Contact Sales Warning */}
            {pricingData.has_contact_sales && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm text-yellow-300">
                  <span>&#x26A0;</span>
                  <span>
                    Some products require contacting sales for pricing
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-[rgba(223,171,1,0.08)] border border-[rgba(223,171,1,0.2)] rounded-md p-4">
        <div className="flex gap-3">
          <span className="text-[#b8860b] text-xl">&#x26A0;&#xFE0F;</span>
          <div>
            <h4 className="font-medium text-[#b8860b]">Pricing Disclaimer</h4>
            <p className="text-sm text-[#b8860b] mt-1">
              These are estimated costs based on publicly available pricing information.
              Actual costs may vary based on your specific usage patterns, contract terms,
              and vendor negotiations. Contact vendors directly for accurate quotes.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {onContinue && (
        <div className="flex justify-end">
          <button
            onClick={onContinue}
            disabled={loading}
            className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Quality Evaluation
            <span>&#x2192;</span>
          </button>
        </div>
      )}
    </div>
  );
}
