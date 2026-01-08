"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/types";
import {
  calculateProductCost,
  getProductPricing,
  estimateProductPricing,
  getVendorColor,
  ProductPricingInfo,
} from "@/lib/pricingData";

interface ProductCostEstimate {
  product: Product;
  pricing: ProductPricingInfo;
  monthlyCost: number;
  freeQuota: number;
  billableRequests: number;
}

interface VendorSummary {
  vendor: string;
  products: ProductCostEstimate[];
  subtotal: number;
  productCount: number;
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

  // Calculate costs for all products
  const productCosts = useMemo<ProductCostEstimate[]>(() => {
    return selectedProducts.map((product) => {
      // Try to get actual pricing, fallback to estimate
      let pricing = getProductPricing(product.id);
      if (!pricing) {
        pricing = estimateProductPricing(product.product_name, product.provider);
      }

      const freeQuota = pricing.freeMonthlyQuota || 0;
      const billableRequests = Math.max(0, monthlyRequests - freeQuota);
      const monthlyCost = calculateProductCost(pricing, monthlyRequests);

      return {
        product,
        pricing,
        monthlyCost,
        freeQuota,
        billableRequests,
      };
    });
  }, [selectedProducts, monthlyRequests]);

  // Group by vendor
  const vendorSummaries = useMemo<VendorSummary[]>(() => {
    const vendorMap = new Map<string, ProductCostEstimate[]>();

    productCosts.forEach((cost) => {
      const vendor = cost.product.provider;
      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, []);
      }
      vendorMap.get(vendor)!.push(cost);
    });

    return Array.from(vendorMap.entries()).map(([vendor, products]) => ({
      vendor,
      products,
      subtotal: products.reduce((sum, p) => sum + p.monthlyCost, 0),
      productCount: products.length,
    }));
  }, [productCosts]);

  // Total cost
  const totalMonthlyCost = useMemo(() => {
    return vendorSummaries.reduce((sum, v) => sum + v.subtotal, 0);
  }, [vendorSummaries]);

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

  if (selectedProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">💰</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products selected
        </h3>
        <p className="text-gray-500">
          Go back to select products to see pricing estimates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Requests Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estimated Monthly Usage
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select your expected monthly API requests to calculate estimated costs
        </p>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {REQUEST_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                activePreset === preset.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="font-medium">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.description}</div>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Custom:</span>
          <input
            type="text"
            value={customRequests ? Number(customRequests).toLocaleString() : ""}
            onChange={handleCustomChange}
            placeholder="Enter custom amount"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">requests/month</span>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Calculating for: <span className="font-semibold text-gray-900">{formatNumber(monthlyRequests)}</span> requests per product per month
          </div>
        </div>
      </div>

      {/* Vendor Breakdown */}
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
                      {vendor.productCount} product{vendor.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {formatCurrency(vendor.subtotal)}
                    </div>
                    <div className="text-sm text-gray-500">/month</div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="divide-y divide-gray-100">
                {vendor.products.map((cost) => (
                  <div
                    key={cost.product.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {cost.product.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cost.pricing.pricingModel === "per-request" && "Per request pricing"}
                        {cost.pricing.pricingModel === "per-session" && "Per session pricing"}
                        {cost.pricing.pricingModel === "per-asset" && "Per asset pricing"}
                        {cost.freeQuota > 0 && (
                          <span className="ml-2 text-green-600">
                            • {formatNumber(cost.freeQuota)} free/month
                          </span>
                        )}
                      </div>
                      {cost.pricing.notes && (
                        <div className="text-xs text-amber-600 mt-1">
                          {cost.pricing.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(cost.monthlyCost)}
                      </div>
                      {cost.freeQuota > 0 && cost.billableRequests > 0 && (
                        <div className="text-xs text-gray-500">
                          {formatNumber(cost.billableRequests)} billable
                        </div>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
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
              {formatCurrency(totalMonthlyCost)}
            </div>
            <div className="text-sm opacity-75">/month</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-75">Estimated Annual Cost</span>
            <span className="font-semibold">
              {formatCurrency(totalMonthlyCost * 12)}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-amber-500 text-xl">⚠️</span>
          <div>
            <h4 className="font-medium text-amber-800">Pricing Disclaimer</h4>
            <p className="text-sm text-amber-700 mt-1">
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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Continue to Quality Evaluation
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
