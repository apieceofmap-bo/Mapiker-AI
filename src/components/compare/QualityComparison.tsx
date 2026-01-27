"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Project, SelectionState } from "@/lib/types";
import {
  QualityComparisonData,
  calculateQualitySummary,
  getScoreColor,
  getScoreLabel,
} from "@/lib/qualityDimensions";
import { generateMockComparisonData } from "@/lib/mockQualityData";
import {
  DimensionScoreCard,
  ComparisonScoreRow,
  ScoreLegend,
} from "@/components/quality/DimensionScoreCard";

// Icons from @heroicons/react
import {
  CheckCircleIcon,
  CircleStackIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  HomeIcon,
  MapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface QualityComparisonProps {
  projects: Project[];
}

// Icon mapping
const DIMENSION_ICONS: Record<string, React.ReactNode> = {
  CheckCircle: <CheckCircleIcon className="w-5 h-5" />,
  Database: <CircleStackIcon className="w-5 h-5" />,
  MapPin: <MapPinIcon className="w-5 h-5" />,
  Building: <BuildingOffice2Icon className="w-5 h-5" />,
  Home: <HomeIcon className="w-5 h-5" />,
  Navigation: <MapIcon className="w-5 h-5" />,
};

// =============================================================================
// Helper Functions
// =============================================================================

function getSelectedProducts(project: Project) {
  if (!project.match_result) return [];

  const selectionState = project.selected_products as SelectionState;
  const selectedProductIds = new Set<string>();

  Object.values(selectionState).forEach((value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((id) => selectedProductIds.add(id));
    } else {
      selectedProductIds.add(value);
    }
  });

  const products: {
    productId: string;
    productName: string;
    provider: string;
    category: string;
  }[] = [];

  project.match_result.categories.forEach((category) => {
    category.products.forEach((product) => {
      if (selectedProductIds.has(product.id)) {
        products.push({
          productId: product.id,
          productName: product.product_name,
          provider: product.provider,
          category: category.name,
        });
      }
    });
  });

  return products;
}

// =============================================================================
// Feature Availability Matrix Component
// =============================================================================

interface FeatureMatrixProps {
  data: QualityComparisonData;
  projectAName: string;
  projectBName: string;
}

function FeatureAvailabilityMatrix({
  data,
  projectAName,
  projectBName,
}: FeatureMatrixProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <DimensionScoreCard
      title="Feature Availability"
      description="Comparison of features covered by selected products"
      icon={DIMENSION_ICONS.CheckCircle}
    >
      <div className="space-y-3">
        {data.featureAvailability.comparisons.map((comparison) => (
          <div
            key={comparison.categoryName}
            className="border border-[#e9e9e7] rounded-lg overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === comparison.categoryName
                    ? null
                    : comparison.categoryName
                )
              }
              className="w-full flex items-center justify-between px-4 py-3 bg-[#f7f6f3] hover:bg-[#efeeea] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm text-[#37352f]">
                  {comparison.categoryName}
                </span>
                <span className="text-xs text-[#9b9a97]">
                  {comparison.features.filter((f) => f.projectACovered).length}/
                  {comparison.features.filter((f) => f.projectBCovered).length}{" "}
                  features
                </span>
              </div>
              {expandedCategory === comparison.categoryName ? (
                <ChevronUpIcon className="w-4 h-4 text-[#9b9a97]" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-[#9b9a97]" />
              )}
            </button>

            {/* Feature List */}
            <AnimatePresence>
              {expandedCategory === comparison.categoryName && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4">
                    {/* Product Names Row */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="font-medium text-[#9b9a97]">Feature</div>
                      <div className="text-center truncate text-[#787774]">
                        {comparison.projectAProduct}
                      </div>
                      <div className="text-center truncate text-[#787774]">
                        {comparison.projectBProduct}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {comparison.features.map((feature) => (
                        <div
                          key={feature.featureName}
                          className="grid grid-cols-3 gap-2 text-sm py-1 border-t border-[#e9e9e7]"
                        >
                          <div className="text-[#37352f]">
                            {feature.featureName}
                          </div>
                          <div className="text-center">
                            {feature.projectACovered ? (
                              <span className="text-green-600">&#10003;</span>
                            ) : (
                              <span className="text-[#d3d3d0]">&#10007;</span>
                            )}
                          </div>
                          <div className="text-center">
                            {feature.projectBCovered ? (
                              <span className="text-green-600">&#10003;</span>
                            ) : (
                              <span className="text-[#d3d3d0]">&#10007;</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </DimensionScoreCard>
  );
}

// =============================================================================
// Data Coverage Component
// =============================================================================

interface DataCoverageProps {
  projectAData: QualityComparisonData["projectA"];
  projectBData: QualityComparisonData["projectB"];
}

function DataCoverageSection({ projectAData, projectBData }: DataCoverageProps) {
  return (
    <DimensionScoreCard
      title="Data Coverage"
      description="POI, building, and road network statistics"
      icon={DIMENSION_ICONS.Database}
      statistics={[
        {
          label: `${projectAData.projectName} - POI Count`,
          value: projectAData.qualityReport.dataCoverage.poiCount,
        },
        {
          label: `${projectBData.projectName} - POI Count`,
          value: projectBData.qualityReport.dataCoverage.poiCount,
        },
        {
          label: `${projectAData.projectName} - Roads`,
          value: `${projectAData.qualityReport.dataCoverage.roadLengthKm.toLocaleString()} km`,
        },
        {
          label: `${projectBData.projectName} - Roads`,
          value: `${projectBData.qualityReport.dataCoverage.roadLengthKm.toLocaleString()} km`,
        },
      ]}
    />
  );
}

// =============================================================================
// Score Comparison Components
// =============================================================================

interface ScoreComparisonSectionProps {
  projectAData: QualityComparisonData["projectA"];
  projectBData: QualityComparisonData["projectB"];
  hasQualityAccess: boolean;
}

function GeocodingAccuracySection({
  projectAData,
  projectBData,
  hasQualityAccess,
}: ScoreComparisonSectionProps) {
  const scoreA = projectAData.qualityReport.geocodingAccuracy.geocodingScore;
  const scoreB = projectBData.qualityReport.geocodingAccuracy.geocodingScore;

  return (
    <DimensionScoreCard
      title="Geocoding Accuracy"
      description="Address-to-coordinate conversion accuracy"
      icon={DIMENSION_ICONS.MapPin}
      scores={
        hasQualityAccess
          ? [
              { label: projectAData.projectName, value: scoreA },
              { label: projectBData.projectName, value: scoreB },
            ]
          : undefined
      }
    >
      {!hasQualityAccess && (
        <div className="space-y-3">
          <ComparisonScoreRow
            label="Geocoding Score"
            projectAScore={scoreA}
            projectBScore={scoreB}
            projectAName={projectAData.projectName}
            projectBName={projectBData.projectName}
          />
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Demo data - Purchase Quality Report for actual metrics</span>
          </div>
        </div>
      )}
    </DimensionScoreCard>
  );
}

function POIQualitySection({
  projectAData,
  projectBData,
  hasQualityAccess,
}: ScoreComparisonSectionProps) {
  return (
    <DimensionScoreCard
      title="POI & Address Quality"
      description="Point of interest coverage and position accuracy"
      icon={DIMENSION_ICONS.Building}
    >
      <div className="space-y-3">
        <ComparisonScoreRow
          label="Coverage Score"
          projectAScore={projectAData.qualityReport.poiQuality.coverageScore}
          projectBScore={projectBData.qualityReport.poiQuality.coverageScore}
          projectAName={projectAData.projectName}
          projectBName={projectBData.projectName}
        />
        <ComparisonScoreRow
          label="Position Accuracy"
          projectAScore={
            projectAData.qualityReport.poiQuality.positionAccuracyScore
          }
          projectBScore={
            projectBData.qualityReport.poiQuality.positionAccuracyScore
          }
          projectAName={projectAData.projectName}
          projectBName={projectBData.projectName}
        />
        {!hasQualityAccess && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Demo data</span>
          </div>
        )}
      </div>
    </DimensionScoreCard>
  );
}

function BuildingCoverageSection({
  projectAData,
  projectBData,
}: ScoreComparisonSectionProps) {
  return (
    <DimensionScoreCard
      title="Building Coverage"
      description="Building footprint and height data availability"
      icon={DIMENSION_ICONS.Home}
      statisticsOnly
      statisticsOnlyMessage="Statistics only - no quality score for this dimension"
      statistics={[
        {
          label: `${projectAData.projectName} - Count`,
          value: projectAData.qualityReport.buildingCoverage.buildingCount,
        },
        {
          label: `${projectBData.projectName} - Count`,
          value: projectBData.qualityReport.buildingCoverage.buildingCount,
        },
        {
          label: `${projectAData.projectName} - Height Data`,
          value: `${projectAData.qualityReport.buildingCoverage.heightDataAvailability}%`,
        },
        {
          label: `${projectBData.projectName} - Height Data`,
          value: `${projectBData.qualityReport.buildingCoverage.heightDataAvailability}%`,
        },
      ]}
    />
  );
}

function RoutingQualitySection({
  projectAData,
  projectBData,
  hasQualityAccess,
}: ScoreComparisonSectionProps) {
  return (
    <DimensionScoreCard
      title="Routing Quality"
      description="Route calculation success rate and efficiency"
      icon={DIMENSION_ICONS.Navigation}
    >
      <div className="space-y-3">
        <ComparisonScoreRow
          label="Success Rate"
          projectAScore={
            projectAData.qualityReport.routingQuality.successRateScore
          }
          projectBScore={
            projectBData.qualityReport.routingQuality.successRateScore
          }
          projectAName={projectAData.projectName}
          projectBName={projectBData.projectName}
        />
        <ComparisonScoreRow
          label="Efficiency"
          projectAScore={projectAData.qualityReport.routingQuality.efficiencyScore}
          projectBScore={projectBData.qualityReport.routingQuality.efficiencyScore}
          projectAName={projectAData.projectName}
          projectBName={projectBData.projectName}
        />
        <div className="px-3 py-2 bg-[#f7f6f3] rounded-lg">
          <div className="flex items-center gap-2 text-xs text-[#9b9a97]">
            <span>Guidance Accuracy:</span>
            <span className="text-[#d3d3d0]">TBD (Phase 2)</span>
          </div>
        </div>
        {!hasQualityAccess && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Demo data</span>
          </div>
        )}
      </div>
    </DimensionScoreCard>
  );
}

// =============================================================================
// Executive Summary Component
// =============================================================================

interface ExecutiveSummaryProps {
  projectAData: QualityComparisonData["projectA"];
  projectBData: QualityComparisonData["projectB"];
  hasQualityAccess: boolean;
}

function ExecutiveSummary({
  projectAData,
  projectBData,
  hasQualityAccess,
}: ExecutiveSummaryProps) {
  const summaryA = calculateQualitySummary(projectAData.qualityReport);
  const summaryB = calculateQualitySummary(projectBData.qualityReport);

  return (
    <div className="bg-[#f7f6f3] rounded-xl p-6 mb-6 border border-[#e9e9e7]">
      <h3 className="text-lg font-semibold text-[#37352f] mb-4">
        Executive Summary
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Project A */}
        <div className="bg-white rounded-lg p-4 border border-[#e9e9e7]">
          <div className="text-sm text-[#787774] mb-1">
            {projectAData.projectName}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: getScoreColor(summaryA.overallScore) }}
            >
              {summaryA.overallScore.toFixed(0)}
            </span>
            <span
              className="text-sm"
              style={{ color: getScoreColor(summaryA.overallScore) }}
            >
              {getScoreLabel(summaryA.overallScore)}
            </span>
          </div>
          {!hasQualityAccess && (
            <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
              <LockClosedIcon className="w-3 h-3" />
              Demo
            </div>
          )}
        </div>

        {/* Project B */}
        <div className="bg-white rounded-lg p-4 border border-[#e9e9e7]">
          <div className="text-sm text-[#787774] mb-1">
            {projectBData.projectName}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: getScoreColor(summaryB.overallScore) }}
            >
              {summaryB.overallScore.toFixed(0)}
            </span>
            <span
              className="text-sm"
              style={{ color: getScoreColor(summaryB.overallScore) }}
            >
              {getScoreLabel(summaryB.overallScore)}
            </span>
          </div>
          {!hasQualityAccess && (
            <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
              <LockClosedIcon className="w-3 h-3" />
              Demo
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <ScoreLegend />
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function QualityComparison({ projects }: QualityComparisonProps) {
  // Check if we have at least 2 projects to compare
  const canCompare = projects.length >= 2;

  // Generate mock comparison data
  const comparisonData = useMemo(() => {
    if (!canCompare) return null;

    const projectA = projects[0];
    const projectB = projects[1];

    const productsA = getSelectedProducts(projectA);
    const productsB = getSelectedProducts(projectB);

    return generateMockComparisonData(
      { id: projectA.id, name: projectA.name, products: productsA },
      { id: projectB.id, name: projectB.name, products: productsB },
      "Global"
    );
  }, [projects, canCompare]);

  // Check if any project has quality access
  const hasQualityAccess = projects.some((p) => p.quality_report_requested);

  // No comparison possible
  if (!canCompare || !comparisonData) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">&#x1F4CA;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          Select 2 projects to compare
        </h3>
        <p className="text-sm text-[#787774]">
          Quality comparison requires at least 2 projects with matched products.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Demo Data Warning */}
      {!hasQualityAccess && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <LockClosedIcon className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">
                Preview Mode - Demo Data
              </h4>
              <p className="text-sm text-amber-700">
                The quality metrics shown below are sample data. Purchase a
                Quality Report or request Test Keys from each project&apos;s
                Quality Evaluation page to see actual metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <ExecutiveSummary
        projectAData={comparisonData.projectA}
        projectBData={comparisonData.projectB}
        hasQualityAccess={hasQualityAccess}
      />

      {/* 6 Quality Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dimension 1: Feature Availability */}
        <FeatureAvailabilityMatrix
          data={comparisonData}
          projectAName={comparisonData.projectA.projectName}
          projectBName={comparisonData.projectB.projectName}
        />

        {/* Dimension 2: Data Coverage */}
        <DataCoverageSection
          projectAData={comparisonData.projectA}
          projectBData={comparisonData.projectB}
        />

        {/* Dimension 3: Geocoding Accuracy */}
        <GeocodingAccuracySection
          projectAData={comparisonData.projectA}
          projectBData={comparisonData.projectB}
          hasQualityAccess={hasQualityAccess}
        />

        {/* Dimension 4: POI Quality */}
        <POIQualitySection
          projectAData={comparisonData.projectA}
          projectBData={comparisonData.projectB}
          hasQualityAccess={hasQualityAccess}
        />

        {/* Dimension 5: Building Coverage */}
        <BuildingCoverageSection
          projectAData={comparisonData.projectA}
          projectBData={comparisonData.projectB}
          hasQualityAccess={hasQualityAccess}
        />

        {/* Dimension 6: Routing Quality */}
        <RoutingQualitySection
          projectAData={comparisonData.projectA}
          projectBData={comparisonData.projectB}
          hasQualityAccess={hasQualityAccess}
        />
      </div>
    </div>
  );
}
