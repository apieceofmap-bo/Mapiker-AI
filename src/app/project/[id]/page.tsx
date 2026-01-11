"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project, MatchResponse, SelectionState } from "@/lib/types";
import { matchProducts } from "@/lib/api";
import { isMultiEnvironmentRequest } from "@/lib/environmentDetector";
import StageIndicator from "@/components/dashboard/StageIndicator";

// Available options for editing
const USE_CASE_OPTIONS = [
  "Food Delivery",
  "Ride-hailing",
  "Logistics",
  "Fleet Management",
  "Store Locator",
  "Navigation",
  "Location Analytics",
  "Asset Tracking",
  "Other",
];

const APPLICATION_OPTIONS = [
  { id: "mobile-app", label: "Mobile App (iOS/Android)" },
  { id: "driver-app", label: "Driver App" },
  { id: "backend-operations", label: "Backend Operations" },
  { id: "web-app", label: "Web Application" },
];

const REGION_OPTIONS = [
  "Global",
  "South Korea",
  "Japan",
  "United States",
  "Europe",
  "Southeast Asia",
  "China",
  "Multiple Regions",
];

const FEATURE_OPTIONS = [
  "Maps Display",
  "Geocoding",
  "Reverse Geocoding",
  "Routing",
  "Turn-by-turn Navigation",
  "Traffic Data",
  "Places/POI Search",
  "Address Validation",
  "ETA Calculation",
  "Distance Matrix",
  "Isochrone",
  "Fleet Tracking",
  "Geofencing",
];

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editUseCase, setEditUseCase] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editApplication, setEditApplication] = useState<string[]>([]);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);

  // Re-matching states
  const [showRematchButton, setShowRematchButton] = useState(false);
  const [isRematching, setIsRematching] = useState(false);
  const [newMatchResult, setNewMatchResult] = useState<MatchResponse | null>(null);
  const [showRematchModal, setShowRematchModal] = useState(false);
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/project/${projectId}`);
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

  const startEditing = () => {
    if (!project) return;
    setEditUseCase(project.use_case);
    setEditRegion(project.region);
    setEditApplication(
      Array.isArray(project.application)
        ? project.application
        : [project.application]
    );
    setEditFeatures([...project.required_features]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const toggleApplication = (appId: string) => {
    if (editApplication.includes(appId)) {
      setEditApplication(editApplication.filter((a) => a !== appId));
    } else {
      setEditApplication([...editApplication, appId]);
    }
  };

  const toggleFeature = (feature: string) => {
    if (editFeatures.includes(feature)) {
      setEditFeatures(editFeatures.filter((f) => f !== feature));
    } else {
      setEditFeatures([...editFeatures, feature]);
    }
  };

  const saveRequirements = async () => {
    if (!user || !project) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      // Base update data (without additional_notes to ensure compatibility)
      // Always send application as array for database compatibility
      const updateData = {
        use_case: editUseCase,
        region: editRegion,
        application: editApplication,
        required_features: editFeatures,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setProject({
        ...project,
        use_case: editUseCase,
        region: editRegion,
        application: editApplication,
        required_features: editFeatures,
      });

      setIsEditing(false);
      setShowRematchButton(true);  // Show re-match button after saving
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Error saving requirements:", errorMessage);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Re-matching handlers
  const handleRematch = async () => {
    if (!project) return;

    setIsRematching(true);
    try {
      const requirements = {
        use_case: project.use_case,
        required_features: project.required_features,
        application: project.application,
        region: project.region,
        additional_notes: project.additional_notes,
      };

      const result = await matchProducts(requirements);
      setNewMatchResult(result);
      setShowRematchModal(true);
    } catch (err) {
      console.error("Error re-matching products:", err);
      alert("Failed to get new recommendations. Please try again.");
    } finally {
      setIsRematching(false);
    }
  };

  const handleKeepCurrent = () => {
    setShowRematchModal(false);
    setNewMatchResult(null);
    setShowRematchButton(false);
  };

  const handleUseNew = () => {
    setShowRematchModal(false);
    setShowConfirmUpdateModal(true);
  };

  const handleUpdateCurrentProject = async () => {
    if (!user || !project || !newMatchResult) return;

    setIsUpdatingProject(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      const multiEnvMode = isMultiEnvironmentRequest(project.application);

      // Initialize selections based on new categories
      let newSelections: SelectionState | Record<string, SelectionState> = {};
      if (multiEnvMode) {
        newSelections = {
          mobile: {},
          backend: {},
        };
        newMatchResult.categories.forEach((cat) => {
          (newSelections as Record<string, SelectionState>).mobile[cat.id] = null;
          (newSelections as Record<string, SelectionState>).backend[cat.id] = null;
        });
      } else {
        newMatchResult.categories.forEach((cat) => {
          (newSelections as SelectionState)[cat.id] = null;
        });
      }

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          match_result: newMatchResult,
          selected_products: newSelections,
          is_multi_environment: multiEnvMode,
          // Reset pricing and quality data
          pricing_calculated: false,
          pricing_data: null,
          quality_report_requested: false,
          quality_report_countries: [],
          quality_report_features: [],
          quality_report_price: null,
          quality_report_request_date: null,
          current_stage: 2,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Navigate to products page
      router.push(`/project/${projectId}/products`);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project. Please try again.");
    } finally {
      setIsUpdatingProject(false);
      setShowConfirmUpdateModal(false);
    }
  };

  const handleCreateNewProject = async () => {
    if (!user || !project || !newMatchResult) return;

    setIsCreatingNewProject(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      // Generate new project name
      const baseName = project.name.replace(/\s+\d+$/, '');

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

      const multiEnvMode = isMultiEnvironmentRequest(project.application);

      // Initialize selections
      let newSelections: SelectionState | Record<string, SelectionState> = {};
      if (multiEnvMode) {
        newSelections = {
          mobile: {},
          backend: {},
        };
        newMatchResult.categories.forEach((cat) => {
          (newSelections as Record<string, SelectionState>).mobile[cat.id] = null;
          (newSelections as Record<string, SelectionState>).backend[cat.id] = null;
        });
      } else {
        newMatchResult.categories.forEach((cat) => {
          (newSelections as SelectionState)[cat.id] = null;
        });
      }

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
          additional_notes: project.additional_notes,
          selected_products: newSelections,
          match_result: newMatchResult,
          is_multi_environment: multiEnvMode,
          current_stage: 2,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to new project's products page
      router.push(`/project/${newProject.id}/products`);
    } catch (err) {
      console.error("Failed to create new project:", err);
      alert("Failed to create new project. Please try again.");
    } finally {
      setIsCreatingNewProject(false);
      setShowConfirmUpdateModal(false);
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

  const stages = [
    {
      id: 1,
      name: "Requirements",
      icon: "💬",
      description: "Define your map product requirements",
      href: `/project/${projectId}`,
      isComplete: project.current_stage > 1,
      isCurrent: project.current_stage === 1,
    },
    {
      id: 2,
      name: "Product Selection",
      icon: "📦",
      description: "Select products from recommendations",
      href: `/project/${projectId}/products`,
      isComplete: project.current_stage > 2,
      isCurrent: project.current_stage === 2,
    },
    {
      id: 3,
      name: "Pricing",
      icon: "💰",
      description: "Compare costs across vendors",
      href: `/project/${projectId}/pricing`,
      isComplete: project.current_stage > 3,
      isCurrent: project.current_stage === 3,
    },
    {
      id: 4,
      name: "Quality Evaluation",
      icon: "📊",
      description: "Evaluate quality and request reports",
      href: `/project/${projectId}/quality`,
      isComplete: project.current_stage > 4,
      isCurrent: project.current_stage === 4,
    },
  ];

  const currentStageHref =
    stages.find((s) => s.isCurrent)?.href || `/project/${projectId}/pricing`;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#37352f]">{project.name}</h1>
            <p className="text-[#787774] mt-1">
              {project.use_case_description || project.use_case}
            </p>
          </div>
          <Link
            href={currentStageHref}
            className="px-6 py-3 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors"
          >
            Continue Project →
          </Link>
        </div>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
        <StageIndicator currentStage={project.current_stage} projectId={projectId} />
      </div>

      {/* Project Details & Required Features */}
      {isEditing ? (
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[#37352f]">Edit Requirements</h3>
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-[#787774] bg-[#f7f6f3] hover:bg-[#e9e9e7] rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveRequirements}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#37352f] hover:bg-[#2f2d28] rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </div>

          {/* Warning message */}
          <div className="mb-6 p-4 bg-[rgba(223,171,1,0.1)] border border-[rgba(223,171,1,0.3)] rounded-md">
            <p className="text-sm text-[#b8860b]">
              Note: Changing requirements may affect product recommendations. You may need to re-select products after saving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Project Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#37352f]">Project Details</h4>

              {/* Use Case */}
              <div>
                <label className="block text-sm font-medium text-[#787774] mb-1">
                  Use Case
                </label>
                <select
                  value={USE_CASE_OPTIONS.includes(editUseCase) ? editUseCase : "Other"}
                  onChange={(e) => setEditUseCase(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f]"
                >
                  {USE_CASE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-[#787774] mb-1">
                  Region
                </label>
                <select
                  value={REGION_OPTIONS.includes(editRegion) ? editRegion : "Multiple Regions"}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e9e9e7] rounded-md focus:ring-1 focus:ring-[#37352f] focus:border-[#37352f] text-[#37352f]"
                >
                  {REGION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Type */}
              <div>
                <label className="block text-sm font-medium text-[#787774] mb-2">
                  Application Type
                </label>
                <div className="space-y-2">
                  {APPLICATION_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        editApplication.includes(option.id)
                          ? "border-[#37352f] bg-[#f7f6f3]"
                          : "border-[#e9e9e7] hover:border-[#d3d3d0]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editApplication.includes(option.id)}
                        onChange={() => toggleApplication(option.id)}
                        className="rounded border-[#d3d3d0] text-[#37352f] focus:ring-[#37352f]"
                      />
                      <span className="text-sm text-[#37352f]">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Right column - Required Features */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#37352f]">Required Features</h4>
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {FEATURE_OPTIONS.map((feature) => (
                  <label
                    key={feature}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      editFeatures.includes(feature)
                        ? "bg-[rgba(55,53,47,0.08)] text-[#37352f]"
                        : "bg-[#f7f6f3] hover:bg-[#e9e9e7] text-[#787774]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={editFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="rounded border-[#d3d3d0] text-[#37352f] focus:ring-[#37352f]"
                    />
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
              {editFeatures.length === 0 && (
                <p className="text-sm text-[#b8860b]">
                  Select at least one feature
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#37352f]">Project Details</h3>
              <button
                onClick={startEditing}
                className="text-sm text-[#37352f] hover:underline font-medium"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-[#787774]">Use Case</dt>
                <dd className="text-[#37352f]">{project.use_case}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#787774]">Region</dt>
                <dd className="text-[#37352f]">{project.region}</dd>
              </div>
              <div>
                <dt className="text-sm text-[#787774]">Application Type</dt>
                <dd className="text-[#37352f]">
                  {Array.isArray(project.application)
                    ? project.application.join(", ")
                    : project.application}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[#787774]">Status</dt>
                <dd>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-[rgba(15,123,108,0.15)] text-[#0f7b6c]"
                        : project.status === "in_progress"
                        ? "bg-[rgba(46,170,220,0.15)] text-[#2eaadc]"
                        : "bg-[#f7f6f3] text-[#787774]"
                    }`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#37352f]">Required Features</h3>
              <button
                onClick={startEditing}
                className="text-sm text-[#37352f] hover:underline font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.required_features.length > 0 ? (
                project.required_features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 bg-[#f7f6f3] text-[#37352f] rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))
              ) : (
                <span className="text-[#787774]">No features specified</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Re-match Products Section */}
      {showRematchButton && !isEditing && (
        <div className="bg-[rgba(223,171,1,0.1)] border border-[rgba(223,171,1,0.3)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#b8860b]">Requirements Updated</h3>
              <p className="text-sm text-[#b8860b] mt-1">
                Your requirements have been changed. Would you like to get new product recommendations?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRematchButton(false)}
                className="px-4 py-2 text-sm font-medium text-[#b8860b] hover:text-[#996f00] transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleRematch}
                disabled={isRematching}
                className="px-4 py-2 bg-[#b8860b] hover:bg-[#996f00] text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isRematching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    Re-match Products
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Navigation */}
      <div className="bg-white rounded-lg border border-[#e9e9e7] p-6">
        <h3 className="font-semibold text-[#37352f] mb-4">Project Stages</h3>
        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`flex items-center justify-between p-4 rounded-md border ${
                stage.isCurrent
                  ? "border-[rgba(55,53,47,0.3)] bg-[rgba(55,53,47,0.04)]"
                  : stage.isComplete
                  ? "border-[rgba(15,123,108,0.2)] bg-[rgba(15,123,108,0.05)]"
                  : "border-[#e9e9e7] bg-[#f7f6f3]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    stage.isComplete
                      ? "bg-[rgba(15,123,108,0.15)]"
                      : stage.isCurrent
                      ? "bg-[rgba(55,53,47,0.08)]"
                      : "bg-[#e9e9e7]"
                  }`}
                >
                  {stage.isComplete ? "✓" : stage.icon}
                </div>
                <div>
                  <div className="font-medium text-[#37352f]">{stage.name}</div>
                  <div className="text-sm text-[#787774]">{stage.description}</div>
                </div>
              </div>
              {(stage.isComplete || stage.isCurrent) && (
                stage.id === 1 && !stage.isCurrent ? (
                  <span className="px-4 py-2 rounded-md text-sm font-medium bg-[#e9e9e7] text-[#9b9a97] cursor-not-allowed">
                    Current Page
                  </span>
                ) : (
                  <Link
                    href={stage.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      stage.isCurrent
                        ? "bg-[#37352f] text-white hover:bg-[#2f2d28]"
                        : "bg-white text-[#37352f] border border-[#e9e9e7] hover:bg-[#f7f6f3]"
                    }`}
                  >
                    {stage.isCurrent ? "Continue" : "View"}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timestamps */}
      <div className="text-sm text-[#787774] text-center">
        Created: {new Date(project.created_at).toLocaleDateString()} ·
        Last updated: {new Date(project.updated_at).toLocaleDateString()}
      </div>

      {/* Re-match Results Modal */}
      {showRematchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#f7f6f3] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-[#37352f] mb-2">
                New Recommendations Ready
              </h3>
              <p className="text-[#787774]">
                We found updated product recommendations based on your new requirements.
                How would you like to proceed?
              </p>
            </div>

            {newMatchResult && (
              <div className="bg-[#f7f6f3] rounded-md p-4 mb-6">
                <p className="text-sm text-[#787774]">
                  <strong className="text-[#37352f]">{newMatchResult.total_matched}</strong> products matched across{" "}
                  <strong className="text-[#37352f]">{newMatchResult.categories.length}</strong> categories
                </p>
                <p className="text-sm text-[#787774] mt-1">
                  Feature coverage: <strong className="text-[#37352f]">{newMatchResult.feature_coverage.coverage_percent}%</strong>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleUseNew}
                className="w-full px-4 py-3 bg-[#37352f] text-white font-medium rounded-md hover:bg-[#2f2d28] transition-colors"
              >
                Use New Recommendations
              </button>
              <button
                onClick={handleKeepCurrent}
                className="w-full px-4 py-3 border border-[#e9e9e7] text-[#37352f] font-medium rounded-md hover:bg-[#f7f6f3] transition-colors"
              >
                Keep Current Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Update/Create Modal */}
      {showConfirmUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[rgba(223,171,1,0.15)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-[#37352f] mb-2">
                How to Apply Changes?
              </h3>
              <p className="text-[#787774]">
                Choose whether to update the current project or create a new one
                with the new recommendations.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md p-4">
                <h4 className="font-medium text-[#e03e3e] mb-1">Update Current Project</h4>
                <p className="text-sm text-[#e03e3e]">
                  Warning: This will reset your product selections, pricing data,
                  and quality report requests.
                </p>
              </div>

              <div className="bg-[rgba(15,123,108,0.08)] border border-[rgba(15,123,108,0.2)] rounded-md p-4">
                <h4 className="font-medium text-[#0f7b6c] mb-1">Create New Project</h4>
                <p className="text-sm text-[#0f7b6c]">
                  Creates a new project with the updated recommendations.
                  Your current project will be preserved.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreateNewProject}
                disabled={isCreatingNewProject || isUpdatingProject}
                className="w-full px-4 py-3 bg-[#0f7b6c] text-white font-medium rounded-md hover:bg-[#0a6459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreatingNewProject ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create New Project"
                )}
              </button>
              <button
                onClick={handleUpdateCurrentProject}
                disabled={isCreatingNewProject || isUpdatingProject}
                className="w-full px-4 py-3 bg-[#e03e3e] text-white font-medium rounded-md hover:bg-[#c93535] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingProject ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Current Project"
                )}
              </button>
              <button
                onClick={() => {
                  setShowConfirmUpdateModal(false);
                  setShowRematchModal(true);
                }}
                disabled={isCreatingNewProject || isUpdatingProject}
                className="w-full px-4 py-2 text-[#787774] font-medium hover:text-[#37352f] transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
