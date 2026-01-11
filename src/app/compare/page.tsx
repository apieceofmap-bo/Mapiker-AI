"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project } from "@/lib/types";
import PricingComparison from "@/components/compare/PricingComparison";
import FeaturesComparison from "@/components/compare/FeaturesComparison";
import QualityComparison from "@/components/compare/QualityComparison";

type CompareTab = "pricing" | "features" | "quality";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CompareTab>("pricing");
  const supabase = createClient();

  const projectIds = searchParams.get("projects")?.split(",") || [];

  useEffect(() => {
    if (authLoading || !user) return;

    if (projectIds.length < 2) {
      setError("Please select at least 2 projects to compare");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .in("id", projectIds);

        if (error) throw error;

        if (!data || data.length < 2) {
          setError("Could not find the selected projects");
          return;
        }

        // Sort by the order in URL
        const sortedData = projectIds
          .map((id) => data.find((p) => p.id === id))
          .filter(Boolean) as Project[];

        setProjects(sortedData);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [authLoading, user, projectIds.join(",")]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">&#x26A0;&#xFE0F;</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">{error}</h3>
        <Link
          href="/dashboard"
          className="text-[#2eaadc] hover:underline text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const tabs: { key: CompareTab; label: string }[] = [
    { key: "pricing", label: "Pricing" },
    { key: "features", label: "Features" },
    { key: "quality", label: "Quality" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-[#787774] hover:text-[#37352f] mb-2 inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-[#37352f]">
            Compare Projects
          </h1>
          <p className="text-[#787774] text-sm mt-1">
            Comparing {projects.length} projects
          </p>
        </div>
      </div>

      {/* Project Names Row */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-4 mb-6">
        <div className="flex items-center gap-4">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="flex-1 flex items-center gap-2 min-w-0"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#37352f] text-white text-xs font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-medium text-[#37352f] truncate">
                  {project.name}
                </h3>
                <p className="text-xs text-[#787774] truncate">
                  {project.use_case_description || project.use_case}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e9e9e7] mb-6">
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-[#37352f] text-[#37352f]"
                  : "border-transparent text-[#787774] hover:text-[#37352f]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-[#e9e9e7]">
        {activeTab === "pricing" && <PricingComparison projects={projects} />}
        {activeTab === "features" && <FeaturesComparison projects={projects} />}
        {activeTab === "quality" && <QualityComparison projects={projects} />}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#37352f]"></div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
