"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import StageIndicator from "./StageIndicator";

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  onRename?: (projectId: string, newName: string) => Promise<void>;
}

const STATUS_STYLES = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'In Progress' },
  completed: { bg: 'bg-green-100', text: 'text-green-600', label: 'Completed' },
  quote_requested: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Quote Requested' },
};

export default function ProjectCard({ project, onDelete, onRename }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isSaving, setIsSaving] = useState(false);

  const status = STATUS_STYLES[project.status];
  const formattedDate = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getProjectUrl = () => {
    switch (project.current_stage) {
      case 1:
        return `/project/${project.id}`;
      case 2:
        return `/project/${project.id}/products`;
      case 3:
        return `/project/${project.id}/pricing`;
      case 4:
        return `/project/${project.id}/quality`;
      default:
        return `/project/${project.id}`;
    }
  };

  const handleSaveRename = async () => {
    if (!onRename || editName.trim() === project.name) {
      setIsEditing(false);
      setEditName(project.name);
      return;
    }

    setIsSaving(true);
    try {
      await onRename(project.id, editName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to rename project:", error);
      setEditName(project.name);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(project.name);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                autoFocus
                disabled={isSaving}
                className="text-lg font-semibold text-gray-900 border border-blue-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
              {onRename && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                  title="Rename project"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1 truncate">
            {project.use_case_description || project.use_case}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} ml-2 flex-shrink-0`}
        >
          {status.label}
        </span>
      </div>

      {/* Stage Progress */}
      <div className="mb-4">
        <StageIndicator currentStage={project.current_stage} compact />
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <span>📍</span>
          {project.region}
        </span>
        <span className="flex items-center gap-1">
          <span>📅</span>
          {formattedDate}
        </span>
        {project.required_features.length > 0 && (
          <span className="flex items-center gap-1">
            <span>✨</span>
            {project.required_features.length} features
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <Link
          href={getProjectUrl()}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-medium rounded-lg transition-colors"
        >
          Continue
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(project.id)}
            className="py-2 px-4 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
