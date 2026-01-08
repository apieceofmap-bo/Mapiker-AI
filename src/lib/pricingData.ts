/**
 * Pricing data for map product vendors
 * Based on public pricing pages (as of 2024)
 */

export interface PricingTier {
  upTo: number;
  pricePerThousand: number;
}

export interface ProductPricingInfo {
  productId: string;
  productName: string;
  vendor: string;
  pricingModel: 'per-request' | 'per-session' | 'per-asset' | 'flat-rate';
  tiers: PricingTier[];
  freeMonthlyQuota?: number;
  pricingUrl: string;
  notes?: string;
}

// Google Maps Platform Pricing
// https://mapsplatform.google.com/pricing/
const GOOGLE_PRICING: ProductPricingInfo[] = [
  {
    productId: 'google_routes_api',
    productName: 'Routes API',
    vendor: 'Google',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: 500000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    pricingUrl: 'https://mapsplatform.google.com/pricing/',
  },
  {
    productId: 'google_geocoding_api',
    productName: 'Geocoding API',
    vendor: 'Google',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: 500000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    pricingUrl: 'https://mapsplatform.google.com/pricing/',
  },
  {
    productId: 'google_places_api',
    productName: 'Places API',
    vendor: 'Google',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 17.00 },
      { upTo: 500000, pricePerThousand: 13.60 },
      { upTo: Infinity, pricePerThousand: 10.20 },
    ],
    pricingUrl: 'https://mapsplatform.google.com/pricing/',
  },
  {
    productId: 'google_maps_sdk_android',
    productName: 'Maps SDK for Android',
    vendor: 'Google',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 28000, pricePerThousand: 0 },
      { upTo: 100000, pricePerThousand: 7.00 },
      { upTo: Infinity, pricePerThousand: 5.60 },
    ],
    freeMonthlyQuota: 28000,
    pricingUrl: 'https://mapsplatform.google.com/pricing/',
  },
  {
    productId: 'google_maps_sdk_ios',
    productName: 'Maps SDK for iOS',
    vendor: 'Google',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 28000, pricePerThousand: 0 },
      { upTo: 100000, pricePerThousand: 7.00 },
      { upTo: Infinity, pricePerThousand: 5.60 },
    ],
    freeMonthlyQuota: 28000,
    pricingUrl: 'https://mapsplatform.google.com/pricing/',
  },
  {
    productId: 'google_distance_matrix_api',
    productName: 'Distance Matrix API',
    vendor: 'Google',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: 500000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    pricingUrl: 'https://mapsplatform.google.com/pricing/',
  },
];

// HERE Pricing
// https://www.here.com/platform/pricing
const HERE_PRICING: ProductPricingInfo[] = [
  {
    productId: 'here_routing_api',
    productName: 'Routing API',
    vendor: 'HERE',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 250000, pricePerThousand: 0 },
      { upTo: 1000000, pricePerThousand: 4.50 },
      { upTo: Infinity, pricePerThousand: 3.50 },
    ],
    freeMonthlyQuota: 250000,
    pricingUrl: 'https://www.here.com/platform/pricing',
    notes: 'Freemium tier available',
  },
  {
    productId: 'here_geocoding_api',
    productName: 'Geocoding & Search API',
    vendor: 'HERE',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 250000, pricePerThousand: 0 },
      { upTo: 1000000, pricePerThousand: 4.50 },
      { upTo: Infinity, pricePerThousand: 3.50 },
    ],
    freeMonthlyQuota: 250000,
    pricingUrl: 'https://www.here.com/platform/pricing',
  },
  {
    productId: 'here_maps_api',
    productName: 'Maps API for JavaScript',
    vendor: 'HERE',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 250000, pricePerThousand: 0 },
      { upTo: 1000000, pricePerThousand: 3.00 },
      { upTo: Infinity, pricePerThousand: 2.00 },
    ],
    freeMonthlyQuota: 250000,
    pricingUrl: 'https://www.here.com/platform/pricing',
  },
  {
    productId: 'here_sdk_navigate',
    productName: 'HERE SDK Navigate Edition',
    vendor: 'HERE',
    pricingModel: 'per-asset',
    tiers: [
      { upTo: Infinity, pricePerThousand: 0 },
    ],
    pricingUrl: 'https://www.here.com/platform/pricing',
    notes: 'Contact sales for pricing',
  },
  {
    productId: 'here_traffic_api',
    productName: 'Traffic API',
    vendor: 'HERE',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 250000, pricePerThousand: 0 },
      { upTo: 1000000, pricePerThousand: 5.00 },
      { upTo: Infinity, pricePerThousand: 4.00 },
    ],
    freeMonthlyQuota: 250000,
    pricingUrl: 'https://www.here.com/platform/pricing',
  },
];

// Mapbox Pricing
// https://www.mapbox.com/pricing
const MAPBOX_PRICING: ProductPricingInfo[] = [
  {
    productId: 'mapbox_directions_api',
    productName: 'Directions API',
    vendor: 'Mapbox',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 0 },
      { upTo: 500000, pricePerThousand: 5.00 },
      { upTo: 1000000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    freeMonthlyQuota: 100000,
    pricingUrl: 'https://www.mapbox.com/pricing',
  },
  {
    productId: 'mapbox_geocoding_api',
    productName: 'Geocoding API',
    vendor: 'Mapbox',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 0 },
      { upTo: 500000, pricePerThousand: 5.00 },
      { upTo: 1000000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    freeMonthlyQuota: 100000,
    pricingUrl: 'https://www.mapbox.com/pricing',
  },
  {
    productId: 'mapbox_maps_sdk',
    productName: 'Maps SDK',
    vendor: 'Mapbox',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 50000, pricePerThousand: 0 },
      { upTo: 100000, pricePerThousand: 4.00 },
      { upTo: 500000, pricePerThousand: 3.20 },
      { upTo: Infinity, pricePerThousand: 2.40 },
    ],
    freeMonthlyQuota: 50000,
    pricingUrl: 'https://www.mapbox.com/pricing',
    notes: 'Mobile Active Users (MAU)',
  },
  {
    productId: 'mapbox_navigation_sdk',
    productName: 'Navigation SDK',
    vendor: 'Mapbox',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 1000, pricePerThousand: 0 },
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: 500000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    freeMonthlyQuota: 1000,
    pricingUrl: 'https://www.mapbox.com/pricing',
    notes: 'Navigation Trip pricing',
  },
  {
    productId: 'mapbox_search_box_api',
    productName: 'Search Box API',
    vendor: 'Mapbox',
    pricingModel: 'per-session',
    tiers: [
      { upTo: 100000, pricePerThousand: 0 },
      { upTo: 500000, pricePerThousand: 4.00 },
      { upTo: Infinity, pricePerThousand: 3.00 },
    ],
    freeMonthlyQuota: 100000,
    pricingUrl: 'https://www.mapbox.com/pricing',
    notes: 'Session-based pricing',
  },
];

// TomTom Pricing (Contact sales for most products)
const TOMTOM_PRICING: ProductPricingInfo[] = [
  {
    productId: 'tomtom_routing_api',
    productName: 'Routing API',
    vendor: 'TomTom',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 2500, pricePerThousand: 0 },
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: Infinity, pricePerThousand: 4.00 },
    ],
    freeMonthlyQuota: 2500,
    pricingUrl: 'https://developer.tomtom.com/pricing',
  },
  {
    productId: 'tomtom_search_api',
    productName: 'Search API',
    vendor: 'TomTom',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 2500, pricePerThousand: 0 },
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: Infinity, pricePerThousand: 4.00 },
    ],
    freeMonthlyQuota: 2500,
    pricingUrl: 'https://developer.tomtom.com/pricing',
  },
  {
    productId: 'tomtom_maps_sdk',
    productName: 'Maps SDK',
    vendor: 'TomTom',
    pricingModel: 'per-request',
    tiers: [
      { upTo: 2500, pricePerThousand: 0 },
      { upTo: Infinity, pricePerThousand: 4.50 },
    ],
    freeMonthlyQuota: 2500,
    pricingUrl: 'https://developer.tomtom.com/pricing',
  },
];

// All pricing data combined
export const ALL_PRICING_DATA: ProductPricingInfo[] = [
  ...GOOGLE_PRICING,
  ...HERE_PRICING,
  ...MAPBOX_PRICING,
  ...TOMTOM_PRICING,
];

/**
 * Calculate monthly cost for a product based on request volume
 */
export function calculateProductCost(
  pricing: ProductPricingInfo,
  monthlyRequests: number
): number {
  let totalCost = 0;
  let remainingRequests = monthlyRequests;

  for (const tier of pricing.tiers) {
    const prevTierEnd = pricing.tiers.indexOf(tier) === 0
      ? 0
      : pricing.tiers[pricing.tiers.indexOf(tier) - 1].upTo;

    const tierRequests = Math.min(
      remainingRequests,
      tier.upTo - prevTierEnd
    );

    if (tierRequests > 0) {
      totalCost += (tierRequests / 1000) * tier.pricePerThousand;
      remainingRequests -= tierRequests;
    }

    if (remainingRequests <= 0) break;
  }

  return Math.round(totalCost * 100) / 100;
}

/**
 * Get pricing info for a specific product
 */
export function getProductPricing(productId: string): ProductPricingInfo | undefined {
  // Try exact match first
  let pricing = ALL_PRICING_DATA.find(p => p.productId === productId);

  if (!pricing) {
    // Try partial match (product ID might have different format)
    const normalizedId = productId.toLowerCase().replace(/-/g, '_');
    pricing = ALL_PRICING_DATA.find(p =>
      p.productId.toLowerCase().includes(normalizedId) ||
      normalizedId.includes(p.productId.toLowerCase().replace('_api', '').replace('_sdk', ''))
    );
  }

  return pricing;
}

/**
 * Estimate pricing for a product based on its name and vendor
 */
export function estimateProductPricing(
  productName: string,
  vendor: string
): ProductPricingInfo {
  const nameLower = productName.toLowerCase();
  const vendorLower = vendor.toLowerCase();

  // Try to find similar product
  const similarProduct = ALL_PRICING_DATA.find(p => {
    const pNameLower = p.productName.toLowerCase();
    const pVendorLower = p.vendor.toLowerCase();

    // Same vendor and similar name
    if (pVendorLower === vendorLower) {
      if (nameLower.includes('route') || nameLower.includes('direction')) {
        return pNameLower.includes('route') || pNameLower.includes('direction');
      }
      if (nameLower.includes('geocod') || nameLower.includes('search')) {
        return pNameLower.includes('geocod') || pNameLower.includes('search');
      }
      if (nameLower.includes('map') && nameLower.includes('sdk')) {
        return pNameLower.includes('map') && pNameLower.includes('sdk');
      }
      if (nameLower.includes('navigat')) {
        return pNameLower.includes('navigat');
      }
    }
    return false;
  });

  if (similarProduct) {
    return {
      ...similarProduct,
      productId: productName.toLowerCase().replace(/\s+/g, '_'),
      productName: productName,
    };
  }

  // Default pricing if no match found
  return {
    productId: productName.toLowerCase().replace(/\s+/g, '_'),
    productName: productName,
    vendor: vendor,
    pricingModel: 'per-request',
    tiers: [
      { upTo: 100000, pricePerThousand: 5.00 },
      { upTo: Infinity, pricePerThousand: 4.00 },
    ],
    pricingUrl: `https://www.${vendor.toLowerCase()}.com/pricing`,
    notes: 'Estimated pricing - contact vendor for exact rates',
  };
}

/**
 * Vendor colors for UI
 */
export const VENDOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Google: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  HERE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Mapbox: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  TomTom: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export function getVendorColor(vendor: string) {
  return VENDOR_COLORS[vendor] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}
