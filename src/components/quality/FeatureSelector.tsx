"use client";

import { QUALITY_FEATURES } from "@/lib/qualityEvaluationOptions";

interface FeatureSelectorProps {
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
  countryCount: number;
}

export default function FeatureSelector({
  selectedFeatures,
  onChange,
  countryCount,
}: FeatureSelectorProps) {
  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      // Don't allow deselecting if it's the only one selected
      if (selectedFeatures.length === 1) return;
      onChange(selectedFeatures.filter((f) => f !== featureId));
    } else {
      onChange([...selectedFeatures, featureId]);
    }
  };

  const additionalFeaturesCount = Math.max(0, selectedFeatures.length - 1);
  const additionalCost = additionalFeaturesCount * 10 * countryCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h4 className="font-medium text-[#37352f]">Select Features to Compare</h4>
        <p className="text-sm text-[#787774]">
          Choose the quality metrics to evaluate across vendors
        </p>
      </div>

      {/* Features Grid */}
      <div className="space-y-3">
        {QUALITY_FEATURES.map((feature, index) => {
          const isSelected = selectedFeatures.includes(feature.id);
          const isFirst = index === 0 || selectedFeatures[0] === feature.id;
          const isFreeFeature = isSelected && selectedFeatures.indexOf(feature.id) === 0;

          return (
            <label
              key={feature.id}
              className={`flex items-start gap-4 p-4 rounded-md border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-[#37352f] bg-[#f7f6f3]"
                  : "border-[#e9e9e7] hover:border-[#d3d3d0] bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleFeature(feature.id)}
                disabled={isSelected && selectedFeatures.length === 1}
                className="mt-1 rounded border-[#e9e9e7] text-[#37352f] focus:ring-[#37352f]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#37352f]">
                    {feature.name}
                  </span>
                  {isSelected && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isFreeFeature
                          ? "bg-[rgba(15,123,108,0.15)] text-[#0f7b6c]"
                          : "bg-[rgba(46,170,220,0.15)] text-[#2eaadc]"
                      }`}
                    >
                      {isFreeFeature ? "FREE" : `+$10/country`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#787774] mt-1">
                  {feature.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 bg-[#f7f6f3] rounded-md">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#787774]">Selected features:</span>
          <span className="font-medium text-[#37352f]">
            {selectedFeatures.length} features
          </span>
        </div>
        {selectedFeatures.length > 1 && countryCount > 0 && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-[#787774]">
              Additional features cost ({additionalFeaturesCount} × {countryCount} countries × $10):
            </span>
            <span className="font-medium text-[#2eaadc]">
              +${additionalCost.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 text-sm text-[#787774]">
        <span className="text-[#0f7b6c]">ℹ️</span>
        <span>
          First feature is included free with the base price. Each additional
          feature adds $10 per country.
        </span>
      </div>
    </div>
  );
}
