"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { calculateQualityReportPrice } from "@/lib/qualityEvaluationOptions";
import StageIndicator from "@/components/dashboard/StageIndicator";
import CountrySelector from "@/components/quality/CountrySelector";
import FeatureSelector from "@/components/quality/FeatureSelector";
import QualityReportPricing from "@/components/quality/QualityReportPricing";

export default function QualityReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "geocoding_accuracy",
  ]);
  const [contactEmail, setContactEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/project/${projectId}/quality/report`);
      return;
    }

    // Set email from user
    setContactEmail(user.email || "");

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

  const handleSubmit = async () => {
    if (!user || !project) return;
    if (selectedCountries.length === 0 || selectedFeatures.length === 0) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Database not configured");

      const totalPrice = calculateQualityReportPrice(
        selectedCountries.length,
        selectedFeatures.length
      );

      // Save to quality_report_requests table
      const { error: insertError } = await supabase
        .from("quality_report_requests")
        .insert({
          project_id: projectId,
          user_id: user.id,
          countries: selectedCountries,
          features: selectedFeatures,
          total_price: totalPrice,
          contact_email: contactEmail,
          company_name: companyName,
          additional_notes: additionalNotes,
          status: "pending",
        });

      if (insertError) throw insertError;

      // Update project status
      await supabase
        .from("projects")
        .update({
          quality_report_requested: true,
          quality_report_countries: selectedCountries,
          quality_report_features: selectedFeatures,
          quality_report_price: totalPrice,
          quality_report_request_date: new Date().toISOString(),
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

  const isValid =
    selectedCountries.length > 0 &&
    selectedFeatures.length > 0 &&
    contactEmail.trim() !== "";

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
          Quote Request Submitted!
        </h2>
        <p className="text-gray-600 mb-8">
          Thank you for your interest in our Quality Report. Our sales team will
          review your request and contact you at <strong>{contactEmail}</strong>{" "}
          within 1-2 business days.
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
          <span className="text-gray-900">Quality Report</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Configure Quality Report
        </h1>
        <p className="text-gray-500 mt-1">
          Select countries and features to include in your quality analysis
          report
        </p>
      </div>

      {/* Stage Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StageIndicator currentStage={4} projectId={projectId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Country Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <CountrySelector
              selectedCountries={selectedCountries}
              onChange={setSelectedCountries}
            />
          </div>

          {/* Feature Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <FeatureSelector
              selectedFeatures={selectedFeatures}
              onChange={setSelectedFeatures}
              countryCount={selectedCountries.length}
            />
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Contact Information
            </h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Any specific requirements or questions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Price Summary */}
        <div className="space-y-6">
          <div className="sticky top-8">
            <QualityReportPricing
              selectedCountries={selectedCountries}
              selectedFeatures={selectedFeatures}
            />

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Request Quote
                    <span>→</span>
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-3">
                Our team will contact you with the final quote
              </p>
            </div>

            {/* Back Link */}
            <Link
              href={`/project/${projectId}/quality`}
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
            >
              ← Back to options
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
