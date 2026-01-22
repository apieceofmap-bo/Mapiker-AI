"use client";

import { useMemo } from "react";
import { Project, SelectionState } from "@/lib/types";

interface QualityComparisonProps {
  projects: Project[];
}

interface BasicMetrics {
  avgMatchScore: number;
  featureCoverage: number;
  vendorCount: number;
  categoryCount: number;
  totalProducts: number;
}

// Demo quality evaluation metrics (for Phase 3 - random data)
interface AdvancedQualityMetrics {
  geocodingAccuracy: number;
  routeOptimization: number;
  mapCoverage: number;
  dataFreshness: number;
  apiReliability: number;
  responseTime: number; // in ms
  overallScore: number;
}

function calculateBasicMetrics(project: Project): BasicMetrics | null {
  if (!project.match_result) return null;

  const selectionState = project.selected_products as SelectionState;
  const selectedProductIds = new Set<string>();

  // Handle both single values and arrays
  Object.values(selectionState).forEach(value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(id => selectedProductIds.add(id));
    } else {
      selectedProductIds.add(value);
    }
  });

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

// Generate deterministic random demo data based on project ID
function generateDemoQualityMetrics(projectId: string): AdvancedQualityMetrics {
  // Use project ID to seed pseudo-random values
  const hash = projectId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  const seededRandom = (seed: number, offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return (x - Math.floor(x)) * 100;
  };

  const geocodingAccuracy = 75 + seededRandom(hash, 1) * 0.2;
  const routeOptimization = 70 + seededRandom(hash, 2) * 0.25;
  const mapCoverage = 80 + seededRandom(hash, 3) * 0.15;
  const dataFreshness = 65 + seededRandom(hash, 4) * 0.3;
  const apiReliability = 90 + seededRandom(hash, 5) * 0.08;
  const responseTime = 50 + seededRandom(hash, 6) * 2;

  const overallScore = (geocodingAccuracy + routeOptimization + mapCoverage + dataFreshness + apiReliability) / 5;

  return {
    geocodingAccuracy: Math.min(geocodingAccuracy, 98),
    routeOptimization: Math.min(routeOptimization, 95),
    mapCoverage: Math.min(mapCoverage, 99),
    dataFreshness: Math.min(dataFreshness, 95),
    apiReliability: Math.min(apiReliability, 99.9),
    responseTime: Math.round(responseTime),
    overallScore: Math.min(overallScore, 97),
  };
}

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-[#e9e9e7] rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

function LockedMetricPlaceholder() {
  return (
    <div className="w-full bg-[#e9e9e7] rounded-full h-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#e9e9e7] via-[#d3d3d3] to-[#e9e9e7] animate-shimmer"
           style={{ backgroundSize: '200% 100%' }} />
    </div>
  );
}

export default function QualityComparison({ projects }: QualityComparisonProps) {
  // Calculate basic metrics for all projects
  const projectData = useMemo(() => {
    return projects.map((project) => ({
      project,
      basicMetrics: calculateBasicMetrics(project),
      advancedMetrics: generateDemoQualityMetrics(project.id),
      // Check if quality data should be shown (report purchased or test key issued)
      hasQualityAccess: project.quality_report_requested,
    }));
  }, [projects]);

  // Check if any project has basic metrics
  const hasAnyMetrics = projectData.some((pd) => pd.basicMetrics !== null);

  if (!hasAnyMetrics) {
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
  const maxScore = Math.max(...projectData.map((pd) => pd.basicMetrics?.avgMatchScore || 0));
  const maxVendors = Math.max(...projectData.map((pd) => pd.basicMetrics?.vendorCount || 0));
  const maxProducts = Math.max(...projectData.map((pd) => pd.basicMetrics?.totalProducts || 0));
  const bestCoverage = Math.max(...projectData.map((pd) => pd.basicMetrics?.featureCoverage || 0));

  const basicMetricsDef = [
    {
      label: "Average Match Score",
      key: "avgMatchScore" as const,
      format: (v: number) => v.toFixed(1),
      max: 100,
      color: "bg-[#2eaadc]",
      description: "How well products match requirements",
    },
    {
      label: "Feature Coverage",
      key: "featureCoverage" as const,
      format: (v: number) => `${v.toFixed(0)}%`,
      max: 100,
      color: "bg-[#0f7b6c]",
      description: "Percentage of required features covered",
    },
    {
      label: "Vendor Diversity",
      key: "vendorCount" as const,
      format: (v: number) => `${v} vendor${v !== 1 ? "s" : ""}`,
      max: maxVendors,
      color: "bg-[#9b59b6]",
      description: "Number of different providers",
    },
    {
      label: "Total Products",
      key: "totalProducts" as const,
      format: (v: number) => v.toString(),
      max: maxProducts,
      color: "bg-[#e67e22]",
      description: "Products selected",
    },
  ];

  const advancedMetricsDef = [
    {
      label: "Geocoding Accuracy",
      key: "geocodingAccuracy" as const,
      format: (v: number) => `${v.toFixed(1)}%`,
      max: 100,
      color: "bg-[#3498db]",
      description: "Address-to-coordinate conversion accuracy",
    },
    {
      label: "Route Optimization",
      key: "routeOptimization" as const,
      format: (v: number) => `${v.toFixed(1)}%`,
      max: 100,
      color: "bg-[#2ecc71]",
      description: "Routing efficiency and optimization score",
    },
    {
      label: "Map Coverage",
      key: "mapCoverage" as const,
      format: (v: number) => `${v.toFixed(1)}%`,
      max: 100,
      color: "bg-[#9b59b6]",
      description: "Geographic data coverage completeness",
    },
    {
      label: "Data Freshness",
      key: "dataFreshness" as const,
      format: (v: number) => `${v.toFixed(1)}%`,
      max: 100,
      color: "bg-[#f39c12]",
      description: "How up-to-date the map data is",
    },
    {
      label: "API Reliability",
      key: "apiReliability" as const,
      format: (v: number) => `${v.toFixed(1)}%`,
      max: 100,
      color: "bg-[#1abc9c]",
      description: "Service uptime and reliability",
    },
    {
      label: "Response Time",
      key: "responseTime" as const,
      format: (v: number) => `${v}ms`,
      max: 200,
      color: "bg-[#e74c3c]",
      description: "Average API response latency",
      lowerIsBetter: true,
    },
  ];

  // Check if any project has quality access
  const anyHasQualityAccess = projectData.some(pd => pd.hasQualityAccess);

  return (
    <div className="divide-y divide-[#e9e9e7]">
      {/* Basic Metrics Section */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-[#37352f] mb-1">Basic Metrics</h3>
        <p className="text-xs text-[#787774] mb-4">Based on product selection and feature matching</p>

        <div className="space-y-6">
          {basicMetricsDef.map((metric) => (
            <div key={metric.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#37352f]">{metric.label}</span>
                <span className="text-xs text-[#787774]">{metric.description}</span>
              </div>
              <div className="space-y-3">
                {projectData.map(({ project, basicMetrics: m }, index) => {
                  const value = m?.[metric.key] || 0;
                  const isBest =
                    (metric.key === "avgMatchScore" && value === maxScore && value > 0) ||
                    (metric.key === "featureCoverage" && value === bestCoverage && value > 0);

                  return (
                    <div key={project.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-32 flex-shrink-0">
                        <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs text-[#37352f] truncate">{project.name}</span>
                      </div>
                      <div className="flex-1">
                        {m && <MetricBar value={value} max={metric.max} color={metric.color} />}
                      </div>
                      <div className="w-20 text-right flex items-center justify-end gap-1">
                        <span className={`text-sm font-medium ${isBest ? "text-[#0f7b6c]" : "text-[#37352f]"}`}>
                          {m ? metric.format(value) : "-"}
                        </span>
                        {isBest && (
                          <span className="text-[10px] bg-[rgba(15,123,108,0.15)] text-[#0f7b6c] px-1.5 py-0.5 rounded-full">
                            Best
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Quality Metrics Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-[#37352f]">Advanced Quality Evaluation</h3>
          {!anyHasQualityAccess && (
            <span className="text-xs bg-[#fef3c7] text-[#92400e] px-2 py-1 rounded-full font-medium">
              Demo Data
            </span>
          )}
        </div>
        <p className="text-xs text-[#787774] mb-4">
          {anyHasQualityAccess
            ? "Real-world quality metrics from our evaluation platform"
            : "Preview with sample data - purchase Quality Report or request Test Keys for actual metrics"
          }
        </p>

        {!anyHasQualityAccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#f7f6f3] to-[#fafafa] border border-[#e9e9e7] rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-[#37352f] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#37352f] mb-1">Unlock Real Quality Data</h4>
                <p className="text-xs text-[#787774]">
                  The metrics below are sample data for demonstration. To see actual quality evaluation results,
                  purchase a Quality Report or request Test Keys from the project&apos;s Quality Evaluation page.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {advancedMetricsDef.map((metric) => (
            <div key={metric.key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#37352f]">{metric.label}</span>
                <span className="text-xs text-[#787774]">{metric.description}</span>
              </div>
              <div className="space-y-3">
                {projectData.map(({ project, advancedMetrics, hasQualityAccess }, index) => {
                  const value = advancedMetrics[metric.key];
                  const allValues = projectData.map(pd => pd.advancedMetrics[metric.key]);
                  const isBest = metric.key === "responseTime"
                    ? value === Math.min(...allValues)
                    : value === Math.max(...allValues);

                  return (
                    <div key={project.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-32 flex-shrink-0">
                        <span className="w-5 h-5 rounded-full bg-[#37352f] text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs text-[#37352f] truncate">{project.name}</span>
                      </div>
                      <div className="flex-1">
                        {hasQualityAccess ? (
                          <MetricBar
                            value={metric.key === "responseTime" ? 200 - value : value}
                            max={metric.max}
                            color={metric.color}
                          />
                        ) : (
                          <div className="relative">
                            <MetricBar
                              value={metric.key === "responseTime" ? 200 - value : value}
                              max={metric.max}
                              color={metric.color}
                            />
                            <div className="absolute inset-0 bg-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="w-20 text-right flex items-center justify-end gap-1">
                        <span className={`text-sm font-medium ${
                          hasQualityAccess
                            ? (isBest ? "text-[#0f7b6c]" : "text-[#37352f]")
                            : "text-[#9b9a97]"
                        }`}>
                          {hasQualityAccess ? metric.format(value) : metric.format(value)}
                        </span>
                        {isBest && hasQualityAccess && (
                          <span className="text-[10px] bg-[rgba(15,123,108,0.15)] text-[#0f7b6c] px-1.5 py-0.5 rounded-full">
                            Best
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Score Summary */}
      <div className="p-6 bg-[#f7f6f3]">
        <h3 className="text-sm font-semibold text-[#37352f] mb-4">Overall Quality Score</h3>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${projects.length}, 1fr)` }}
        >
          {projectData.map(({ project, basicMetrics, advancedMetrics, hasQualityAccess }, index) => {
            // Calculate combined overall score
            const basicScore = basicMetrics
              ? (basicMetrics.avgMatchScore * 0.3 + basicMetrics.featureCoverage * 0.3 + Math.min(basicMetrics.vendorCount / 4, 1) * 100 * 0.1)
              : 0;
            const advancedScore = advancedMetrics.overallScore * 0.3;
            const combinedScore = basicScore + advancedScore;

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
                <div className={`text-3xl font-bold mb-1 ${hasQualityAccess ? "text-[#37352f]" : "text-[#9b9a97]"}`}>
                  {basicMetrics ? combinedScore.toFixed(0) : "-"}
                </div>
                <div className="text-xs text-[#787774] mb-3">Combined Quality Score</div>

                {basicMetrics && (
                  <div className="space-y-1 text-xs text-[#787774] border-t border-[#e9e9e7] pt-3">
                    <div className="flex justify-between">
                      <span>Match Score:</span>
                      <span className="font-medium text-[#37352f]">{basicMetrics.avgMatchScore.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage:</span>
                      <span className="font-medium text-[#37352f]">{basicMetrics.featureCoverage.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Index:</span>
                      <span className={`font-medium ${hasQualityAccess ? "text-[#37352f]" : "text-[#9b9a97]"}`}>
                        {advancedMetrics.overallScore.toFixed(0)}
                      </span>
                    </div>
                  </div>
                )}

                {!hasQualityAccess && (
                  <div className="mt-3 pt-3 border-t border-[#e9e9e7]">
                    <span className="text-[10px] bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-full">
                      Demo data
                    </span>
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
