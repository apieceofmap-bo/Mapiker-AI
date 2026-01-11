"use client";

import { Project } from "@/lib/types";

interface PricingComparisonProps {
  projects: Project[];
}

export default function PricingComparison({ projects }: PricingComparisonProps) {
  // Get all unique vendors across all projects
  const allVendors = new Set<string>();
  projects.forEach((project) => {
    project.pricing_data?.vendors.forEach((v) => allVendors.add(v.vendor));
  });
  const vendors = Array.from(allVendors).sort();

  // Check if any project has pricing data
  const hasPricingData = projects.some((p) => p.pricing_calculated && p.pricing_data);

  if (!hasPricingData) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">&#x1F4B0;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          No pricing data available
        </h3>
        <p className="text-sm text-[#787774]">
          Complete the pricing step for at least one project to see the comparison.
        </p>
      </div>
    );
  }

  // Calculate the cheapest and most expensive totals
  const totals = projects
    .filter((p) => p.pricing_data)
    .map((p) => ({ id: p.id, total: p.pricing_data!.total_estimated_monthly }));
  const minTotal = Math.min(...totals.map((t) => t.total));
  const maxTotal = Math.max(...totals.map((t) => t.total));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e9e9e7]">
            <th className="text-left py-4 px-6 text-sm font-semibold text-[#37352f] bg-[#f7f6f3]">
              Vendor
            </th>
            {projects.map((project, index) => (
              <th
                key={project.id}
                className="text-right py-4 px-6 text-sm font-semibold text-[#37352f] bg-[#f7f6f3]"
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
          {vendors.map((vendor) => (
            <tr key={vendor} className="border-b border-[#e9e9e7]">
              <td className="py-4 px-6 text-sm text-[#37352f] font-medium">
                {vendor}
              </td>
              {projects.map((project) => {
                const vendorData = project.pricing_data?.vendors.find(
                  (v) => v.vendor === vendor
                );
                return (
                  <td
                    key={project.id}
                    className="py-4 px-6 text-sm text-right text-[#37352f]"
                  >
                    {vendorData ? (
                      <div>
                        <div className="font-medium">
                          {formatCurrency(vendorData.subtotal)}
                        </div>
                        <div className="text-xs text-[#787774]">
                          {vendorData.products.length} product
                          {vendorData.products.length !== 1 ? "s" : ""}
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
            <td className="py-4 px-6 text-sm font-semibold text-[#37352f]">
              Total Monthly Cost
            </td>
            {projects.map((project) => {
              const total = project.pricing_data?.total_estimated_monthly || 0;
              const isLowest = total === minTotal && total > 0;
              const isHighest = total === maxTotal && projects.length > 1;
              return (
                <td
                  key={project.id}
                  className={`py-4 px-6 text-right ${
                    isLowest
                      ? "text-[#0f7b6c]"
                      : isHighest
                      ? "text-[#e03e3e]"
                      : "text-[#37352f]"
                  }`}
                >
                  <div className="text-lg font-bold">
                    {project.pricing_data
                      ? formatCurrency(total)
                      : "-"}
                  </div>
                  {isLowest && total > 0 && (
                    <span className="text-xs bg-[rgba(15,123,108,0.15)] text-[#0f7b6c] px-2 py-0.5 rounded-full">
                      Lowest
                    </span>
                  )}
                  {isHighest && projects.length > 1 && (
                    <span className="text-xs bg-[rgba(224,62,62,0.08)] text-[#e03e3e] px-2 py-0.5 rounded-full">
                      Highest
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* Cost Difference Summary */}
      {minTotal !== maxTotal && minTotal > 0 && (
        <div className="p-6 border-t border-[#e9e9e7]">
          <div className="text-sm text-[#787774]">
            <span className="font-medium text-[#37352f]">Price difference:</span>{" "}
            {formatCurrency(maxTotal - minTotal)} ({Math.round(((maxTotal - minTotal) / minTotal) * 100)}% more expensive)
          </div>
        </div>
      )}
    </div>
  );
}
