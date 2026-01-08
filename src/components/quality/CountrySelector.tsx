"use client";

import { useState, useMemo } from "react";
import { Country } from "@/lib/types";
import { getCountriesByRegion } from "@/lib/qualityEvaluationOptions";

interface CountrySelectorProps {
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
}

export default function CountrySelector({
  selectedCountries,
  onChange,
}: CountrySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(["Asia"])
  );

  const countriesByRegion = useMemo(() => getCountriesByRegion(), []);
  const regions = Object.keys(countriesByRegion).sort();

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countriesByRegion;

    const query = searchQuery.toLowerCase();
    const result: Record<string, Country[]> = {};

    Object.entries(countriesByRegion).forEach(([region, countries]) => {
      const filtered = countries.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query)
      );
      if (filtered.length > 0) {
        result[region] = filtered;
      }
    });

    return result;
  }, [countriesByRegion, searchQuery]);

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      onChange(selectedCountries.filter((c) => c !== code));
    } else {
      onChange([...selectedCountries, code]);
    }
  };

  const selectAllInRegion = (region: string) => {
    const regionCodes = countriesByRegion[region].map((c) => c.code);
    const allSelected = regionCodes.every((code) =>
      selectedCountries.includes(code)
    );

    if (allSelected) {
      // Deselect all in region
      onChange(selectedCountries.filter((c) => !regionCodes.includes(c)));
    } else {
      // Select all in region
      const newSelection = new Set([...selectedCountries, ...regionCodes]);
      onChange(Array.from(newSelection));
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Select Countries</h4>
          <p className="text-sm text-gray-500">
            Choose the countries to include in the quality report
          </p>
        </div>
        {selectedCountries.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear all ({selectedCountries.length})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* Selected Countries Preview */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
          {selectedCountries.map((code) => {
            const country = Object.values(countriesByRegion)
              .flat()
              .find((c) => c.code === code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {country?.name || code}
                <button
                  onClick={() => toggleCountry(code)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Regions */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {Object.entries(filteredCountries).map(([region, countries]) => {
          const isExpanded = expandedRegions.has(region);
          const selectedInRegion = countries.filter((c) =>
            selectedCountries.includes(c.code)
          ).length;
          const allSelected = selectedInRegion === countries.length;

          return (
            <div key={region}>
              {/* Region Header */}
              <button
                onClick={() => toggleRegion(region)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transform transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                  <span className="font-medium text-gray-900">{region}</span>
                  <span className="text-sm text-gray-500">
                    ({countries.length} countries)
                  </span>
                </div>
                {selectedInRegion > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {selectedInRegion} selected
                  </span>
                )}
              </button>

              {/* Countries */}
              {isExpanded && (
                <div className="px-4 py-2 bg-gray-50">
                  <button
                    onClick={() => selectAllInRegion(region)}
                    className="text-sm text-blue-600 hover:text-blue-700 mb-2"
                  >
                    {allSelected ? "Deselect all" : "Select all"} in {region}
                  </button>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {countries.map((country) => {
                      const isSelected = selectedCountries.includes(
                        country.code
                      );
                      return (
                        <label
                          key={country.code}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-100 text-blue-700"
                              : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCountry(country.code)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{country.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        {selectedCountries.length === 0 ? (
          <span className="text-amber-600">
            Select at least 1 country to continue
          </span>
        ) : (
          <span>
            <span className="font-medium">{selectedCountries.length}</span>{" "}
            {selectedCountries.length === 1 ? "country" : "countries"} selected
          </span>
        )}
      </div>
    </div>
  );
}
