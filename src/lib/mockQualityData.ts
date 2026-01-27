/**
 * Mock Quality Data Generator
 * Uses seeded random for consistent mock values based on project/vendor/region
 */

import {
  QualityComparisonData,
  ProjectQualityData,
  VendorQualityReport,
  FeatureAvailabilityMatrix,
  ProductFeatureComparison,
  DataCoverageMetrics,
  GeocodingAccuracyMetrics,
  POIQualityMetrics,
  BuildingCoverageMetrics,
  RoutingQualityMetrics,
} from './qualityDimensions';

// =============================================================================
// Seeded Random Number Generator
// =============================================================================

function seededRandom(seed: string): () => number {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Linear congruential generator
  let state = Math.abs(hash);
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function randomInRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randomInRange(rng, min, max + 1));
}

// =============================================================================
// Vendor-specific Score Patterns
// =============================================================================

interface VendorScorePattern {
  geocoding: { min: number; max: number };
  poiCoverage: { min: number; max: number };
  poiAccuracy: { min: number; max: number };
  routingSuccess: { min: number; max: number };
  routingEfficiency: { min: number; max: number };
}

const VENDOR_PATTERNS: Record<string, VendorScorePattern> = {
  Google: {
    geocoding: { min: 92, max: 98 },
    poiCoverage: { min: 88, max: 95 },
    poiAccuracy: { min: 85, max: 93 },
    routingSuccess: { min: 94, max: 99 },
    routingEfficiency: { min: 82, max: 90 },
  },
  HERE: {
    geocoding: { min: 88, max: 95 },
    poiCoverage: { min: 82, max: 90 },
    poiAccuracy: { min: 80, max: 88 },
    routingSuccess: { min: 92, max: 98 },
    routingEfficiency: { min: 85, max: 93 },
  },
  Mapbox: {
    geocoding: { min: 85, max: 92 },
    poiCoverage: { min: 78, max: 88 },
    poiAccuracy: { min: 75, max: 85 },
    routingSuccess: { min: 90, max: 96 },
    routingEfficiency: { min: 80, max: 88 },
  },
  'NextBillion.ai': {
    geocoding: { min: 80, max: 88 },
    poiCoverage: { min: 72, max: 82 },
    poiAccuracy: { min: 70, max: 80 },
    routingSuccess: { min: 88, max: 95 },
    routingEfficiency: { min: 82, max: 90 },
  },
  OSM: {
    geocoding: { min: 75, max: 85 },
    poiCoverage: { min: 85, max: 92 },
    poiAccuracy: { min: 68, max: 78 },
    routingSuccess: { min: 85, max: 92 },
    routingEfficiency: { min: 75, max: 85 },
  },
};

function getVendorPattern(provider: string): VendorScorePattern {
  return VENDOR_PATTERNS[provider] || VENDOR_PATTERNS['Mapbox']; // Default to Mapbox pattern
}

// =============================================================================
// Balanced Score Generation
// =============================================================================

type MetricType = 'geocoding' | 'poiCoverage' | 'poiAccuracy' | 'routingSuccess' | 'routingEfficiency';

/**
 * Generate balanced scores where different projects can "win" different metrics
 * Uses project seed hash to determine strength areas, creating variety in comparisons
 */
function generateBalancedScore(
  rng: () => number,
  basePattern: VendorScorePattern,
  projectSeed: string,
  metricType: MetricType,
  projectIndex: number
): number {
  // Calculate hash from project seed
  let hash = 0;
  for (let i = 0; i < projectSeed.length; i++) {
    hash = ((hash << 5) - hash) + projectSeed.charCodeAt(i);
    hash = hash & hash;
  }
  hash = Math.abs(hash);

  // Determine if this project is stronger at this metric
  // Uses combination of hash and metric type to vary which project wins each metric
  const metricHash = metricType.length + metricType.charCodeAt(0);
  const isStrength = ((hash + metricHash + projectIndex) % 3) !== 0;

  // Get base range from vendor pattern
  const baseRange = basePattern[metricType];

  // Adjust ranges for strength/weakness
  // Strength: 82-96, Weakness: 68-85 (overlapping ranges for natural variety)
  let min: number, max: number;
  if (isStrength) {
    min = Math.max(baseRange.min, 82);
    max = Math.min(baseRange.max + 4, 96);
  } else {
    min = Math.max(baseRange.min - 10, 68);
    max = Math.min(baseRange.max - 5, 85);
  }

  return Math.round(randomInRange(rng, min, max) * 10) / 10;
}

// =============================================================================
// Mock Data Generators
// =============================================================================

function generateGeocodingAccuracy(
  rng: () => number,
  pattern: VendorScorePattern,
  projectSeed: string = '',
  projectIndex: number = 0
): GeocodingAccuracyMetrics {
  const score = projectSeed
    ? generateBalancedScore(rng, pattern, projectSeed, 'geocoding', projectIndex)
    : randomInRange(rng, pattern.geocoding.min, pattern.geocoding.max);

  return {
    geocodingScore: Math.round(score * 10) / 10,
    agreementRate: Math.round(randomInRange(rng, 85, 98) * 10) / 10,
    componentCompleteness: {
      street: randomInt(rng, 90, 99),
      city: randomInt(rng, 95, 99),
      postal: randomInt(rng, 85, 95),
      country: randomInt(rng, 98, 100),
      state: randomInt(rng, 92, 98),
    },
    deviationDistribution: {
      under10m: randomInt(rng, 45, 60),
      from10to25m: randomInt(rng, 20, 30),
      from25to50m: randomInt(rng, 10, 18),
      from50to100m: randomInt(rng, 3, 8),
      over100m: randomInt(rng, 1, 5),
    },
  };
}

function generatePOIQuality(
  rng: () => number,
  pattern: VendorScorePattern,
  projectSeed: string = '',
  projectIndex: number = 0
): POIQualityMetrics {
  const coverageScore = projectSeed
    ? generateBalancedScore(rng, pattern, projectSeed, 'poiCoverage', projectIndex)
    : randomInRange(rng, pattern.poiCoverage.min, pattern.poiCoverage.max);

  const positionAccuracyScore = projectSeed
    ? generateBalancedScore(rng, pattern, projectSeed, 'poiAccuracy', projectIndex)
    : randomInRange(rng, pattern.poiAccuracy.min, pattern.poiAccuracy.max);

  return {
    coverageScore: Math.round(coverageScore * 10) / 10,
    positionAccuracyScore: Math.round(positionAccuracyScore * 10) / 10,
    totalSeeds: randomInt(rng, 50000, 200000),
    avgDistanceM: Math.round(randomInRange(rng, 8, 25) * 10) / 10,
  };
}

function generateBuildingCoverage(rng: () => number): BuildingCoverageMetrics {
  return {
    buildingCount: randomInt(rng, 80000, 250000),
    totalAreaSqKm: Math.round(randomInRange(rng, 30, 80) * 10) / 10,
    heightDataAvailability: randomInt(rng, 35, 75),
  };
}

function generateRoutingQuality(
  rng: () => number,
  pattern: VendorScorePattern,
  projectSeed: string = '',
  projectIndex: number = 0
): RoutingQualityMetrics {
  const successRateScore = projectSeed
    ? generateBalancedScore(rng, pattern, projectSeed, 'routingSuccess', projectIndex)
    : randomInRange(rng, pattern.routingSuccess.min, pattern.routingSuccess.max);

  const efficiencyScore = projectSeed
    ? generateBalancedScore(rng, pattern, projectSeed, 'routingEfficiency', projectIndex)
    : randomInRange(rng, pattern.routingEfficiency.min, pattern.routingEfficiency.max);

  return {
    successRateScore: Math.round(successRateScore * 10) / 10,
    efficiencyScore: Math.round(efficiencyScore * 10) / 10,
    guidanceAccuracyScore: undefined, // Phase 2
    networkCoverage: {
      totalRoadLengthKm: randomInt(rng, 800, 2000),
      highwayKm: randomInt(rng, 150, 400),
      primaryKm: randomInt(rng, 300, 700),
    },
  };
}

function generateDataCoverage(rng: () => number): DataCoverageMetrics {
  return {
    poiCount: randomInt(rng, 80000, 200000),
    buildingAreaSqKm: Math.round(randomInRange(rng, 30, 80) * 10) / 10,
    roadLengthKm: randomInt(rng, 800, 2000),
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

// =============================================================================
// Feature Availability Matrix Generator
// =============================================================================

const ROUTING_FEATURES = [
  'Turn-by-turn Navigation',
  'Traffic-aware Routing',
  'Truck Routing',
  'EV Routing',
  'Matrix Routing',
  'Route Optimization',
  'Isochrone',
];

const GEOCODING_FEATURES = [
  'Forward Geocoding',
  'Reverse Geocoding',
  'Batch Geocoding',
  'Address Validation',
  'Autocomplete',
];

const MAP_FEATURES = [
  'Vector Tiles',
  'Raster Tiles',
  'Static Maps',
  '3D Buildings',
  'Street View',
];

function generateFeatureAvailability(
  rng: () => number,
  projectAProducts: { productName: string; provider: string; category: string }[],
  projectBProducts: { productName: string; provider: string; category: string }[]
): FeatureAvailabilityMatrix {
  const comparisons: ProductFeatureComparison[] = [];

  // Group products by category
  const categories = ['Routing', 'Geocoding', 'Maps'];
  const featuresByCategory: Record<string, string[]> = {
    Routing: ROUTING_FEATURES,
    Geocoding: GEOCODING_FEATURES,
    Maps: MAP_FEATURES,
  };

  for (const category of categories) {
    const productA = projectAProducts.find(p =>
      p.category.toLowerCase().includes(category.toLowerCase()) ||
      p.productName.toLowerCase().includes(category.toLowerCase())
    );
    const productB = projectBProducts.find(p =>
      p.category.toLowerCase().includes(category.toLowerCase()) ||
      p.productName.toLowerCase().includes(category.toLowerCase())
    );

    if (productA || productB) {
      const features = featuresByCategory[category] || ROUTING_FEATURES;
      comparisons.push({
        categoryName: `${category} Products`,
        projectAProduct: productA?.productName || 'Not selected',
        projectBProduct: productB?.productName || 'Not selected',
        features: features.map(f => ({
          featureName: f,
          projectACovered: productA ? rng() > 0.25 : false,
          projectBCovered: productB ? rng() > 0.25 : false,
        })),
      });
    }
  }

  return { comparisons };
}

// =============================================================================
// Main Generator Functions
// =============================================================================

export function generateVendorQualityReport(
  projectId: string,
  provider: string,
  region: string,
  products: { productName: string; provider: string; category: string }[],
  projectIndex: number = 0
): VendorQualityReport {
  const seed = `${projectId}-${provider}-${region}`;
  const rng = seededRandom(seed);
  const pattern = getVendorPattern(provider);
  const projectSeed = projectId;

  return {
    vendor: provider,
    region,
    featureAvailability: generateFeatureAvailability(rng, products, []),
    dataCoverage: generateDataCoverage(rng),
    geocodingAccuracy: generateGeocodingAccuracy(rng, pattern, projectSeed, projectIndex),
    poiQuality: generatePOIQuality(rng, pattern, projectSeed, projectIndex),
    buildingCoverage: generateBuildingCoverage(rng),
    routingQuality: generateRoutingQuality(rng, pattern, projectSeed, projectIndex),
  };
}

export function generateProjectQualityData(
  projectId: string,
  projectName: string,
  selectedProducts: { productId: string; productName: string; provider: string; category: string }[],
  region: string,
  projectIndex: number = 0
): ProjectQualityData {
  // Determine primary vendor from selected products
  const primaryVendor = selectedProducts.length > 0
    ? selectedProducts[0].provider
    : 'Google';

  return {
    projectId,
    projectName,
    selectedProducts,
    qualityReport: generateVendorQualityReport(
      projectId,
      primaryVendor,
      region,
      selectedProducts,
      projectIndex
    ),
  };
}

export function generateMockComparisonData(
  projectA: { id: string; name: string; products: { productId: string; productName: string; provider: string; category: string }[] },
  projectB: { id: string; name: string; products: { productId: string; productName: string; provider: string; category: string }[] },
  region: string = 'Global'
): QualityComparisonData {
  // Use different project indices to create varied winning patterns
  const projectAData = generateProjectQualityData(
    projectA.id,
    projectA.name,
    projectA.products,
    region,
    0 // Project A index
  );

  const projectBData = generateProjectQualityData(
    projectB.id,
    projectB.name,
    projectB.products,
    region,
    1 // Project B index
  );

  // Generate cross-project feature availability
  const seed = `${projectA.id}-${projectB.id}-${region}`;
  const rng = seededRandom(seed);
  const featureAvailability = generateFeatureAvailability(
    rng,
    projectA.products,
    projectB.products
  );

  return {
    projectA: projectAData,
    projectB: projectBData,
    featureAvailability,
    comparisonDate: new Date().toISOString(),
    region,
  };
}

// =============================================================================
// Demo Data for Development
// =============================================================================

export function getDemoComparisonData(): QualityComparisonData {
  return generateMockComparisonData(
    {
      id: 'demo-project-1',
      name: 'Food Delivery App',
      products: [
        { productId: 'google_directions', productName: 'Google Directions API', provider: 'Google', category: 'Routing' },
        { productId: 'google_geocoding', productName: 'Google Geocoding API', provider: 'Google', category: 'Geocoding' },
        { productId: 'google_maps_sdk', productName: 'Google Maps SDK', provider: 'Google', category: 'Maps' },
      ],
    },
    {
      id: 'demo-project-2',
      name: 'Logistics Platform',
      products: [
        { productId: 'here_routing', productName: 'HERE Routing API', provider: 'HERE', category: 'Routing' },
        { productId: 'here_geocoding', productName: 'HERE Geocoding API', provider: 'HERE', category: 'Geocoding' },
        { productId: 'here_maps', productName: 'HERE Maps API', provider: 'HERE', category: 'Maps' },
      ],
    },
    'Global'
  );
}
