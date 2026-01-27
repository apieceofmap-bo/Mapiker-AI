import { Country, TestPeriod } from './types';
import { QUALITY_FEATURES, QualityFeature, QUALITY_DIMENSIONS, QualityDimension } from './featureRegistry';

// Re-export for backwards compatibility
export { QUALITY_FEATURES, QUALITY_DIMENSIONS } from './featureRegistry';
export type { QualityFeature, QualityDimension } from './featureRegistry';

export const AVAILABLE_COUNTRIES: Country[] = [
  // Asia
  { code: 'KR', name: 'South Korea', region: 'Asia' },
  { code: 'JP', name: 'Japan', region: 'Asia' },
  { code: 'CN', name: 'China', region: 'Asia' },
  { code: 'SG', name: 'Singapore', region: 'Asia' },
  { code: 'TW', name: 'Taiwan', region: 'Asia' },
  { code: 'HK', name: 'Hong Kong', region: 'Asia' },
  { code: 'TH', name: 'Thailand', region: 'Asia' },
  { code: 'VN', name: 'Vietnam', region: 'Asia' },
  { code: 'MY', name: 'Malaysia', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', region: 'Asia' },
  { code: 'PH', name: 'Philippines', region: 'Asia' },
  { code: 'IN', name: 'India', region: 'Asia' },

  // North America
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'MX', name: 'Mexico', region: 'North America' },

  // Europe
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'NL', name: 'Netherlands', region: 'Europe' },
  { code: 'BE', name: 'Belgium', region: 'Europe' },
  { code: 'CH', name: 'Switzerland', region: 'Europe' },
  { code: 'AT', name: 'Austria', region: 'Europe' },
  { code: 'SE', name: 'Sweden', region: 'Europe' },
  { code: 'NO', name: 'Norway', region: 'Europe' },
  { code: 'DK', name: 'Denmark', region: 'Europe' },
  { code: 'FI', name: 'Finland', region: 'Europe' },
  { code: 'PL', name: 'Poland', region: 'Europe' },
  { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
  { code: 'PT', name: 'Portugal', region: 'Europe' },
  { code: 'IE', name: 'Ireland', region: 'Europe' },

  // Oceania
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania' },

  // Middle East
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East' },
  { code: 'IL', name: 'Israel', region: 'Middle East' },

  // South America
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'AR', name: 'Argentina', region: 'South America' },
  { code: 'CL', name: 'Chile', region: 'South America' },
  { code: 'CO', name: 'Colombia', region: 'South America' },

  // Africa
  { code: 'ZA', name: 'South Africa', region: 'Africa' },
  { code: 'EG', name: 'Egypt', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Africa' },
  { code: 'KE', name: 'Kenya', region: 'Africa' },
];

// QUALITY_FEATURES is now imported from featureRegistry.ts
// This ensures synchronization with feature_registry.json

export const TEST_PERIODS: TestPeriod[] = [
  { days: 7, label: '7 days', description: 'Quick evaluation' },
  { days: 14, label: '14 days', description: 'Recommended', recommended: true },
  { days: 30, label: '30 days', description: 'Comprehensive testing' },
];

// Pricing constants
export const QUALITY_REPORT_PRICING = {
  basePerCountry: 20, // $20 per country (includes 1 free feature)
  additionalFeaturePerCountry: 10, // $10 per additional feature per country
  currency: 'USD',
};

// Calculate quality report price
export function calculateQualityReportPrice(
  countryCount: number,
  featureCount: number
): number {
  if (countryCount === 0) return 0;

  const basePrice = countryCount * QUALITY_REPORT_PRICING.basePerCountry;
  const additionalFeatures = Math.max(0, featureCount - 1); // First feature is free
  const additionalFeaturesPrice =
    additionalFeatures * countryCount * QUALITY_REPORT_PRICING.additionalFeaturePerCountry;

  return basePrice + additionalFeaturesPrice;
}

// Group countries by region
export function getCountriesByRegion(): Record<string, Country[]> {
  return AVAILABLE_COUNTRIES.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);
}
