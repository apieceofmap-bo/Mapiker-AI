// Chat types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  extracted_requirements: Requirements | null;
  is_complete: boolean;
  trigger_sales_form?: boolean;
}

export interface SalesLeadRequest {
  name: string;
  email: string;
  company: string;
  phone?: string;
  request_details: string;
  conversation_history?: ChatMessage[];
  use_case?: string;
  region?: string;
  required_features?: string[];
}

// Environment types for Mobile + Backend separation
export type EnvironmentType = 'mobile' | 'backend';

export interface EnvironmentSelectionState {
  mobile: SelectionState;
  backend: SelectionState;
}

// Requirements types
export interface Requirements {
  use_case: string;
  use_case_description?: string;
  required_features: string[];
  application: string | string[];  // Supports array for multi-environment
  region: string;
  vehicle_types?: string[];  // e.g., ["truck"], ["bicycle", "scooter"]
  routing_types?: string[];  // e.g., ["multi_waypoint", "matrix"]
  routing_type?: string;     // Deprecated: kept for backward compatibility
  additional_notes?: string;  // User's additional comments/preferences
}

// Feature detail with name, description, and use_case
export interface FeatureDetail {
  name: string;
  description: string;
  use_case: string;
}

// Similar product info (for comparison)
export interface SimilarProduct {
  id: string;
  product_name: string;
  description: string;
  features: FeatureDetail[];
  match_score: number;
}

// Product types
export interface Product {
  id: string;
  provider: string;
  product_name: string;
  description: string;
  features: FeatureDetail[];
  matched_features: string[];
  match_score: number;
  document_url: string;
  data_format: string;
  similar_products?: SimilarProduct[];
}

export interface Category {
  id: string;
  name: string;
  required: boolean;
  description: string;
  products: Product[];
}

export interface FeatureCoverage {
  total_required: number;
  total_covered: number;
  coverage_percent: number;
  covered_features: string[];
  uncovered_features: string[];
  feature_products: Record<string, string[]>;
}

export interface MatchResponse {
  categories: Category[];
  total_matched: number;
  feature_coverage: FeatureCoverage;
  required_features: string[];
}

// Selection state - supports single or multiple product selection per category
export interface SelectionState {
  [categoryId: string]: string | string[] | null; // category_id -> product_id or array of product_ids
}

// ========================================
// User & Auth Types
// ========================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// Project Types
// ========================================

export type ProjectStage = 1 | 2 | 3 | 4;
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'quote_requested';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;

  // Stage 1 & 2 Data
  use_case: string;
  use_case_description?: string;
  required_features: string[];
  application: string | string[];
  region: string;
  vehicle_types?: string[];  // e.g., ["truck"], ["bicycle", "scooter"]
  routing_types?: string[];  // e.g., ["multi_waypoint", "matrix"]
  additional_notes?: string;  // User's additional comments/preferences
  selected_products: SelectionState | EnvironmentSelectionState;
  match_result?: MatchResponse;
  is_multi_environment: boolean;

  // Stage 3 Data (Pricing)
  pricing_calculated: boolean;
  pricing_data?: PricingData;

  // Stage 4 Data (Quality Evaluation)
  quality_report_requested: boolean;
  quality_report_countries: string[];
  quality_report_features: string[];
  quality_report_price?: number;
  quality_report_request_date?: string;

  // Status & Meta
  current_stage: ProjectStage;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

// ========================================
// Pricing Types
// ========================================

export interface ProductPricing {
  product_id: string;
  product_name: string;
  pricing_model: string;
  estimated_monthly_cost: number;
  pricing_url: string;
}

export interface VendorPricing {
  vendor: string;
  products: ProductPricing[];
  subtotal: number;
}

export interface PricingData {
  vendors: VendorPricing[];
  total_estimated_monthly: number;
  currency: string;
}

// ========================================
// Quality Evaluation Types
// ========================================

export interface QualityReportRequest {
  countries: string[];
  features: string[];
  total_price: number;
  contact_email: string;
  company_name?: string;
  additional_notes?: string;
}

export interface TestKeysRequest {
  vendors: string[];
  test_period_days: 7 | 14 | 30;
  company_name: string;
  expected_monthly_requests?: number;
  use_case_details?: string;
  contact_email: string;
}

export interface Country {
  code: string;
  name: string;
  region: string;
}

export interface QualityFeature {
  id: string;
  name: string;
  description: string;
}

export interface TestPeriod {
  days: 7 | 14 | 30;
  label: string;
  description: string;
  recommended?: boolean;
}
