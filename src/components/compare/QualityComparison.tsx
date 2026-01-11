"use client";

import { Project, SelectionState } from "@/lib/types";

interface QualityComparisonProps {
  projects: Project[];
}

interface QualityMetrics {
  avgMatchScore: number;
  featureCoverage: number;
  vendorCount: number;
  categoryCount: number;
  totalProducts: number;
}

function calculateQualityMetrics(project: Project): QualityMetrics | null {
  if (!project.match_result) return null;

  const selectionState = project.selected_products as SelectionState;
  const selectedProductIds = new Set<string>(
    Object.values(selectionState).filter(Boolean) as string[]
  );

  let totalScore = 0;
  let productCount = 0;
  const vendors = new Set<string>();
  const categories = new Set<string>();

  project.match_result.categories.forEach((category) => {
    category.products.forEach((product) => {
      if (selectedProductIds.has(product.id)) {
        totalScore += product.match_score;
        productCount++;
        vendors.add(product.provider);
        categories.add(category.id);
      }
    });
  });

  const featureCoverage = project.match_result.feature_coverage?.coverage_percent || 0;

  return {
    avgMatchScore: productCount > 0 ? totalScore / productCount : 0,
    featureCoverage,
    vendorCount: vendors.size,
    categoryCount: categories.size,
    totalProducts: productCount,
  };
}

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-[#e9e9e7] rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function QualityComparison({ projects }: QualityComparisonProps) {
  // Calculate metrics for all projects
  const projectMetrics = projects.map((project) => ({
    project,
    metrics: calculateQualityMetrics(project),
  }));

  // Check if any project has metrics
  const hasMetrics = projectMetrics.some((pm) => pm.metrics !== null);

  if (!hasMetrics) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">&#x1F4CA;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          No quality data available
        </h3>
        <p className="text-sm text-[#787774]">
          Complete the product matching step for at least one project to see quality metrics.
        </p>
      </div>
    );
  }

  // Find max values for bar scaling
  const maxScore = Math.max(
    ...projectMetrics.map((pm) => pm.metrics?.avgMatchScore || 0)
  );
  const maxVendors = Math.max(
    ...projectMetrics.map((pm) => pm.metrics?.vendorCount || 0)
  );
  const maxProducts = Math.max(
    ...projectMetrics.map((pm) => pm.metrics?.totalProducts || 0)
  );

  // Determine best values
  const bestScore = maxScore;
  const bestCoverage = Math.max(
    ...projectMetrics.map((pm) => pm.metrics?.featureCoverage || 0)
  );

  const metrics = [
    {
      label: "Average Match Score",
      key: "avgMatchScore" as const,
      format: (v: number) => v.toFixed(1),
      max: 100,
      color: "bg-[#2eaadc]",
      description: "Higher is better - shows how well products match requirements",
    },
    {
      label: "Feature Coverage",
      key: "featureCoverage" as const,
      format: (v: number) => `${v.toFixed(0)}%`,
      max: 100,
      color: "bg-[#0f7b6c]",
      description: "Percentage of required features covered by selected products",
    },
    {
      label: "Vendor Diversity",
      key: "vendorCount" as const,
      format: (v: number) => `${v} vendor${v !== 1 ? "s" : ""}`,
      max: maxVendors,
      color: "bg-[#9b59b6]",
      description: "Number of different providers in the selection",
    },
    {
      label: "Total Products",
      key: "totalProducts" as const,
      format: (v: number) => v.toString(),
      max: maxProducts,
      color: "bg-[#e67e22]",
      description: "Total number of products selected",
    },
  ];

  return (
    <div className="divide-y divide-[#e9e9e7]">
      {/* Metrics Comparison */}
      {metrics.map((metric) => (
        <div key={metric.key} className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#37352f]">{metric.label}</h3>
            <p className="text-xs text-[#787774]">{metric.description}</p>
          </div>
          <div className="space-y-4">
            {projectMetrics.map(({ project, metrics: m }, index) => {
              const value = m?.[metric.key] || 0;
              const isBest =
                (metric.key === "avgMatchScore" && value === bestScore && value > 0) ||
                (metric.key === "featureCoverage" && value === bestCoverage && value > 0);

              return (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-[#37352f]">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isBest ? "text-[#0f7b6c]" : "text-[#37352f]"}`}>
                        {m ? metric.format(value) : "-"}
                      </span>
                      {isBest && (
                        <span className="text-xs bg-[rgba(15,123,108,0.15)] text-[#0f7b6c] px-2 py-0.5 rounded-full">
                          Best
                        </span>
                      )}
                    </div>
                  </div>
                  {m && <MetricBar value={value} max={metric.max} color={metric.color} />}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Overall Score Summary */}
      <div className="p-6 bg-[#f7f6f3]">
        <h3 className="text-sm font-semibold text-[#37352f] mb-4">Overall Summary</h3>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}
        >
          {projectMetrics.map(({ project, metrics: m }, index) => {
            // Calculate overall score (weighted average)
            const overallScore = m
              ? (m.avgMatchScore * 0.4 + m.featureCoverage * 0.4 + Math.min(m.vendorCount / 4, 1) * 100 * 0.2)
              : 0;

            return (
              <div key={project.id} className="bg-white rounded-lg p-4 border border-[#e9e9e7]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-[#37352f] truncate">
                    {project.name}
                  </span>
                </div>
                <div className="text-3xl font-bold text-[#37352f] mb-1">
                  {m ? overallScore.toFixed(0) : "-"}
                </div>
                <div className="text-xs text-[#787774]">Overall Quality Score</div>
                {m && (
                  <div className="mt-3 space-y-1 text-xs text-[#787774]">
                    <div>Match: {m.avgMatchScore.toFixed(0)}</div>
                    <div>Coverage: {m.featureCoverage.toFixed(0)}%</div>
                    <div>Vendors: {m.vendorCount}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
