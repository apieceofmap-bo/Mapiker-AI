/**
 * Quality Evaluation Dimensions - Type Definitions
 * Based on Quality Evaluator project's 6 quality dimensions
 */

// =============================================================================
// Score Color Coding
// =============================================================================

export type ScoreLevel = 'excellent' | 'good' | 'fair' | 'poor';

export const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
} as const;

export const SCORE_COLORS: Record<ScoreLevel, string> = {
  excellent: '#10B981', // Green
  good: '#2563EB',      // Blue
  fair: '#F59E0B',      // Orange
  poor: '#EF4444',      // Red
};

export const SCORE_LABELS: Record<ScoreLevel, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'good';
  if (score >= SCORE_THRESHOLDS.fair) return 'fair';
  return 'poor';
}

export function getScoreColor(score: number): string {
  return SCORE_COLORS[getScoreLevel(score)];
}

export function getScoreLabel(score: number): string {
  return SCORE_LABELS[getScoreLevel(score)];
}

// =============================================================================
// Dimension 1: Feature Availability Matrix
// =============================================================================

export interface FeatureAvailabilityItem {
  featureName: string;
  projectACovered: boolean;
  projectBCovered: boolean;
}

export interface ProductFeatureComparison {
  categoryName: string; // e.g., "Routing Products", "Geocoding Products"
  projectAProduct: string; // e.g., "Google Directions API"
  projectBProduct: string; // e.g., "HERE Routing API"
  features: FeatureAvailabilityItem[];
}

export interface FeatureAvailabilityMatrix {
  comparisons: ProductFeatureComparison[];
}

// =============================================================================
// Dimension 2: Data Coverage Matrix
// =============================================================================

export interface DataCoverageMetrics {
  poiCount: number;
  buildingAreaSqKm: number;
  roadLengthKm: number;
  lastUpdated?: string;
}

// =============================================================================
// Dimension 3: Geocoding Accuracy
// =============================================================================

export interface DeviationDistribution {
  under10m: number;
  from10to25m: number;
  from25to50m: number;
  from50to100m: number;
  over100m: number;
}

export interface GeocodingAccuracyMetrics {
  geocodingScore: number; // 0-100
  agreementRate: number;  // 0-100
  componentCompleteness: Record<string, number>; // e.g., { "street": 95, "city": 98, "postal": 90 }
  deviationDistribution: DeviationDistribution;
}

// =============================================================================
// Dimension 4: POI & Address Quality
// =============================================================================

export interface POIQualityMetrics {
  coverageScore: number;        // Score 1: 0-100
  positionAccuracyScore: number; // Score 2: 0-100
  totalSeeds: number;
  avgDistanceM: number;
}

// =============================================================================
// Dimension 5: Building Coverage (Statistics Only - No Score)
// =============================================================================

export interface BuildingCoverageMetrics {
  buildingCount: number;
  totalAreaSqKm: number;
  heightDataAvailability: number; // percentage 0-100
  // Note: No quality score for this dimension
}

// =============================================================================
// Dimension 6: Routing Quality
// =============================================================================

export interface NetworkCoverage {
  totalRoadLengthKm: number;
  highwayKm: number;
  primaryKm: number;
}

export interface RoutingQualityMetrics {
  successRateScore: number;       // Score 1: 0-100
  efficiencyScore: number;        // Score 2: 0-100
  guidanceAccuracyScore?: number; // Score 3: 0-100 (Phase 2 - optional)
  networkCoverage: NetworkCoverage;
}

// =============================================================================
// Combined Report Types
// =============================================================================

export interface VendorQualityReport {
  vendor: string;
  region: string;
  featureAvailability: FeatureAvailabilityMatrix;
  dataCoverage: DataCoverageMetrics;
  geocodingAccuracy: GeocodingAccuracyMetrics;
  poiQuality: POIQualityMetrics;
  buildingCoverage: BuildingCoverageMetrics;
  routingQuality: RoutingQualityMetrics;
}

export interface ProjectQualityData {
  projectId: string;
  projectName: string;
  selectedProducts: {
    productId: string;
    productName: string;
    provider: string;
    category: string;
  }[];
  qualityReport: VendorQualityReport;
}

export interface QualityComparisonData {
  projectA: ProjectQualityData;
  projectB: ProjectQualityData;
  featureAvailability: FeatureAvailabilityMatrix; // Cross-project comparison
  comparisonDate: string;
  region: string;
}

// =============================================================================
// Summary Score Calculation
// =============================================================================

export interface QualitySummary {
  overallScore: number;
  geocodingScore: number;
  poiCoverageScore: number;
  poiAccuracyScore: number;
  routingSuccessScore: number;
  routingEfficiencyScore: number;
}

export function calculateQualitySummary(report: VendorQualityReport): QualitySummary {
  const scores = {
    geocodingScore: report.geocodingAccuracy.geocodingScore,
    poiCoverageScore: report.poiQuality.coverageScore,
    poiAccuracyScore: report.poiQuality.positionAccuracyScore,
    routingSuccessScore: report.routingQuality.successRateScore,
    routingEfficiencyScore: report.routingQuality.efficiencyScore,
  };

  // Calculate overall as average of available scores
  const scoreValues = Object.values(scores).filter(s => s !== undefined && s !== null);
  const overallScore = scoreValues.length > 0
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
    : 0;

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    ...scores,
  };
}

// =============================================================================
// Dimension Metadata
// =============================================================================

export type QualityDimensionId =
  | 'feature_availability'
  | 'data_coverage'
  | 'geocoding_accuracy'
  | 'poi_quality'
  | 'building_coverage'
  | 'routing_quality';

export interface QualityDimensionMeta {
  id: QualityDimensionId;
  name: string;
  description: string;
  hasScore: boolean;
  scoreCount: number;
  icon: string;
}

export const QUALITY_DIMENSIONS: QualityDimensionMeta[] = [
  {
    id: 'feature_availability',
    name: 'Feature Availability',
    description: 'Comparison of features covered by selected products',
    hasScore: false,
    scoreCount: 0,
    icon: 'CheckCircle',
  },
  {
    id: 'data_coverage',
    name: 'Data Coverage',
    description: 'POI, building, and road network statistics',
    hasScore: false,
    scoreCount: 0,
    icon: 'Database',
  },
  {
    id: 'geocoding_accuracy',
    name: 'Geocoding Accuracy',
    description: 'Address-to-coordinate conversion accuracy',
    hasScore: true,
    scoreCount: 1,
    icon: 'MapPin',
  },
  {
    id: 'poi_quality',
    name: 'POI & Address Quality',
    description: 'Point of interest coverage and position accuracy',
    hasScore: true,
    scoreCount: 2,
    icon: 'Building',
  },
  {
    id: 'building_coverage',
    name: 'Building Coverage',
    description: 'Building footprint and height data availability',
    hasScore: false,
    scoreCount: 0,
    icon: 'Home',
  },
  {
    id: 'routing_quality',
    name: 'Routing Quality',
    description: 'Route calculation success rate and efficiency',
    hasScore: true,
    scoreCount: 3,
    icon: 'Navigation',
  },
];

// =============================================================================
// Metric Tooltips for UI
// =============================================================================

export const METRIC_TOOLTIPS: Record<string, string> = {
  // Geocoding
  geocoding_score: "Accuracy of converting addresses to GPS coordinates. Measures position deviation and address component completeness.",

  // POI Quality
  coverage_score: "Completeness of the POI database. Higher scores indicate more businesses and locations are included in the dataset.",
  position_accuracy: "Precision of POI coordinates. Measures average distance error from actual locations. Lower error = higher score.",

  // Routing Quality
  success_rate: "Percentage of route calculations completed successfully. Higher scores indicate more reliable routing service.",
  efficiency: "Route optimization quality. Measures how well routes are optimized for distance, time, and traffic avoidance.",
  guidance: "Turn-by-turn navigation accuracy. Coming in Phase 2.",

  // Building Coverage (Statistics)
  building_count: "Total number of buildings with footprint data available in the coverage area.",
  height_data: "Percentage of buildings with 3D height information for visualization and shadow analysis.",

  // Data Coverage (Statistics)
  poi_count: "Total number of Points of Interest in the database for the selected region.",
  road_length: "Total length of road network data available in kilometers.",
};
