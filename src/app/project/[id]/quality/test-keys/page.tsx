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

    // Handle multi-environment selections
    if (project.is_multi_environment) {
      const envSelections = selections as EnvironmentSelectionState;
      ["mobile", "backend"].forEach((env) => {
        const envSel = envSelections[env as keyof EnvironmentSelectionState];
        if (envSel) {
          Object.values(envSel).forEach((productId) => {
            if (productId && !addedIds.has(productId)) {
              const product = matchResult.categories
                .flatMap((c) => c.products)
                .find((p) => p.id === productId);
              if (product) {
                products.push(product);
                addedIds.add(productId);
              }
            }
          });
        }
      });
    } else {
      // Single environment
      const singleSelections = selections as SelectionState;
      Object.values(singleSelections).forEach((productId) => {
        if (productId && !addedIds.has(productId)) {
          const product = matchResult.categories
            .flatMap((c) => c.products)
            .find((p) => p.id === productId);
          if (product) {
            products.push(product);
            addedIds.add(productId);
          }
        }
      });
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-700 font-medium"
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Project not found
        </h2>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-700 font-medium"
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
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Test Keys Request Submitted!
        </h2>
        <p className="text-gray-600 mb-8">
          Thank you for your interest. Our sales team will review your request
          and provide test credentials within 1-2 business days. You&apos;ll receive
          an email with instructions on how to access the test keys.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/project/${projectId}`}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Back to Project
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-gray-700">
            Dashboard
          </Link>
          <span>/</span>
          <Link href={`/project/${projectId}`} className="hover:text-gray-700">
            {project.name}
          </Link>
          <span>/</span>
          <Link
            href={`/project/${projectId}/quality`}
            className="hover:text-gray-700"
          >
            Quality Evaluation
          </Link>
          <span>/</span>
          <span className="text-gray-900">Test Keys</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Request Test API/SDK Keys
        </h1>
        <p className="text-gray-500 mt-1">
          Get temporary access keys to test the APIs and SDKs yourself
        </p>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StageIndicator currentStage={4} projectId={projectId} />
      </div>

      {/* Main Content */}
      <div className="max-w-2xl">
        {selectedProducts.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-semibold text-amber-800 mb-2">
              No products selected
            </h3>
            <p className="text-amber-700 mb-4">
              You need to select products before requesting test keys.
            </p>
            <Link
              href={`/project/${projectId}/products`}
              className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
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
          className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-6"
        >
          ← Back to options
        </Link>
      </div>
    </div>
  );
}
