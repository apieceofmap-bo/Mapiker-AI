"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project } from "@/lib/types";
import PricingComparison from "@/components/compare/PricingComparison";
import FeaturesComparison from "@/components/compare/FeaturesComparison";
import QualityComparison from "@/components/compare/QualityComparison";
import NDAModal from "@/components/compare/NDAModal";

type SectionId = "pricing" | "features" | "quality";

interface SectionInfo {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

const sections: SectionInfo[] = [
  {
    id: "features",
    label: "Features",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "quality",
    label: "Quality",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("features");
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const supabase = createClient();

  // Refs for scroll tracking and PDF content
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    features: null,
    pricing: null,
    quality: null,
  });
  const pdfContentRef = useRef<HTMLDivElement>(null);

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
          .map((id) => data.find((p: Project) => p.id === id))
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

  // Intersection observer for section tracking
  useEffect(() => {
    if (loading || projects.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading, projects.length]);

  const scrollToSection = (sectionId: SectionId) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExportPDF = useCallback(async () => {
    if (!pdfContentRef.current || isExporting) return;

    setIsExporting(true);
    setShowNDAModal(false);

    try {
      // Use browser's native print functionality which handles modern CSS properly
      const projectNames = projects.map((p) => p.name).join(" vs ");
      const filename = `Mapiker_Compare_${projectNames.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}`;

      // Create a new window with the content for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        alert("Please allow popups to export PDF");
        setIsExporting(false);
        return;
      }

      // Get the HTML content
      const content = pdfContentRef.current.innerHTML;

      // Create print-friendly HTML with inline styles
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 12px;
              line-height: 1.5;
              color: #37352f;
              background: #ffffff;
              padding: 20px;
            }
            /* Layout */
            .flex { display: flex; }
            .flex-1 { flex: 1; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .gap-1 { gap: 4px; }
            .gap-2 { gap: 8px; }
            .gap-3 { gap: 12px; }
            .gap-4 { gap: 16px; }
            .grid { display: grid; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .space-y-8 > * + * { margin-top: 32px; }
            /* Spacing */
            .p-2 { padding: 8px; }
            .p-3 { padding: 12px; }
            .p-4 { padding: 16px; }
            .p-8 { padding: 32px; }
            .px-2 { padding-left: 8px; padding-right: 8px; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .py-4 { padding-top: 16px; padding-bottom: 16px; }
            .pl-7 { padding-left: 28px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-1 { margin-top: 4px; }
            .ml-1 { margin-left: 4px; }
            /* Typography */
            .text-xs { font-size: 10px; }
            .text-sm { font-size: 12px; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 18px; }
            .text-4xl { font-size: 32px; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .whitespace-nowrap { white-space: nowrap; }
            /* Colors */
            .text-\\[\\#37352f\\] { color: #37352f; }
            .text-\\[\\#787774\\] { color: #787774; }
            .text-\\[\\#9b9a97\\] { color: #9b9a97; }
            .text-\\[\\#0f7b6c\\] { color: #0f7b6c; }
            .text-\\[\\#e03e3e\\] { color: #e03e3e; }
            .text-\\[\\#2eaadc\\] { color: #2eaadc; }
            .text-\\[\\#92400e\\] { color: #92400e; }
            .text-\\[\\#d3d3d0\\] { color: #d3d3d0; }
            .text-white { color: #ffffff; }
            .bg-white { background-color: #ffffff; }
            .bg-\\[\\#ffffff\\] { background-color: #ffffff; }
            .bg-\\[\\#f7f6f3\\] { background-color: #f7f6f3; }
            .bg-\\[\\#fafafa\\] { background-color: #fafafa; }
            .bg-\\[\\#fffbeb\\] { background-color: #fffbeb; }
            .bg-\\[\\#fef3c7\\] { background-color: #fef3c7; }
            .bg-\\[\\#37352f\\] { background-color: #37352f; }
            /* Borders */
            .border { border: 1px solid #e9e9e7; }
            .border-b { border-bottom: 1px solid #e9e9e7; }
            .border-t { border-top: 1px solid #e9e9e7; }
            .border-\\[\\#e9e9e7\\] { border-color: #e9e9e7; }
            .border-\\[\\#f59e0b\\] { border-color: #f59e0b; }
            .rounded { border-radius: 4px; }
            .rounded-md { border-radius: 6px; }
            .rounded-lg { border-radius: 8px; }
            .rounded-full { border-radius: 9999px; }
            /* Tables */
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e9e9e7; }
            th { background-color: #f7f6f3; font-weight: 600; }
            .table-fixed { table-layout: fixed; }
            /* Misc */
            .min-w-0 { min-width: 0; }
            .w-3 { width: 12px; }
            .w-4 { width: 16px; }
            .w-5 { width: 20px; }
            .w-6 { width: 24px; }
            .w-36 { width: 144px; }
            .w-40 { width: 160px; }
            .w-full { width: 100%; }
            .h-3 { height: 12px; }
            .h-4 { height: 16px; }
            .h-5 { height: 20px; }
            .h-6 { height: 24px; }
            .max-h-40 { max-height: 160px; }
            .overflow-hidden { overflow: hidden; }
            .overflow-x-auto { overflow-x: auto; }
            .overflow-y-auto { overflow-y: auto; }
            .flex-shrink-0 { flex-shrink: 0; }
            .inline-flex { display: inline-flex; }
            .inline { display: inline; }
            .hidden { display: none; }
            /* SVG icons */
            svg { display: inline-block; vertical-align: middle; }
            /* Links - hide for print */
            a { color: inherit; text-decoration: none; }
            /* Print specific */
            @media print {
              body { padding: 0; }
              .pdf-header { display: block !important; }
            }
            /* Page break control */
            .scroll-mt-24 { page-break-inside: avoid; }
            section { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            // Auto-print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [projects, isExporting]);

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

  return (
    <div className="flex gap-6">
      {/* Side Navigation */}
      <aside className="hidden lg:block w-48 flex-shrink-0">
        <div className="sticky top-24">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? "bg-[rgba(55,53,47,0.08)] text-[#37352f]"
                    : "text-[#787774] hover:bg-[rgba(55,53,47,0.04)] hover:text-[#37352f]"
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>

          {/* Export PDF Button */}
          <div className="mt-6 pt-6 border-t border-[#e9e9e7]">
            <button
              onClick={() => setShowNDAModal(true)}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-[#37352f] text-white border border-[#37352f] rounded-md hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* PDF Content Wrapper */}
        <div ref={pdfContentRef} className="pdf-content">
          {/* Confidential Header - visible in PDF export */}
          <div className="pdf-header mb-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fef3c7] border border-[#f59e0b] rounded text-xs text-[#92400e] font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              CONFIDENTIAL - For Internal Use Only
            </div>
          </div>

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
              Comparing {projects.length} projects side-by-side
            </p>
          </div>
        </div>

        {/* Project Names Row */}
        <div className="bg-white rounded-lg border border-[#e9e9e7] p-4 mb-6">
          <div className="flex items-center gap-4">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="flex-1 flex items-center justify-between gap-2 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
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
                <Link
                  href={`/project/${project.id}/pricing`}
                  className="flex-shrink-0 text-xs text-[#2eaadc] hover:underline whitespace-nowrap"
                >
                  Go to Pricing
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* All Sections */}
        <div className="space-y-8">
          {/* Features Section */}
          <section
            id="features"
            ref={(el) => { sectionRefs.current.features = el; }}
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#37352f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h2 className="text-lg font-semibold text-[#37352f]">Features Comparison</h2>
            </div>
            <div className="bg-white rounded-lg border border-[#e9e9e7]">
              <FeaturesComparison projects={projects} />
            </div>
          </section>

          {/* Pricing Section */}
          <section
            id="pricing"
            ref={(el) => { sectionRefs.current.pricing = el; }}
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#37352f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-[#37352f]">Pricing Comparison</h2>
            </div>
            <div className="bg-white rounded-lg border border-[#e9e9e7]">
              <PricingComparison projects={projects} />
            </div>
          </section>

          {/* Quality Section */}
          <section
            id="quality"
            ref={(el) => { sectionRefs.current.quality = el; }}
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#37352f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-lg font-semibold text-[#37352f]">Quality Comparison</h2>
            </div>
            <div className="bg-white rounded-lg border border-[#e9e9e7]">
              <QualityComparison projects={projects} />
            </div>
          </section>
        </div>
        </div>
        {/* End of PDF Content Wrapper */}
      </main>

      {/* NDA Modal */}
      <NDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onAgree={handleExportPDF}
      />
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
