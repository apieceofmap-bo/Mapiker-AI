"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import {
  Project,
  Product,
  MatchResponse,
  SelectionState,
  EnvironmentSelectionState,
} from "@/lib/types";
import StageIndicator from "@/components/dashboard/StageIndicator";
import TestKeysRequest, {
  TestKeysFormData,
} from "@/components/quality/TestKeysRequest";

export default function TestKeysPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/project/${projectId}/quality/test-keys`);
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

  // Extract selected products from project
  const selectedProducts = useMemo<Product[]>(() => {
    if (!project?.match_result || !project?.selected_products) return [];

    const matchResult = project.match_result as MatchResponse;
    const selections = project.selected_products as
      | SelectionState
      | EnvironmentSelectionState;
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

  const handleSubmit = async (data: TestKeysFormData) => {
    if (!user || !project) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      // Save to test_keys_requests table
      const { error: insertError } = await supabase
        .from("test_keys_requests")
        .insert({
          project_id: projectId,
          user_id: user.id,
          vendors: data.vendors,
          test_period_days: data.testPeriodDays,
          company_name: data.companyName,
          contact_email: data.contactEmail,
          expected_monthly_requests: data.expectedMonthlyRequests || null,
          use_case_details: data.useCaseDetails || null,
          status: "pending",
        });

      if (insertError) throw insertError;

      // Update project status
      await supabase
        .from("projects")
        .update({
          status: "quote_requested",
        })
        .eq("id", projectId);

      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-[rgba(15,123,108,0.15)] rounded-full flex items-center justify-center text-4xl text-[#0f7b6c] mx-auto mb-6">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[#37352f] mb-4">
          Test Keys Request Submitted!
        </h2>
        <p className="text-[#787774] mb-8">
          Thank you for your interest. Our sales team will review your request
          and provide test credentials within 1-2 business days. You&apos;ll receive
          an email with instructions on how to access the test keys.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/project/${projectId}`}
            className="px-6 py-3 bg-[#f7f6f3] hover:bg-[#e9e9e7] text-[#37352f] font-medium rounded-md transition-colors"
          >
            Back to Project
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
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
          <Link href={`/project/${projectId}`} className="hover:text-[#37352f]">
            {project.name}
          </Link>
          <span>/</span>
          <Link
            href={`/project/${projectId}/quality`}
            className="hover:text-[#37352f]"
          >
            Quality Evaluation
          </Link>
          <span>/</span>
          <span className="text-[#37352f]">Test Keys</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352f]">
          Request Test API/SDK Keys
        </h1>
        <p className="text-[#787774] mt-1">
          Get temporary access keys to test the APIs and SDKs yourself
        </p>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
        <StageIndicator currentStage={4} projectId={projectId} />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl">
        {selectedProducts.length === 0 ? (
          <div className="bg-[rgba(223,171,1,0.08)] border border-[rgba(223,171,1,0.2)] rounded-md p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-semibold text-[#b8860b] mb-2">
              No products selected
            </h3>
            <p className="text-[#b8860b] mb-4">
              You need to select products before requesting test keys.
            </p>
            <Link
              href={`/project/${projectId}/products`}
              className="inline-block px-4 py-2 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors"
            >
              Select Products
            </Link>
          </div>
        ) : (
          <TestKeysRequest
            selectedProducts={selectedProducts}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Back Link */}
        <Link
          href={`/project/${projectId}/quality`}
          className="block text-center text-sm text-[#787774] hover:text-[#37352f] mt-6"
        >
          ← Back to options
        </Link>
      </div>
    </div>
  );
}
