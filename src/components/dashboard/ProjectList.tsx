"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onDeleteProject?: (projectId: string) => Promise<void>;
  onRenameProject?: (projectId: string, newName: string) => Promise<void>;
}

type FilterStatus = 'all' | 'draft' | 'in_progress' | 'completed' | 'quote_requested';

export default function ProjectList({ projects, onDeleteProject, onRenameProject }: ProjectListProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No projects yet
        </h3>
        <p className="text-gray-500 mb-6">
          Start by creating your first project to find the best map products for your needs.
        </p>
        <Link
          href="/project/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span>+</span>
          Create New Project
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {filterButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {statusCounts[key] > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                {statusCounts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No projects with status &ldquo;{filter.replace('_', ' ')}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={deletingId === project.id ? 'opacity-50 pointer-events-none' : ''}
            >
              <ProjectCard
                project={project}
                onDelete={onDeleteProject ? handleDelete : undefined}
                onRename={onRenameProject}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
