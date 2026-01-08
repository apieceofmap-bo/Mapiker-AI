"use client";

import {
  QUALITY_REPORT_PRICING,
  calculateQualityReportPrice,
  AVAILABLE_COUNTRIES,
  QUALITY_FEATURES,
} from "@/lib/qualityEvaluationOptions";

interface QualityReportPricingProps {
  selectedCountries: string[];
  selectedFeatures: string[];
}

export default function QualityReportPricing({
  selectedCountries,
  selectedFeatures,
}: QualityReportPricingProps) {
  const countryCount = selectedCountries.length;
  const featureCount = selectedFeatures.length;
  const totalPrice = calculateQualityReportPrice(countryCount, featureCount);

  const basePrice = countryCount * QUALITY_REPORT_PRICING.basePerCountry;
  const additionalFeaturesCount = Math.max(0, featureCount - 1);
  const additionalFeaturesPrice =
    additionalFeaturesCount *
    countryCount *
    QUALITY_REPORT_PRICING.additionalFeaturePerCountry;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get country names for display
  const getCountryName = (code: string) => {
    return AVAILABLE_COUNTRIES.find((c) => c.code === code)?.name || code;
  };

  // Get feature names for display
  const getFeatureName = (id: string) => {
    return QUALITY_FEATURES.find((f) => f.id === id)?.name || id;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Price Summary</h3>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 space-y-4">
        {/* Base Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-900">Base price</div>
            <div className="text-sm text-gray-500">
              {countryCount} {countryCount === 1 ? "country" : "countries"} × $
              {QUALITY_REPORT_PRICING.basePerCountry}
            </div>
          </div>
          <div className="font-medium text-gray-900">
            {formatCurrency(basePrice)}
          </div>
        </div>

        {/* Free Feature */}
        <div className="flex items-center justify-between text-green-600">
          <div>
            <div>First feature (included)</div>
            <div className="text-sm text-green-500">
              {featureCount > 0 ? getFeatureName(selectedFeatures[0]) : "Select a feature"}
            </div>
          </div>
          <div className="font-medium">FREE</div>
        </div>

        {/* Additional Features */}
        {additionalFeaturesCount > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900">Additional features</div>
              <div className="text-sm text-gray-500">
                {additionalFeaturesCount}{" "}
                {additionalFeaturesCount === 1 ? "feature" : "features"} × {countryCount}{" "}
                {countryCount === 1 ? "country" : "countries"} × $
                {QUALITY_REPORT_PRICING.additionalFeaturePerCountry}
              </div>
            </div>
            <div className="font-medium text-gray-900">
              {formatCurrency(additionalFeaturesPrice)}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">Total</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalPrice)}
          </div>
        </div>
      </div>

      {/* Selected Items Summary */}
      {(countryCount > 0 || featureCount > 0) && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {/* Countries */}
          {countryCount > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Countries ({countryCount})
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedCountries.slice(0, 5).map((code) => (
                  <span
                    key={code}
                    className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600"
                  >
                    {getCountryName(code)}
                  </span>
                ))}
                {countryCount > 5 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                    +{countryCount - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {featureCount > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Features ({featureCount})
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedFeatures.map((id, index) => (
                  <span
                    key={id}
                    className={`px-2 py-0.5 rounded text-xs ${
                      index === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {getFeatureName(id)}
                    {index === 0 && " (free)"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {countryCount === 0 && featureCount === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>Select countries and features to see the price</p>
        </div>
      )}
    </div>
  );
}
