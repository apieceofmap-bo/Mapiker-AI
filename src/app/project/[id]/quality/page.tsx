"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project } from "@/lib/types";
import StageIndicator from "@/components/dashboard/StageIndicator";

export default function QualityEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/project/${projectId}/quality`);
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
          <span className="text-gray-900">Quality Evaluation</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Quality Evaluation</h1>
        <p className="text-gray-500 mt-1">
          Choose how you want to evaluate the selected map products
        </p>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StageIndicator currentStage={4} projectId={projectId} />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option A: Quality Report */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-4">
              📄
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Purchase Quality Report
            </h3>
            <p className="text-gray-600 mb-4">
              Get our detailed analysis comparing map vendors across your target
              countries. Includes accuracy benchmarks, coverage comparisons, and
              expert recommendations.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                Professional vendor analysis
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                Accuracy benchmarks by region
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                Coverage comparison maps
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                Expert recommendations
              </li>
            </ul>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Starting at</span>
              <span className="text-2xl font-bold text-purple-600">
                $20<span className="text-sm font-normal">/country</span>
              </span>
            </div>

            <Link
              href={`/project/${projectId}/quality/report`}
              className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Configure Report →
            </Link>
          </div>
        </div>

        {/* Option B: Test Keys */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-4">
              🔑
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Request Test API/SDK Keys
            </h3>
            <p className="text-gray-600 mb-4">
              Get temporary access keys to test the APIs and SDKs yourself.
              Perfect for hands-on evaluation and integration testing before
              making a decision.
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                Hands-on testing
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                7/14/30 day trial periods
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                All selected vendors
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                Integration support
              </li>
            </ul>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Price</span>
              <div>
                <span className="text-2xl font-bold text-green-600">Free</span>
                <span className="text-sm text-gray-500 ml-2">
                  (Sales approval required)
                </span>
              </div>
            </div>

            <Link
              href={`/project/${projectId}/quality/test-keys`}
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Request Keys →
            </Link>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Not sure which option to choose?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-purple-700 mb-2">
              Choose Quality Report if:
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li>• You need objective, third-party analysis</li>
              <li>• You want detailed coverage maps and benchmarks</li>
              <li>• You need documentation for stakeholders</li>
              <li>• You&apos;re evaluating multiple regions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">
              Choose Test Keys if:
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li>• You prefer hands-on evaluation</li>
              <li>• You have specific integration requirements</li>
              <li>• You want to test with your own data</li>
              <li>• Your development team needs to verify compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
