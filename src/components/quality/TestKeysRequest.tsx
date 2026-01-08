"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { TEST_PERIODS } from "@/lib/qualityEvaluationOptions";
import { getVendorColor } from "@/lib/pricingData";

interface TestKeysRequestProps {
  selectedProducts: Product[];
  onSubmit: (data: TestKeysFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface TestKeysFormData {
  vendors: string[];
  testPeriodDays: 7 | 14 | 30;
  companyName: string;
  expectedMonthlyRequests: number;
  useCaseDetails: string;
  contactEmail: string;
}

export default function TestKeysRequest({
  selectedProducts,
  onSubmit,
  isSubmitting,
}: TestKeysRequestProps) {
  // Get unique vendors from selected products
  const availableVendors = Array.from(
    new Set(selectedProducts.map((p) => p.provider))
  ).sort();

  const [selectedVendors, setSelectedVendors] = useState<string[]>(availableVendors);
  const [testPeriod, setTestPeriod] = useState<7 | 14 | 30>(14);
  const [companyName, setCompanyName] = useState("");
  const [expectedRequests, setExpectedRequests] = useState("");
  const [useCaseDetails, setUseCaseDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const toggleVendor = (vendor: string) => {
    if (selectedVendors.includes(vendor)) {
      setSelectedVendors(selectedVendors.filter((v) => v !== vendor));
    } else {
      setSelectedVendors([...selectedVendors, vendor]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      vendors: selectedVendors,
      testPeriodDays: testPeriod,
      companyName,
      expectedMonthlyRequests: parseInt(expectedRequests) || 0,
      useCaseDetails,
      contactEmail,
    });
  };

  const isValid =
    selectedVendors.length > 0 &&
    companyName.trim() !== "" &&
    contactEmail.trim() !== "";

  // Get products for each vendor
  const getVendorProducts = (vendor: string) => {
    return selectedProducts.filter((p) => p.provider === vendor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vendors Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Select Vendors to Test
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Based on your selected products, you can request test keys for:
        </p>

        <div className="space-y-3">
          {availableVendors.map((vendor) => {
            const colors = getVendorColor(vendor);
            const isSelected = selectedVendors.includes(vendor);
            const products = getVendorProducts(vendor);

            return (
              <label
                key={vendor}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `${colors.border} ${colors.bg}`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleVendor(vendor)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className={`font-medium ${colors.text}`}>{vendor}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {products.map((p) => p.product_name).join(", ")}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {selectedVendors.length === 0 && (
          <p className="text-sm text-amber-600 mt-3">
            Select at least one vendor to continue
          </p>
        )}
      </div>

      {/* Test Period */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Test Period</h3>
        <div className="grid grid-cols-3 gap-3">
          {TEST_PERIODS.map((period) => (
            <button
              key={period.days}
              type="button"
              onClick={() => setTestPeriod(period.days as 7 | 14 | 30)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                testPeriod === period.days
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold text-gray-900">{period.label}</div>
              <div className="text-sm text-gray-500">{period.description}</div>
              {period.recommended && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  Recommended
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Additional Information
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="expectedRequests"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Expected Monthly Requests
            </label>
            <input
              id="expectedRequests"
              type="number"
              value={expectedRequests}
              onChange={(e) => setExpectedRequests(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g. 100000"
            />
          </div>

          <div>
            <label
              htmlFor="useCaseDetails"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Use Case Details
            </label>
            <textarea
              id="useCaseDetails"
              value={useCaseDetails}
              onChange={(e) => setUseCaseDetails(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Describe how you plan to use the APIs/SDKs..."
            />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-blue-500 text-xl">ℹ️</span>
          <div>
            <h4 className="font-medium text-blue-800">What happens next?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Our sales team will review your request and provide test
              credentials within 1-2 business days. You&apos;ll receive an email
              with instructions on how to access the test keys.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Request Test Keys
            <span>→</span>
          </>
        )}
      </button>
    </form>
  );
}
