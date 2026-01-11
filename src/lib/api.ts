import { ChatMessage, ChatResponse, Requirements, MatchResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[]
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function getInitialMessage(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/initial`);
    if (!response.ok) {
      throw new Error("Failed to get initial message");
    }
    const data = await response.json();
    return data.message;
  } catch {
    return "Hi! I'm here to help you find the right map solution for your project. What kind of map-based service are you looking to build?";
  }
}

export async function matchProducts(
  requirements: Requirements
): Promise<MatchResponse> {
  console.log("=== matchProducts called ===");
  console.log("Requirements type:", typeof requirements);
  console.log("Requirements:", requirements);
  console.log("JSON body:", JSON.stringify(requirements));
  console.log("API URL:", `${API_BASE_URL}/api/products/match`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requirements),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      throw new Error(`Failed to match products: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response data:", data);
    return data;
  } catch (error) {
    console.error("matchProducts error:", error);
    if (error instanceof TypeError) {
      console.error("Network error - is the backend running?");
    }
    throw error;
  }
}

export async function getCategories(): Promise<{ categories: { id: string; name: string; count: number }[] }> {
  const response = await fetch(`${API_BASE_URL}/api/products/categories`);

  if (!response.ok) {
    throw new Error("Failed to get categories");
  }

  return response.json();
}

// Contact Sales API
export interface ContactFormData {
  name: string;
  email: string;
  question: string;
  use_case?: string;
  selected_products?: string[];
}

export async function sendContactEmail(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to send message" }));
    throw new Error(errorData.detail || "Failed to send message");
  }

  return response.json();
}

// Report Email API
export interface ReportProductInfo {
  name: string;
  provider: string;
  description: string;
  document_url?: string;
}

export interface ReportEmailData {
  email: string;
  requirements: Requirements;
  selected_products: ReportProductInfo[];
}

export async function sendReportEmail(data: ReportEmailData): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/contact/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to send report" }));
    throw new Error(errorData.detail || "Failed to send report");
  }

  return response.json();
}

// Pricing API
export interface ProductCost {
  product_id: string;
  product_name: string;
  billing_unit: string;
  monthly_usage: number;
  original_requests: number;
  estimated_cost: number;
  free_tier_applied: boolean;
  contact_sales_required: boolean;
  pricing_note?: string;
  tier_breakdown?: Array<{
    tier_range?: string;
    usage: number;
    price_per_1000?: number;
    cost: number;
    component?: string;
  }>;
  pricing_unavailable: boolean;
}

export interface BulkPricingResponse {
  products: ProductCost[];
  total_cost: number;
  monthly_requests: number;
  has_pricing_unavailable: boolean;
  has_contact_sales: boolean;
}

export interface VendorPricingResponse {
  vendor: string;
  total_cost: number;
  products: ProductCost[];
  has_pricing_unavailable: boolean;
  has_contact_sales: boolean;
  disclaimer: string;
}

export async function calculatePricing(
  productIds: string[],
  monthlyRequests: number
): Promise<BulkPricingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/pricing/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_ids: productIds,
      monthly_requests: monthlyRequests,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to calculate pricing" }));
    throw new Error(errorData.detail || "Failed to calculate pricing");
  }

  return response.json();
}

export async function getProductPricing(
  productId: string,
  monthlyRequests: number = 10000
): Promise<ProductCost> {
  const response = await fetch(
    `${API_BASE_URL}/api/pricing/product/${productId}?monthly_requests=${monthlyRequests}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to get product pricing" }));
    throw new Error(errorData.detail || "Failed to get product pricing");
  }

  return response.json();
}

export async function calculateVendorPricing(
  vendor: string,
  productIds: string[],
  monthlyRequests: number
): Promise<VendorPricingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/pricing/vendor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vendor,
      product_ids: productIds,
      monthly_requests: monthlyRequests,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to calculate vendor pricing" }));
    throw new Error(errorData.detail || "Failed to calculate vendor pricing");
  }

  return response.json();
}

export async function getPricingInfo(): Promise<{
  version: string;
  last_updated: string;
  currency: string;
  total_products: number;
  sources: Record<string, string>;
  notes: string[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/pricing/info`);

  if (!response.ok) {
    throw new Error("Failed to get pricing info");
  }

  return response.json();
}

// Catalog API
export interface CatalogProduct {
  id: string;
  provider: string;
  product_name: string;
  sub_category: string;
  product_group: string;
  description: string;
  key_features: string[];
  suitable_for: {
    use_cases?: string[];
    applications?: string[];
    regions?: string[];
  };
  data_format: string;
  document_url: string;
}

export interface CategoryMeta {
  id: string;
  name: string;
  count: number;
}

export interface ProviderMeta {
  name: string;
  count: number;
}

export interface CatalogResponse {
  products: CatalogProduct[];
  categories: CategoryMeta[];
  providers: ProviderMeta[];
  total: number;
}

export async function getCatalog(params?: {
  provider?: string;
  category?: string;
  search?: string;
}): Promise<CatalogResponse> {
  const searchParams = new URLSearchParams();
  if (params?.provider) searchParams.set("provider", params.provider);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/api/products/catalog${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to get catalog");
  }

  return response.json();
}

export async function getProductDetail(productId: string): Promise<CatalogProduct & { key_features: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/products/catalog/${productId}`);

  if (!response.ok) {
    throw new Error("Failed to get product detail");
  }

  return response.json();
}
