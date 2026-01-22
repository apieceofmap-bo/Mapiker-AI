"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onDeleteProject?: (projectId: string) => Promise<void>;
  onRenameProject?: (projectId: string, newName: string) => Promise<void>;
}

type FilterStatus = 'all' | 'draft' | 'in_progress' | 'completed' | 'quote_requested';

const COMPARE_INTRO_HIDDEN_KEY = 'mapiker_compare_intro_hidden';

export default function ProjectList({ projects, onDeleteProject, onRenameProject }: ProjectListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [showCompareIntro, setShowCompareIntro] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check localStorage for compare intro preference
  useEffect(() => {
    const hidden = localStorage.getItem(COMPARE_INTRO_HIDDEN_KEY);
    if (!hidden && projects.length >= 2) {
      setShowCompareIntro(true);
    }
  }, [projects.length]);

  const handleHideCompareIntro = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem(COMPARE_INTRO_HIDDEN_KEY, 'true');
    }
    setShowCompareIntro(false);
  };

  const handleStartCompareFromIntro = () => {
    setShowCompareIntro(false);
    setCompareMode(true);
  };

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter);

  const handleDelete = async (projectId: string) => {
    if (!onDeleteProject) return;

    if (!confirm('Are you sure you want to delete this project?')) return;

    setDeletingId(projectId);
    try {
      await onDeleteProject(projectId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleCompare = (projectId: string) => {
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else if (next.size < 3) {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.size >= 2) {
      const ids = Array.from(selectedForCompare).join(',');
      router.push(`/compare?projects=${ids}`);
    }
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setSelectedForCompare(new Set());
  };

  const statusCounts = {
    all: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    quote_requested: projects.filter(p => p.status === 'quote_requested').length,
  };

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'draft', label: 'Drafts' },
    { key: 'completed', label: 'Completed' },
    { key: 'quote_requested', label: 'Quote Requested' },
  ];

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-[#37352f] mb-2">
          No projects yet
        </h3>
        <p className="text-[#787774] text-sm mb-6">
          Start by creating your first project to find the best map products for your needs.
        </p>
        <Link
          href="/project/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#37352f] hover:bg-[#2f2d28] text-white font-medium rounded-md transition-colors text-sm"
        >
          <span>+</span>
          Create New Project
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Compare Intro Card - shown for first-time users with 2+ projects */}
      {showCompareIntro && !compareMode && (
        <CompareIntroCard
          onClose={() => handleHideCompareIntro(false)}
          onDontShowAgain={() => handleHideCompareIntro(true)}
          onStartCompare={handleStartCompareFromIntro}
        />
      )}

      {/* Filter Tabs & Compare Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              disabled={compareMode}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-[rgba(55,53,47,0.08)] text-[#37352f]'
                  : 'text-[#787774] hover:bg-[rgba(55,53,47,0.04)] hover:text-[#37352f]'
              } ${compareMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {label}
              {statusCounts[key] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                  filter === key ? 'bg-[#37352f] text-white' : 'bg-[#e9e9e7] text-[#787774]'
                }`}>
                  {statusCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Compare Mode Controls */}
        {!compareMode ? (
          <div className="relative">
            <button
              onClick={() => setCompareMode(true)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              disabled={projects.length < 2}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#f7f6f3] hover:bg-[#e9e9e7] text-[#37352f] border border-[#e9e9e7] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare Projects
            </button>
            {/* Tooltip */}
            {showTooltip && projects.length >= 2 && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#37352f] text-white text-xs rounded-lg shadow-lg z-10">
                <p>Compare 2-3 projects side-by-side to see differences in pricing, features, and quality evaluation.</p>
                <div className="absolute -top-1 right-4 w-2 h-2 bg-[#37352f] rotate-45"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#787774]">
              {selectedForCompare.size}/3 selected
            </span>
            <button
              onClick={handleCancelCompare}
              className="px-3 py-1.5 text-sm font-medium text-[#787774] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.04)] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCompare}
              disabled={selectedForCompare.size < 2}
              className="px-4 py-2 text-sm font-medium bg-[#37352f] text-white rounded-md hover:bg-[#2f2d28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Compare Selected
            </button>
          </div>
        )}
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-[#787774]">
          No projects with status &ldquo;{filter.replace('_', ' ')}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={deletingId === project.id ? 'opacity-50 pointer-events-none' : ''}
            >
              <ProjectCard
                project={project}
                onDelete={onDeleteProject ? handleDelete : undefined}
                onRename={onRenameProject}
                compareMode={compareMode}
                isSelectedForCompare={selectedForCompare.has(project.id)}
                onToggleCompare={handleToggleCompare}
                canSelectMore={selectedForCompare.size < 3}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compare Intro Card Component
interface CompareIntroCardProps {
  onClose: () => void;
  onDontShowAgain: () => void;
  onStartCompare: () => void;
}

function CompareIntroCard({ onClose, onDontShowAgain, onStartCompare }: CompareIntroCardProps) {
  const [dontShow, setDontShow] = useState(false);

  const handleClose = () => {
    if (dontShow) {
      onDontShowAgain();
    } else {
      onClose();
    }
  };

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-[#f7f6f3] to-[#fafafa] border border-[#e9e9e7] rounded-lg relative">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1 text-[#9b9a97] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.08)] rounded transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-[#37352f] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-base font-semibold text-[#37352f] mb-1">
            Compare Projects
          </h3>
          <p className="text-sm text-[#787774] mb-4">
            Select 2-3 projects to compare pricing, features, and quality evaluation side-by-side.
            Make informed decisions with a comprehensive comparison report.
          </p>

          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Don't show again checkbox */}
            <label className="flex items-center gap-2 text-sm text-[#787774] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="w-4 h-4 rounded border-[#d3d3d3] text-[#37352f] focus:ring-[#37352f] focus:ring-offset-0"
              />
              Don&apos;t show again
            </label>

            {/* Start Compare button */}
            <button
              onClick={onStartCompare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#37352f] hover:bg-[#2f2d28] text-white text-sm font-medium rounded-md transition-colors"
            >
              Start Compare
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
