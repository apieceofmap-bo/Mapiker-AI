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
          <h4 className="font-medium text-[#37352f]">Select Countries</h4>
          <p className="text-sm text-[#787774]">
            Choose the countries to include in the quality report
          </p>
        </div>
        {selectedCountries.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-[#e03e3e] hover:underline"
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
          className="w-full px-4 py-2 pl-10 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f]"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9a97]">
          🔍
        </span>
      </div>

      {/* Selected Countries Preview */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-[rgba(46,170,220,0.08)] rounded-md">
          {selectedCountries.map((code) => {
            const country = Object.values(countriesByRegion)
              .flat()
              .find((c) => c.code === code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[rgba(46,170,220,0.15)] text-[#2eaadc] rounded-full text-sm"
              >
                {country?.name || code}
                <button
                  onClick={() => toggleCountry(code)}
                  className="hover:text-[#1d8db8]"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Regions */}
      <div className="border border-[#e9e9e7] rounded-md divide-y divide-[#e9e9e7] max-h-80 overflow-y-auto">
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
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f7f6f3]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transform transition-transform text-[#787774] ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                  <span className="font-medium text-[#37352f]">{region}</span>
                  <span className="text-sm text-[#787774]">
                    ({countries.length} countries)
                  </span>
                </div>
                {selectedInRegion > 0 && (
                  <span className="px-2 py-0.5 bg-[rgba(46,170,220,0.15)] text-[#2eaadc] text-xs rounded-full">
                    {selectedInRegion} selected
                  </span>
                )}
              </button>

              {/* Countries */}
              {isExpanded && (
                <div className="px-4 py-2 bg-[#f7f6f3]">
                  <button
                    onClick={() => selectAllInRegion(region)}
                    className="text-sm text-[#2eaadc] hover:underline mb-2"
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
                          className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[rgba(46,170,220,0.15)] text-[#2eaadc]"
                              : "bg-white hover:bg-[#e9e9e7]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCountry(country.code)}
                            className="rounded border-[#e9e9e7] text-[#37352f] focus:ring-[#37352f]"
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
      <div className="text-sm text-[#787774]">
        {selectedCountries.length === 0 ? (
          <span className="text-[#b8860b]">
            Select at least 1 country to continue
          </span>
        ) : (
          <span>
            <span className="font-medium text-[#37352f]">{selectedCountries.length}</span>{" "}
            {selectedCountries.length === 1 ? "country" : "countries"} selected
          </span>
        )}
      </div>
    </div>
  );
}
