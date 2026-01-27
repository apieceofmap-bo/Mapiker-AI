"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project, SelectionState, EnvironmentSelectionState, EnvironmentType } from "@/lib/types";
import CombinedProductPreview from "@/components/products/CombinedProductPreview";
import StageIndicator from "@/components/dashboard/StageIndicator";

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<SelectionState | EnvironmentSelectionState>({});
  const [originalSelections, setOriginalSelections] = useState<string>("");
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load project data
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/project/${projectId}/products`);
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

        const projectData = data as Project;
        setProject(projectData);

        // Set initial selections from saved project
        const savedSelections = projectData.selected_products || {};
        setSelections(savedSelections);
        setOriginalSelections(JSON.stringify(savedSelections));
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user, authLoading, router]);

  // Check if selections have changed
  const hasChanges = useMemo(() => {
    return JSON.stringify(selections) !== originalSelections;
  }, [selections, originalSelections]);

  const handleResetSelections = () => {
    if (originalSelections) {
      setSelections(JSON.parse(originalSelections));
    }
  };

  /**
   * Gets the array of selected product IDs for a category from SelectionState.
   */
  const getSelectedProductIds = (state: SelectionState, categoryId: string): string[] => {
    const value = state[categoryId];
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const handleSelectionChange = (categoryId: string, productId: string, isSelected: boolean, environment?: EnvironmentType) => {
    if (project?.is_multi_environment && environment) {
      setSelections((prev) => {
        const envSelections = prev as EnvironmentSelectionState;
        const currentEnvState = envSelections[environment] || {};
        const currentIds = getSelectedProductIds(currentEnvState, categoryId);

        let newIds: string[];
        if (isSelected) {
          newIds = currentIds.includes(productId) ? currentIds : [...currentIds, productId];
        } else {
          newIds = currentIds.filter(id => id !== productId);
        }

        return {
          ...envSelections,
          [environment]: {
            ...currentEnvState,
            [categoryId]: newIds.length > 0 ? newIds : null,
          },
        };
      });
    } else {
      setSelections((prev) => {
        const currentState = prev as SelectionState;
        const currentIds = getSelectedProductIds(currentState, categoryId);

        let newIds: string[];
        if (isSelected) {
          newIds = currentIds.includes(productId) ? currentIds : [...currentIds, productId];
        } else {
          newIds = currentIds.filter(id => id !== productId);
        }

        return {
          ...currentState,
          [categoryId]: newIds.length > 0 ? newIds : null,
        };
      });
    }
  };

  const handleBack = () => {
    router.push(`/project/${projectId}`);
  };

  const handleContinue = () => {
    if (hasChanges) {
      setShowChangeModal(true);
    } else {
      router.push(`/project/${projectId}/pricing`);
    }
  };

  // Update current project with changed selections (resets pricing data)
  const handleUpdateCurrentProject = async () => {
    if (!user || !project) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      // Update current project with new selections, reset pricing stage
      const { error } = await supabase
        .from("projects")
        .update({
          selected_products: selections,
          current_stage: 2,
          // Reset pricing-related data
          pricing_input: null,
          pricing_result: null,
        })
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update original selections to reflect saved state
      setOriginalSelections(JSON.stringify(selections));

      // Navigate to pricing page
      router.push(`/project/${projectId}/pricing`);
    } catch (err) {
      console.error("Failed to update project:", err);
      alert("Failed to update project. Please try again.");
    } finally {
      setIsSaving(false);
      setShowChangeModal(false);
    }
  };

  // Create new project with changed selections
  const handleCreateNewProject = async () => {
    if (!user || !project) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      // Generate new project name
      const baseName = project.name.replace(/\s+\d+$/, ''); // Remove trailing number

      // Find existing projects with similar names
      const { data: existingProjects } = await supabase
        .from("projects")
        .select("name")
        .eq("user_id", user.id)
        .like("name", `${baseName}%`);

      let newName = `${baseName} 2`;
      if (existingProjects && existingProjects.length > 0) {
        const numbers = existingProjects
          .map((p: { name: string }) => {
            const match = p.name.match(/\s+(\d+)$/);
            return match ? parseInt(match[1]) : 1;
          });
        const maxNumber = Math.max(...numbers, 1);
        newName = `${baseName} ${maxNumber + 1}`;
      }

      // Create new project with updated selections
      const { data: newProject, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: newName,
          use_case: project.use_case,
          use_case_description: project.use_case_description,
          required_features: project.required_features,
          application: project.application,
          region: project.region,
          selected_products: selections,
          match_result: project.match_result,
          is_multi_environment: project.is_multi_environment,
          current_stage: 2,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to new project's pricing page
      router.push(`/project/${newProject.id}/pricing`);
    } catch (err) {
      console.error("Failed to create new project:", err);
      alert("Failed to create new project. Please try again.");
    } finally {
      setIsSaving(false);
      setShowChangeModal(false);
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

  if (!project || !project.match_result) {
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

  const requirements = {
    use_case: project.use_case,
    use_case_description: project.use_case_description,
    required_features: project.required_features,
    application: project.application,
    region: project.region,
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#787774]">
            <Link href="/dashboard" className="hover:text-[#37352f]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#37352f]">{project.name}</span>
          </div>
        </div>

        {/* Stage Indicator */}
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-6 mb-6">
          <StageIndicator currentStage={2} projectId={projectId} />
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#37352f]">Product Selection</h1>
            <p className="text-[#787774] mt-1">
              Review and modify your selected products
            </p>
          </div>
          <button
            onClick={handleResetSelections}
            className="px-4 py-2 text-sm font-medium text-[#787774] bg-[#f7f6f3] hover:bg-[#e9e9e7] rounded-md transition-colors flex items-center gap-1.5"
          >
            <span>↻</span>
            Reset
          </button>
        </div>

        {/* Product Selection */}
        <CombinedProductPreview
          matchResult={project.match_result}
          selections={selections}
          onSelectionChange={handleSelectionChange}
          onBack={handleBack}
          onResetSelections={handleResetSelections}
          requirements={requirements}
          isMultiEnvironment={project.is_multi_environment}
          hideHeader={true}
        />

        {/* Continue Section */}
        <div className="mt-8 bg-white rounded-lg border border-[#e9e9e7] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#37352f]">
                {hasChanges ? "Product selection changed" : "Continue to pricing"}
              </h3>
              <p className="text-[#787774] text-sm mt-1">
                {hasChanges
                  ? "A new project will be created with your updated selections"
                  : "Proceed to view pricing comparison"
                }
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors flex items-center gap-2"
            >
              {hasChanges ? "Save Changes & Continue →" : "Continue to Pricing →"}
            </button>
          </div>
        </div>

      {/* Change Confirmation Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[rgba(223,171,1,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-[#37352f] mb-2">
                Product Selection Changed
              </h3>
              <p className="text-[#787774]">
                How would you like to save your changes?
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {/* Option 1: Update Current Project */}
              <button
                onClick={handleUpdateCurrentProject}
                disabled={isSaving}
                className="w-full p-4 border-2 border-[#e9e9e7] rounded-lg text-left hover:border-[#37352f] hover:bg-[#f7f6f3] transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[rgba(55,53,47,0.08)] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔄</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#37352f]">Update Current Project</p>
                    <p className="text-sm text-[#787774] mt-1">
                      Replace product selections and reset pricing data.
                      Previous pricing records will be cleared.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Create New Project */}
              <button
                onClick={handleCreateNewProject}
                disabled={isSaving}
                className="w-full p-4 border-2 border-[#e9e9e7] rounded-lg text-left hover:border-[#37352f] hover:bg-[#f7f6f3] transition-all disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[rgba(15,123,108,0.15)] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#37352f]">Create New Project</p>
                    <p className="text-sm text-[#787774] mt-1">
                      Keep the original project intact and create a copy with your new selections.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {isSaving && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-4 h-4 border-2 border-[#37352f] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#787774]">Saving...</span>
              </div>
            )}

            <button
              onClick={() => setShowChangeModal(false)}
              disabled={isSaving}
              className="w-full px-4 py-2 text-[#787774] hover:text-[#37352f] font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
