/**
 * Environment Detection Utility
 * Determines whether a product is for Mobile (SDK) or Backend (API)
 */

import { EnvironmentType, Product, Category } from './types';

// Application IDs that trigger multi-environment mode
// Extended to handle various chatbot extraction patterns
const MOBILE_APPLICATIONS = [
  'mobile-app',
  'driver-app',
  'driver-mobile-app',  // Chatbot may extract this variant
  'consumer-app',
  'ios-app',
  'android-app'
];
const BACKEND_APPLICATIONS = [
  'backend-operations',
  'server-side',
  'backend-api'
];

/**
 * Detect which environment a product belongs to based on data_format and name
 */
export function detectProductEnvironment(
  dataFormat: string,
  productName: string
): EnvironmentType | 'both' {
  const formatLower = dataFormat.toLowerCase();
  const nameLower = productName.toLowerCase();

  const hasSDK = formatLower.includes('sdk') || nameLower.includes('sdk');
  const hasAPI = formatLower.includes('api') || nameLower.includes('api');

  if (hasSDK && hasAPI) return 'both';
  if (hasSDK) return 'mobile';
  return 'backend';
}

/**
 * Check if the application selection requires multi-environment mode
 * Handles both array and comma-separated string formats from chatbot
 */
export function isMultiEnvironmentRequest(application: string | string[]): boolean {
  // Convert comma-separated string to array if needed
  const appArray = Array.isArray(application)
    ? application
    : application.split(',').map(a => a.trim()).filter(a => a.length > 0);

  // Need at least 2 applications to be multi-environment
  if (appArray.length < 2) return false;

  const hasMobile = appArray.some(a => MOBILE_APPLICATIONS.includes(a));
  const hasBackend = appArray.some(a => BACKEND_APPLICATIONS.includes(a));

  return hasMobile && hasBackend;
}

/**
 * Get environment priority score for sorting (Mobile only)
 * Mobile: SDK products first (lower score = higher priority)
 */
function getEnvironmentPriority(product: Product): number {
  const productEnv = detectProductEnvironment(product.data_format, product.product_name);

  // Mobile: SDK first (0), both (1), API last (2)
  if (productEnv === 'mobile') return 0;
  if (productEnv === 'both') return 1;
  return 2;
}

/**
 * Filter and sort categories for a specific environment
 * - Mobile: ALL products included, SDK sorted first
 * - Backend: ONLY API products (SDK filtered out)
 */
export function filterCategoriesByEnvironment(
  categories: Category[],
  environment: EnvironmentType
): Category[] {
  return categories
    .map(cat => {
      if (environment === 'mobile') {
        // Mobile: Include all products, sort SDK first
        return {
          ...cat,
          products: [...cat.products].sort((a, b) => {
            const priorityDiff = getEnvironmentPriority(a) - getEnvironmentPriority(b);
            if (priorityDiff !== 0) return priorityDiff;
            return b.match_score - a.match_score;
          })
        };
      } else {
        // Backend: Only include API products (filter out SDK-only)
        return {
          ...cat,
          products: cat.products.filter(p => {
            const productEnv = detectProductEnvironment(p.data_format, p.product_name);
            return productEnv === 'backend' || productEnv === 'both';
          })
        };
      }
    })
    .filter(cat => cat.products.length > 0);
}

/**
 * Environment section metadata
 */
export const ENVIRONMENT_SECTIONS: Record<EnvironmentType, {
  id: EnvironmentType;
  label: string;
  icon: string;
  description: string;
}> = {
  mobile: {
    id: 'mobile',
    label: 'Mobile Products',
    icon: '📱',
    description: 'Products for iOS/Android apps (SDKs recommended)'
  },
  backend: {
    id: 'backend',
    label: 'Backend Products',
    icon: '🖥️',
    description: 'Products for server-side operations (APIs recommended)'
  },
  web: {
    id: 'web',
    label: 'Web Products',
    icon: '🌐',
    description: 'Products for web frontend applications'
  },
  other: {
    id: 'other',
    label: 'Other Products',
    icon: '📦',
    description: 'General purpose products'
  }
};
