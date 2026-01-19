"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project, Product, Category, MatchResponse, SelectionState, EnvironmentSelectionState } from "@/lib/types";
import StageIndicator from "@/components/dashboard/StageIndicator";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import VendorComparison from "@/components/pricing/VendorComparison";
import ConfidentialBanner from "@/components/common/ConfidentialBanner";
import { logAccess } from "@/lib/accessLog";

export default function PricingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calculator" | "comparison">("calculator");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/project/${projectId}/pricing`);
      return;
    }

    const fetchProject = async () => {
      const supabase = createClient();
      if (!supabase) {
        setError("Database not configured");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found");

        setProject(data as Project);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user, authLoading, router]);

  // Log page view when project is loaded
  useEffect(() => {
    if (project && user) {
      logAccess("pricing", projectId, "view");
    }
  }, [project, user, projectId]);

  // Extract selected products from project
  const selectedProducts = useMemo<Product[]>(() => {
    if (!project?.match_result || !project?.selected_products) return [];

    const matchResult = project.match_result as MatchResponse;
    const selections = project.selected_products as SelectionState | EnvironmentSelectionState;
    const products: Product[] = [];
    const addedIds = new Set<string>();

    // Helper to process product IDs (handles both string and string[] values)
    const processProductIds = (value: string | string[] | null) => {
      if (!value) return;
      const ids = Array.isArray(value) ? value : [value];
      ids.forEach((productId) => {
        if (!addedIds.has(productId)) {
          const product = matchResult.categories
            .flatMap((c) => c.products)
            .find((p) => p.id === productId);
          if (product) {
            products.push(product);
            addedIds.add(productId);
          }
        }
      });
    };

    // Handle multi-environment selections
    if (project.is_multi_environment) {
      const envSelections = selections as EnvironmentSelectionState;
      ["mobile", "backend"].forEach((env) => {
        const envSel = envSelections[env as keyof EnvironmentSelectionState];
        if (envSel) {
          Object.values(envSel).forEach(processProductIds);
        }
      });
    } else {
      // Single environment
      const singleSelections = selections as SelectionState;
      Object.values(singleSelections).forEach(processProductIds);
    }

    return products;
  }, [project]);

  // Get categories from match result
  const categories = useMemo<Category[]>(() => {
    if (!project?.match_result) return [];
    return (project.match_result as MatchResponse).categories;
  }, [project]);

  const handleContinueToQuality = async () => {
    if (!user || !project) return;

    const supabase = createClient();
    if (!supabase) return;

    try {
      await supabase
        .from("projects")
        .update({
          pricing_calculated: true,
          current_stage: 4,
        })
        .eq("id", projectId);

      router.push(`/project/${projectId}/quality`);
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-[#37352f] mb-2">{error}</h2>
        <Link
          href="/dashboard"
          className="text-[#37352f] hover:underline font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-[#37352f] mb-2">
          Project not found
        </h2>
        <Link
          href="/dashboard"
          className="text-[#37352f] hover:underline font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-[#787774] mb-2">
          <Link href="/dashboard" className="hover:text-[#37352f]">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-[#37352f]">{project.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352f]">{project.name}</h1>
        <p className="text-[#787774] mt-1">
          {project.use_case_description || project.use_case}
        </p>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
        <StageIndicator currentStage={3} projectId={projectId} />
      </div>

      {/* Confidential Banner */}
      <ConfidentialBanner />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#e9e9e7]">
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "calculator"
              ? "border-[#37352f] text-[#37352f]"
              : "border-transparent text-[#787774] hover:text-[#37352f]"
          }`}
        >
          Pricing Calculator
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "comparison"
              ? "border-[#37352f] text-[#37352f]"
              : "border-transparent text-[#787774] hover:text-[#37352f]"
          }`}
        >
          Vendor Comparison
        </button>
      </div>

      {/* Content */}
      {activeTab === "calculator" ? (
        <PricingCalculator
          selectedProducts={selectedProducts}
          onContinue={handleContinueToQuality}
        />
      ) : (
        <div className="space-y-6">
          <VendorComparison categories={categories} monthlyRequests={100000} />
          <div className="flex justify-end">
            <button
              onClick={handleContinueToQuality}
              className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors flex items-center gap-2"
            >
              Continue to Quality Evaluation
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Products Summary */}
      <div className="bg-[#f7f6f3] rounded-lg border border-[#e9e9e7] p-6">
        <h3 className="font-semibold text-[#37352f] mb-4">
          Selected Products ({selectedProducts.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <span
              key={product.id}
              className="px-3 py-1.5 bg-white border border-[#e9e9e7] rounded-full text-sm text-[#37352f]"
            >
              {product.provider} - {product.product_name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
