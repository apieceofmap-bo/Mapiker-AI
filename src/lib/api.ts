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
